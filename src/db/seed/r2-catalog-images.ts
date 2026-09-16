import path from "node:path";

import { HeadObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { config as loadEnv } from "dotenv";

loadEnv({ path: path.resolve(process.cwd(), ".env") });

export type CatalogR2Image = {
  objectKey: string;
  byteSize: number;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
}

let cachedR2: { client: S3Client; bucket: string } | undefined;

function getCatalogR2Client(): { client: S3Client; bucket: string } {
  if (cachedR2) {
    return cachedR2;
  }

  const accountId = requireEnv("R2_ACCOUNT_ID");
  cachedR2 = {
    bucket: requireEnv("R2_BUCKET_NAME"),
    client: new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: requireEnv("R2_ACCESS_KEY_ID"),
        secretAccessKey: requireEnv("R2_SECRET_ACCESS_KEY"),
      },
    }),
  };
  return cachedR2;
}

/** Confirms a catalog product object already exists on R2. */
export async function headCatalogProductImage(
  objectKey: string,
): Promise<CatalogR2Image> {
  const { client, bucket } = getCatalogR2Client();
  try {
    const head = await client.send(
      new HeadObjectCommand({ Bucket: bucket, Key: objectKey }),
    );
    return { objectKey, byteSize: head.ContentLength ?? 0 };
  } catch {
    throw new Error(`R2 object missing: ${objectKey}`);
  }
}
