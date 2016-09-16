import crypto from 'crypto';

export default function gen(len = 4, enc = 'hex') {
  return crypto.randomBytes(len).toString(enc);
}
