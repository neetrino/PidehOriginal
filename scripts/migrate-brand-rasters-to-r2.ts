import fs from "node:fs/promises";
import path from "node:path";

import {
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";
import sharp from "sharp";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

const RASTER_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp"]);
const BRAND_DIR = path.join(process.cwd(), "public", "brand", "pideh");
const WEBP_QUALITY = 82;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

async function main(): Promise<void> {
  const accountId = requireEnv("R2_ACCOUNT_ID");
  const bucketName = requireEnv("R2_BUCKET_NAME");
  const endpoint =
    process.env.R2_ENDPOINT?.replace(/\/$/, "") ??
    `https://${accountId}.r2.cloudflarestorage.com`;

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: {
      accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
    },
  });

  const entries = await fs.readdir(BRAND_DIR);
  const rasters = entries.filter((name) =>
    RASTER_EXT.has(path.extname(name).toLowerCase()),
  );

  if (rasters.length === 0) {
    console.log("no raster files in public/brand/pideh");
    return;
  }

  for (const name of rasters) {
    const sourcePath = path.join(BRAND_DIR, name);
    const stem = path.basename(name, path.extname(name));
    const objectKey = `brand/pideh/${stem}.webp`;
    const body = await sharp(sourcePath).webp({ quality: WEBP_QUALITY }).toBuffer();
    await client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: body,
        ContentType: "image/webp",
      }),
    );
    await fs.unlink(sourcePath);
    console.log(`uploaded ${objectKey} and removed ${name}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
