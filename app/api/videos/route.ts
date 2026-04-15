import {
  S3Client,
  ListObjectsV2Command,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getR2Endpoint, getR2PublicBaseUrl } from "@/lib/r2";

const s3 = new S3Client({
  region: "auto",
  endpoint: getR2Endpoint(),
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
      data.Contents?.slice()
        .sort((a, b) => {
          const timeA = a.LastModified?.getTime() ?? 0;
          const timeB = b.LastModified?.getTime() ?? 0;

          if (timeA !== timeB) {
            return timeB - timeA;
          }

          return (b.Key ?? "").localeCompare(a.Key ?? "");
        })
        .map((item) => ({
          key: item.Key,
          url: `${publicBaseUrl}/${item.Key}`,
        })) || [];

    return NextResponse.json({ videos });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
