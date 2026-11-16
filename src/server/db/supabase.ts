import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

/**
 * Cliente Supabase do servidor, autenticado com a chave secreta (ignora RLS).
 * Nunca deve ser importado em código de cliente.
 */
export function getSupabase(): SupabaseClient {
  if (client) return client;

  const url = process.env.SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Variáveis SUPABASE_URL e SUPABASE_SECRET_KEY não configuradas. Veja .env.example.",
    );
  }

  client = createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  return client;
}
