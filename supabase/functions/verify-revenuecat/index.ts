import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { respond } from "../_shared/response.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  const { userId } = await req.json();

  const rcAPIKey = Deno.env.get("REVENUECAT_API_KEY")!;
  const url = `https://api.revenuecat.com/v1/subscribers/${userId}`;

  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${rcAPIKey}`,
    },
  });

  const rcResponse = await response.json();
  const pro = rcResponse.subscriber.entitlements.pro;


  return respond(200, {
    entitled: pro != null,
    expires_at: pro?.expires_date,
  });
});
