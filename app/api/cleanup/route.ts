import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import { getFolderAgeInDays, getR2Endpoint } from "@/lib/r2";

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
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
      })
    );

    const now = new Date();

    if (list.Contents) {
      for (const item of list.Contents) {
        const key = item.Key!;
        const folder = key.split("/")[0];
        const diffDays = getFolderAgeInDays(folder, now);

        if (diffDays !== null && diffDays > 7) {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.R2_BUCKET_NAME!,
              Key: key,
            })
          );

          console.log("Deleted:", key);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
