import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { respond } from "../_shared/response.ts";
import { s3 } from "../_shared/s3.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const { address, objects } = await req.json();

  // if invalid params
  if (!address || address.length < 42 || !objects) {
    return respond(400, {}, [
      {
        code: 1,
        message: "Invalid parameters",
      },
    ]);
  }

  for (const e of objects) {
    await s3.deleteObject(`${address}/${encodeURI(e)}`);
  }

  return respond();
});
