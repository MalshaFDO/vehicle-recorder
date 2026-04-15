import {
  S3Client,
  ListObjectsV2Command,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";

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
    const list = await s3.send(
      new ListObjectsV2Command({
        Bucket: process.env.R2_BUCKET_NAME!,
      })
    );

    const now = new Date();

    if (list.Contents) {
      for (const item of list.Contents) {
        const key = item.Key!;
        
        // 👉 get folder name (YYYY-MM-DD)
        const folder = key.split("/")[0];

        const folderDate = new Date(folder);

        const diffDays =
          (now.getTime() - folderDate.getTime()) / (1000 * 60 * 60 * 24);

        // 🧨 delete entire folder items if older than 10 days
        if (diffDays > 7) {
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