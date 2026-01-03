const s = new Error("invalid unicode");
function u(e) {
  return 0 <= e && e < 55296 || 57343 < e && e <= 1114111;
}
function i(e) {
  const t = [];
  for (const o of e)
    o < 128 ? t.push(o & 255) : o < 16384 ? (t.push(o >> 7 & 255), t.push((128 | o & 127) & 255)) : (t.push(o >> 14 & 255), t.push((128 | o >> 7 & 127) & 255), t.push((128 | o & 127) & 255));
  return new Uint8Array(t);
}
function x(e) {
  const t = [];
  for (let o = 0; o < e.length; o++) {
    const r = e.charCodeAt(o);
    if (r >= 55296 && r <= 57343 && o + 1 < e.length) {
      const c = e.charCodeAt(o + 1), n = (r - 55296 << 10) + (c - 56320) + 65536;
      t.push(n), o++;
    } else
      t.push(r);
  }
  return i(t);
}
function R(e) {
  const o = new TextDecoder("utf-8").decode(e);
  return x(o);
}
function h(e) {
  const t = e.length;
  if (t === 0)
    throw s;
  let o = -1;
  for (let f = 0; f < t; f++)
    if ((e[f] & 128) === 0) {
      o = f;
      break;
    }
  if (o === -1 || t - o === 0)
    throw s;
  const c = [];
  let n = 0;
  for (let f = o; f < t; f++) {
    const d = e[f];
    if (d >> 7 === 0) {
      if (f > o) {
        if (!u(n))
          throw s;
        c.push(n);
      }
      n = d;
    } else {
      if (n > 8703)
        throw s;
      n = n << 7 | d & 127;
    }
  }
  if (!u(n))
    throw s;
  return c.push(n), c;
}
function l(e) {
  const t = h(e);
  let o = "";
  for (const r of t)
    if (r <= 65535)
      o += String.fromCharCode(r);
    else {
      const c = r - 65536, n = 55296 + (c >> 10), f = 56320 + (c & 1023);
      o += String.fromCharCode(n, f);
    }
  return o;
}
function A(e) {
  const t = l(e);
  return new TextEncoder("utf-8").encode(t);
}
export {
  h as decode,
  A as decodeToBytes,
  l as decodeToString,
  i as encode,
  R as encodeFromBytes,
  x as encodeFromString
};
