import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.0.0-rc.12";
import { corsHeaders } from "../_shared/cors.ts";
import { respond } from "../_shared/response.ts";

serve(async (req) => {
  // For flutter web
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const client = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    }
  );

  // AUTH
  const {
    data: { user },
  } = await client.auth.getUser();

  // PARAMS
  const { rcUserId, device, address, email, phone, userMetadata, metadata } =
    await req.json();

  // UPSERT PROFILE
  const upsertProfileRes = await client!
    .from("profiles")
    .upsert({
      id: user?.id,
      revenuecat_user_id: rcUserId,
      address: address,
      email: email,
      phone: phone,
      user_metadata: userMetadata,
      metadata: metadata,
      updated_at: "now()",
    })
    .select();

  console.log(`\nupsert profiles! ${JSON.stringify(upsertProfileRes.data)}`);

  // UPSERT DEVICE
  const upsertDeviceRes = await client!
    .from("devices")
    .upsert({
      id: device.id,
      user_id: user?.id,
      data: device,
      updated_at: "now()",
    })
    .select();

  console.log(`\nupsert devices! ${JSON.stringify(upsertDeviceRes.data)}`);

  // INSERT SESSION
  const insertSessionRes = await client!
    .from("sessions")
    .insert({
      user_id: user?.id,
      device_id: device.id,
    })
    .select();

  console.log(`\ninsert sessions! ${JSON.stringify(insertSessionRes.data)}`);

  return respond(200, {
    profileId: upsertProfileRes.data![0].id,
    deviceId: upsertDeviceRes.data![0].id,
    sessionId: insertSessionRes.data![0].id,
    licenseKey: upsertProfileRes.data![0].gumroad_license_key,
    rcUserId: upsertProfileRes.data![0].revenuecat_user_id,
  });
});
