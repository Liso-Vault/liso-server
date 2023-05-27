import { createClient } from "https://esm.sh/v96/@supabase/supabase-js@2.0.0-rc.12/dist/module/index";

function supabaseClient(token: string) {
  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: token } },
    }
  );
  return client;
}

export { supabaseClient };
