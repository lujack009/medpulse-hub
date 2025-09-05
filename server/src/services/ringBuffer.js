export class RingBuffer {
  constructor(capacity = 600) { // ~10 min @ 1s
    this.buf = new Array(capacity);
    this.cap = capacity;
    this.head = 0;
    this.len = 0;
  }
  push(item) {
    this.buf[this.head] = item;
    this.head = (this.head + 1) % this.cap;
    this.len = Math.min(this.len, this.cap - 1) + 1;
  }
  toArray() {
    const out = [];
    const start = (this.head - this.len + this.cap) % this.cap;
    for (let i = 0; i < this.len; i++) {
      out.push(this.buf[(start + i) % this.cap]);
    }
    return out;
  }
}

