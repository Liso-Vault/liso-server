import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { respond } from "../_shared/response.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const productId = "liso-pro";
  const url = `https://api.gumroad.com/v2/products/${productId}?&access_token=${Deno.env.get(
    "GUMROAD_ACCESS_TOKEN"
  )!}`;

  // PARAMS
  const { languageCode } = await req.json();
  console.info(`languageCode: ${languageCode}`);

  const response = await fetch(url, {
    method: "GET",
  });

  const gumroadResponse = await response.json();

  if (!gumroadResponse.success) {
    return respond(400, {}, [
      {
        code: 1,
        message: gumroadResponse.message,
      },
    ]);
  }

  return respond(200, gumroadResponse);
});
