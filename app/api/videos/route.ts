import {
  S3Client,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

function getR2PublicBaseUrl() {
  const value =
    process.env.R2_PUBLIC_URL?.trim() ||
    "https://pub-9f44a5b7fcfc49d9bfc9c9840bae1714.r2.dev";

  return value.replace(/\/+$/, "");
}

const s3 = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const publicBaseUrl = getR2PublicBaseUrl();
    const data = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
      })
    );

    const videos =
      data.Contents?.map((item) => ({
        key: item.Key,
        url: `${publicBaseUrl}/${item.Key}`,
      })) || [];

    return NextResponse.json({ videos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
