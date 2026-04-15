import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextRequest, NextResponse } from "next/server";

function getR2Endpoint() {
  const value = process.env.R2_ACCOUNT_ID?.trim();

  if (!value) {
    throw new Error("Missing R2_ACCOUNT_ID environment variable");
  }

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}.r2.cloudflarestorage.com`;
}

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
    const today = new Date().toISOString().split("T")[0];

    const fileName = `${today}/${vehicleNumber}-${Date.now()}.webm`;

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
