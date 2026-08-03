import { desc } from "drizzle-orm";
import { getDb } from "../../../db";
import { projects } from "../../../db/schema";

export async function GET() {
  try {
    const db = await getDb();
    const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(100);
    return Response.json({ projects: rows });
  } catch {
    return Response.json({ projects: [], databaseReady: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Record<string, unknown>;
    const client = String(body.client ?? "").trim();
    const model = String(body.model ?? "").trim();
    const agent = String(body.agent ?? "").trim();
    if (!client || !model || !agent) {
      return Response.json({ error: "Client, model, and agent are required." }, { status: 400 });
    }
    const reference = `CV-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`;
    const db = await getDb();
    const [project] = await db.insert(projects).values({
      reference,
      client,
      model,
      agent,
      manager: String(body.manager ?? "Robespierre T. Agir"),
      quantity: Math.max(1, Number(body.quantity) || 1),
      targetDelivery: String(body.targetDelivery ?? ""),
      nextAction: String(body.nextAction ?? ""),
      stage: Number(body.stage) || 1,
      priority: String(body.priority ?? "Normal"),
      progress: 12,
    }).returning();
    return Response.json({ project }, { status: 201 });
  } catch {
    return Response.json({ error: "The database is still being prepared. Please try again shortly." }, { status: 503 });
  }
}
