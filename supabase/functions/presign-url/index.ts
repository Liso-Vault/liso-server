import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { respond } from "../_shared/response.ts";
import { s3 } from "../_shared/s3.ts";

serve(async (req) => {
  const { address, object, method, expirySeconds } = await req.json();

  // if invalid params
  if (!address || address.length < 42 || !object || !method || !expirySeconds) {
    return respond(400, {}, [
      {
        code: 1,
        message: "Invalid parameters",
      },
    ]);
  }

  const url = await s3.getPresignedUrl(method, `${address}/${object}`, {
    expirySeconds: expirySeconds,
  });

  const expirationTimestamp = Date.now() + expirySeconds * 1000;
  const expirationDate = new Date(expirationTimestamp).toISOString();

  return respond(200, {
    url: url,
    method: method,
    expirationDate: expirationDate,
  });
});
