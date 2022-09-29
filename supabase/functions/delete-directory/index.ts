import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { _internalMethods } from "https://deno.land/x/s3_lite_client@0.2.0/signing.ts";
import { respond } from "../_shared/response.ts";
import { s3 } from "../_shared/s3.ts";

serve(async (req) => {
  const { address, path } = await req.json();

  // if invalid params
  if (!address || address.length < 42 || !path) {
    return respond(400, {}, [
      {
        code: 1,
        message: "Invalid parameters",
      },
    ]);
  }

  const listObjects = s3.listObjects({
    prefix: `${address}/${path}`,
  });

  for await (const e of listObjects) {
    s3.deleteObject(e.key);
  }

  return respond();
});
