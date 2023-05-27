import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { _generateLinkResponse } from "https://esm.sh/v96/@supabase/gotrue-js@2.0.0-rc.10/dist/module/lib/fetch.d.ts";
import { supabaseClient } from "../_shared/client.ts";

import { corsHeaders } from "../_shared/cors.ts";
import { obtainStatus } from "../_shared/status.ts";
import { respond } from "../_shared/response.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const authToken = req.headers.get("Authorization")!;
  const client = supabaseClient(authToken);

  // AUTH USER
  const {
    data: { user },
  } = await client.auth.getUser();

  const params = await req.json();
  const status = await obtainStatus(user!.id, params.force, client);
  return respond(200, status);
});
