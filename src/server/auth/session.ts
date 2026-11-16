import "server-only";

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { cache } from "react";

/**
 * Sessão stateless: um JWT (HS256, assinado com `SESSION_SECRET`) guardado
 * em cookie httpOnly. Contrato definido na Fase 0 (plans/_orquestracao.md) —
 * as assinaturas abaixo NÃO devem mudar, Feedback e o header dependem delas.
 */
export type Session = {
  accountId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export const SESSION_COOKIE = "session";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000;
const ALGORITHM = "HS256";

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET não está definido no ambiente.");
  }
  return new TextEncoder().encode(secret);
}

/** Cria a sessão e grava o cookie httpOnly. */
export async function createSession(data: Session): Promise<void> {
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);

  const token = await new SignJWT({
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
  })
    .setProtectedHeader({ alg: ALGORITHM })
    .setSubject(data.accountId)
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(getSecretKey());

  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/**
 * Lê e valida o cookie de sessão. Retorna null se ausente, inválido ou expirado.
 * `cache` evita decodificar o JWT mais de uma vez no mesmo request.
 */
export const getSession = cache(async (): Promise<Session | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSecretKey(), {
      algorithms: [ALGORITHM],
    });
    const { sub, firstName, lastName, email } = payload;
    if (
      typeof sub !== "string" ||
      typeof firstName !== "string" ||
      typeof lastName !== "string" ||
      typeof email !== "string"
    ) {
      return null;
    }
    return { accountId: sub, firstName, lastName, email };
  } catch {
    // Assinatura inválida, token malformado ou expirado.
    return null;
  }
});

/** Remove o cookie de sessão. */
export async function deleteSession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}
