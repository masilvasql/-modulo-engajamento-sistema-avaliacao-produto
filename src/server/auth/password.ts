import "server-only";

import bcrypt from "bcrypt";

/** Cost factor do bcrypt (2^12 rounds, ~250 ms por hash). */
const SALT_ROUNDS = 12;

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hash = await bcrypt.hash(password, salt);
  return { hash, salt };
}

export function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}
