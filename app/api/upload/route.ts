import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `photo-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${ext}`;
    
    // Save to public/uploads folder
    const publicUploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(publicUploadsDir, { recursive: true });

    const filePath = path.join(publicUploadsDir, filename);
    await writeFile(filePath, buffer);

    // Construct accessible URL
    const origin = req.headers.get("origin") || req.headers.get("host") || "localhost:3000";
    const protocol = origin.startsWith("http") ? "" : "http://";
    const fileUrl = `${protocol}${origin}/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      filename,
      url: fileUrl
    });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message || "Failed to upload photo" }, { status: 500 });
  }
}
