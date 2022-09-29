import { S3Client } from "https://deno.land/x/s3_lite_client@0.2.0/mod.ts";

const s3 = new S3Client({
  accessKey: Deno.env.get("S3_ACCESS_KEY")!,
  secretKey: Deno.env.get("S3_SECRET_KEY")!,
  endPoint: Deno.env.get("S3_ENDPOINT")!,
  region: Deno.env.get("S3_REGION")!,
  bucket: Deno.env.get("S3_BUCKET")!,
  pathStyle: true,
  useSSL: true,
});

export { s3 };
