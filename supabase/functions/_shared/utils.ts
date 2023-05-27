import { _generateLinkResponse } from "https://esm.sh/v96/@supabase/gotrue-js@2.0.0-rc.10/dist/module/lib/fetch.d.ts";

function addHours(hours: number, date = new Date()) {
  date.setTime(date.getTime() + hours * 60 * 60 * 1000);

  return date;
}

async function obtainRCLicense(userId: string) {
  if (!userId) return;

  const response = await fetch(
    `https://api.revenuecat.com/v1/subscribers/${userId}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${Deno.env.get("REVENUECAT_API_KEY")!}`,
      },
    }
  );

  const rcResponse = await response.json();
  // console.log(`rc user: ${userId} -> ${JSON.stringify(rcResponse)}`);

  if (rcResponse.code != null) {
    console.error(`rc error: ${JSON.stringify(rcResponse)}`);
    // either user not found or another error
    return null;
  }

  const subscriber = rcResponse.subscriber;
  const entitlements = subscriber.entitlements;

  const license = {
    source: "revenuecat",
    entitlementId: "",
    data: entitlements,
    licenseKey: "",
    trial: true,
    updated_at: new Date(),
  };

  // check if one of the entitlement is valid
  if (Object.keys(entitlements).length > 0) {
    const { max, pro, plus, starter } = entitlements;

    if (max != null && new Date(max.expires_date) > new Date()) {
      license.entitlementId = "max";
      license.trial =
        subscriber.subscriptions[max.product_identifier].period_type == "trial";
    }  else if (pro != null && new Date(pro.expires_date) > new Date()) {
      license.entitlementId = "pro";
      license.trial =
        subscriber.subscriptions[pro.product_identifier].period_type == "trial";
    } else if (plus != null && new Date(plus.expires_date) > new Date()) {
      license.entitlementId = "plus";
      license.trial =
        subscriber.subscriptions[plus.product_identifier].period_type ==
        "trial";
    } else if (starter != null && new Date(starter.expires_date) > new Date()) {
      license.entitlementId = "starter";
      license.trial =
        subscriber.subscriptions[starter.product_identifier].period_type ==
        "trial";
    }
  }

  return license;
}

async function obtainGumroadLicense(licenseKey: string) {
  if (!licenseKey) return;
  // console.info(`obtaining gumroad license: ${licenseKey}`);

  const product = "liso-pro";
  const url = `https://api.gumroad.com/v2/licenses/verify?product_permalink=${product}&license_key=${licenseKey}`;

  const response = await fetch(url, {
    method: "POST",
  });

  const gumroadResponse = await response.json();
  // console.info(`gumroad license: ${licenseKey} -> ${JSON.stringify(gumroadResponse)}`);

  if (!gumroadResponse.success) {
    console.error(`gumroad error: ${gumroadResponse.message}! ${licenseKey}`);
    return null;
  }

  const purchase = gumroadResponse.purchase;

  const entitled =
    !purchase.refunded &&
    !purchase.subscription_ended_at &&
    // !purchase.subscription_cancelled_at &&
    !purchase.subscription_failed_at;

  const license = {
    source: "gumroad",
    entitlementId: entitled ? "pro" : "",
    licenseKey: licenseKey,
    data: purchase,
    trial: false, // TODO: identify if trial or not
    updated_at: new Date(),
  };

  return license;
}

// deno-lint-ignore no-explicit-any
function isValidLicense(_license: any) {
  return _license != null && _license.entitlementId != "";
}

// deno-lint-ignore no-explicit-any
function isValidLicenseCache(_license: any) {
  return (
    _license != null && addHours(10, new Date(_license.updated_at)) > new Date()
  );
}

export {
  addHours,
  obtainRCLicense,
  obtainGumroadLicense,
  isValidLicense,
  isValidLicenseCache,
};
