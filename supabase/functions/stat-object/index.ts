import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { respond } from "../_shared/response.ts";
import { s3 } from "../_shared/s3.ts";

serve(async (req) => {
  const { address, object } = await req.json();

  // if invalid params
  if (!address || address.length < 42 || !object) {
    return respond(400, {}, [
      {
        code: 1,
        message: "Invalid parameters",
      },
    ]);
  }

  try {
    const status = await s3.statObject(`${address}/${object}`);
    return respond(200, status);
  } catch (_) {
    return respond(400, {}, [
      {
        code: 1,
        message: "Object not found",
      },
    ]);
  }
});
