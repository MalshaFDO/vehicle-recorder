import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";
import { getR2Endpoint, getR2ObjectKey } from "@/lib/r2";

const s3 = new S3Client({
  region: "auto",
  endpoint: getR2Endpoint(),
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
});

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const rawVehicleNumber = formData.get("vehicleNumber") as string;
    const vehicleNumber = rawVehicleNumber?.trim().toUpperCase();

    if (!file || !vehicleNumber) {
      return NextResponse.json(
        { error: "Missing file or vehicle number" },
        { status: 400 }
      );
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileName = getR2ObjectKey(vehicleNumber);

    await s3.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileName,
        Body: buffer,
        ContentType: file.type,
      })
    );

    return NextResponse.json({ success: true, fileName });
  } catch (err) {
    console.error(err);
    const message = err instanceof Error ? err.message : "Upload failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
