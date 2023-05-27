import SupabaseClient from "https://esm.sh/v96/@supabase/supabase-js@2.0.0-rc.12/dist/module/SupabaseClient";

import {
  isValidLicenseCache,
  isValidLicense,
  obtainGumroadLicense,
  obtainRCLicense,
} from "./utils.ts";

async function obtainStatus(
  userId: string,
  force: boolean,
  client: SupabaseClient
) {
  // PROFILE USER
  const profiles = await client!.from("profiles").select().eq("id", userId);
  const profile = profiles.data![0];

  if (profile?.id == null) {
    console.error(`null profile.id -> ${userId}`);
  }

  let license = profile?.license_cache ?? null;

  // validate license cache
  if (force || !isValidLicenseCache(license)) {
    // validate revenuecat
    license = await obtainRCLicense(userId);
    // validate gumroad
    if (!isValidLicense(license)) {
      license = await obtainGumroadLicense(profile?.gumroad_license_key);
    }
  }

  // if we're in free mode
  if (!isValidLicense(license)) {
    license = {
      source: "none",
      entitlementId: "free",
      licenseKey: "",
      data: {},
      trial: false,
      updated_at: new Date(),
    };
  }

  // UPDATE LICENSE CACHE
  await client!
    .from("profiles")
    .update({
      license_cache: license,
    })
    .eq("id", userId);

  // let maxEdits = 0;

  // for first time and free users
  if (license.entitlementId == "free") {
    // maxEdits = 100;
  } else if (license.entitlementId == "starter") {
    // maxEdits = 50;
  } else if (license.entitlementId == "plus") {
    // maxEdits = 150;
  } else if (license.entitlementId == "pro") {
    // maxEdits = 500;
  } else if (license.entitlementId == "max") {
    // maxEdits = 2500;
  } else if (license.entitlementId == "business") {
    // maxEdits = 10000;
  } else if (license.entitlementId == "unlimited") {
    // maxEdits = 1000000000;
  }

  // PERIOD USAGE

  return {
    license: license,
    // TODO: pass the premium values to the client to sync realtime
    others: {
      force: force,
      profile_id: profile?.id ?? "none",
      rc_user_id: profile?.revenuecat_user_id ?? "none",
    },
  };
}

export { obtainStatus };
