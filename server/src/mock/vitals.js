// server/src/mock/vitals.js
// Realistic vitals generator with staggered anomalies per patient

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const jitter = (v, amt) => v + (Math.random() - 0.5) * amt * 2;
const nowMs = () => Date.now();

// Clinically-plausible baseline profiles
const PROFILES = {
  stable:   { hr:72, spo2:98, resp:16, bpSys:118, bpDia:76, vol:{hr:2,  spo2:0.3, 
resp:0.6, bpSys:2,   bpDia:1.8} },
  postop:   { hr:85, spo2:97, resp:18, bpSys:125, bpDia:82, vol:{hr:3,  spo2:0.5, 
resp:0.8, bpSys:3,   bpDia:2.2} },
  copdlike: { hr:80, spo2:94, resp:20, bpSys:122, bpDia:80, vol:{hr:2.5,spo2:0.8, 
resp:1.0, bpSys:2.5, bpDia:2.0} },
  anxious:  { hr:95, spo2:98, resp:18, bpSys:130, bpDia:85, vol:{hr:3.5,spo2:0.4, 
resp:0.9, bpSys:3,   bpDia:2.4} },
};

// Hard clamps
const LIMITS = {
  hr:    [50, 160],
  spo2:  [85, 100],
  resp:  [8,  28],
  bpSys: [85, 180],
  bpDia: [50, 110],
};

// Episode templates (temporary shifts)
const EPISODES = [
  // brief desat + tachypnea (e.g., sensor issue or real)
  { key: "desat", durMs:[7000,14000],   effects:{ spo2:-4, resp:+3 } },
  // pain/anxiety: tachycardia + slight BP rise
  { key: "tachy", durMs:[8000,16000],   effects:{ hr:+18, bpSys:+8, bpDia:+6 } },
  // hypotension blip
  { key: "hypo",  durMs:[6000,12000],   effects:{ bpSys:-15, bpDia:-10 } },
  // bradypnea moment
  { key: "bradyR",durMs:[6000,10000],   effects:{ resp:-4 } },
];

// Random in [a,b]
const randBetween = (a,b) => a + Math.random() * (b - a);

// Exponential-ish gap (Poisson arrivals). Mean gap = MEAN_GAP_MS.
const MEAN_GAP_MS = Number(process.env.MP_MEAN_GAP_MS || 25000);
function nextGapMs() {
  const u = Math.random();
  return Math.max(5000, -Math.log(1 - u) * MEAN_GAP_MS);
}

export function makePatient(id, name, profileKey="stable", startOffsetMs=0) {
  const prof = PROFILES[profileKey] ?? PROFILES.stable;
  const t0 = nowMs() + startOffsetMs;
  return {
    id, name, profileKey,
    // current values start at baseline
    hr: prof.hr, spo2: prof.spo2, resp: prof.resp, bpSys: prof.bpSys, bpDia: 
prof.bpDia,
    // episode state
    episode: null,              // { key, endsAt, effects }
    nextEpisodeAt: t0 + nextGapMs(),
    refractoryUntil: 0,         // while > now, don't start new episodes
  };
}

// Smoothly pull v toward baseline + additive episode effect
function relaxToward(value, target, rate=0.15) {
  return value + (target - value) * rate;
}

function pickEpisode() {
  const tpl = EPISODES[Math.floor(Math.random()*EPISODES.length)];
  const dur  = randBetween(tpl.durMs[0], tpl.durMs[1]);
  return { key: tpl.key, endsAt: nowMs() + dur, effects: tpl.effects };
}

export function stepVitals(p) {
  const prof = PROFILES[p.profileKey] ?? PROFILES.stable;
  const t = nowMs();

  // decide whether to start/stop an episode
  if (p.episode && t >= p.episode.endsAt) {
    // episode ended
    p.episode = null;
    p.refractoryUntil = t + 4000 + Math.random()*4000; // 4–8s calm-down
    p.nextEpisodeAt = t + nextGapMs();                 // schedule next
  } else if (!p.episode && t >= p.nextEpisodeAt && t >= p.refractoryUntil) {
    p.episode = pickEpisode();
  }

  // baseline drift + small noise
  let hr    = jitter(relaxToward(p.hr,    prof.hr),    prof.vol.hr);
  let spo2  = jitter(relaxToward(p.spo2,  prof.spo2),  prof.vol.spo2);
  let resp  = jitter(relaxToward(p.resp,  prof.resp),  prof.vol.resp);
  let bpSys = jitter(relaxToward(p.bpSys, prof.bpSys), prof.vol.bpSys);
  let bpDia = jitter(relaxToward(p.bpDia, prof.bpDia), prof.vol.bpDia);

  // apply episode effects (with smooth approach)
  if (p.episode) {
    const e = p.episode.effects;
    if (e.hr)    hr    = relaxToward(hr,    prof.hr + e.hr,     0.25);
    if (e.spo2)  spo2  = relaxToward(spo2,  prof.spo2 + e.spo2, 0.25);
    if (e.resp)  resp  = relaxToward(resp,  prof.resp + e.resp, 0.25);
    if (e.bpSys) bpSys = relaxToward(bpSys, prof.bpSys + e.bpSys,0.25);
    if (e.bpDia) bpDia = relaxToward(bpDia, prof.bpDia + e.bpDia,0.25);
  }

  // clamp to safe bounds
  [hr, spo2, resp, bpSys, bpDia] = [
    clamp(Math.round(hr),    LIMITS.hr[0],    LIMITS.hr[1]),
    clamp(Math.round(spo2),  LIMITS.spo2[0],  LIMITS.spo2[1]),
    clamp(Math.round(resp),  LIMITS.resp[0],  LIMITS.resp[1]),
    clamp(Math.round(bpSys), LIMITS.bpSys[0], LIMITS.bpSys[1]),
    clamp(Math.round(bpDia), LIMITS.bpDia[0], LIMITS.bpDia[1]),
  ];

  // persist & return
  p.hr = hr; p.spo2 = spo2; p.resp = resp; p.bpSys = bpSys; p.bpDia = bpDia;
  return { ...p };
}

