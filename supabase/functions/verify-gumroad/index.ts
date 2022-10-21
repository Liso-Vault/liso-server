import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { respond } from "../_shared/response.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  
  const product = "liso-pro";
  const { licenseKey } = await req.json();

  const url = `https://api.gumroad.com/v2/licenses/verify?product_permalink=${product}&license_key=${licenseKey}`;

  const response = await fetch(url, {
    method: "POST",
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

  const purchase = gumroadResponse.purchase;

  const entitled =
    !purchase.refunded &&
    !purchase.subscription_ended_at &&
    !purchase.subscription_cancelled_at &&
    !purchase.subscription_failed_at;

  const d = new Date(Date.parse(purchase.sale_timestamp));
  const year = d.getFullYear();
  const month = d.getMonth();
  const day = d.getDate();

  return respond(200, {
    entitled: entitled,
    expires_at: new Date(year + 1, month, day),
  });
});
