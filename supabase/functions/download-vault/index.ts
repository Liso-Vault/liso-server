// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

import { serve } from "https://deno.land/std@0.131.0/http/server.ts";
import { S3Client } from "https://deno.land/x/s3_lite_client@0.2.0/mod.ts";

serve(async (req) => {
  const s3 = new S3Client({
    accessKey: Deno.env.get("S3_ACCESS_KEY")!,
    secretKey: Deno.env.get("S3_SECRET_KEY")!,
    endPoint: Deno.env.get("S3_ENDPOINT")!,
    region: Deno.env.get("S3_REGION")!,
    bucket: Deno.env.get("S3_BUCKET")!,
    pathStyle: true,
    useSSL: true,
  });

  s3.getObject;

  for await (const obj of s3.listObjects()) {
    console.log(obj);
  }

  const { name } = await req.json();

  const data = {
    message: `Hello ${name}!`,
  };

  return new Response(JSON.stringify(data), {
    headers: { "Content-Type": "application/json" },
  });
});
