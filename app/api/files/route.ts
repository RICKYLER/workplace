import { getDb } from "../../../db";
import { files } from "../../../db/schema";

export async function POST(request: Request) {
  try {
    const { env } = await import("cloudflare:workers");
    const data = await request.formData();
    const upload = data.get("file");
    if (!(upload instanceof File)) {
      return Response.json({ error: "Choose a file to upload." }, { status: 400 });
    }
    if (upload.size > 15 * 1024 * 1024) {
      return Response.json({ error: "Maximum file size is 15 MB." }, { status: 400 });
    }
    const safeName = upload.name.replace(/[^a-zA-Z0-9._-]/g, "-");
    const objectKey = `uploads/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
    await env.BUCKET.put(objectKey, await upload.arrayBuffer(), {
      httpMetadata: { contentType: upload.type || "application/octet-stream" },
    });
    const db = await getDb();
    const [record] = await db.insert(files).values({
      objectKey,
      fileName: upload.name,
      contentType: upload.type || "application/octet-stream",
      size: upload.size,
      projectReference: String(data.get("projectReference") ?? ""),
      category: String(data.get("category") ?? "Other"),
    }).returning();
    return Response.json({ file: record }, { status: 201 });
  } catch {
    return Response.json({ error: "File storage is still being prepared." }, { status: 503 });
  }
}
