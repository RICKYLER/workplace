import { NextRequest, NextResponse } from "next/server";

export const revalidate = 60; // Cache responses for 60 seconds

export interface InventoryItem {
  id: string;
  name: string;
  category: "Piano Inventory Goods" | "Personal Asset" | "Shop Asset";
  price: number;
  status: "Available" | "Reserved" | "Sold";
  description: string;
  location: string;
  notes: string;
  images: string[];
  createdTime: string;
}

// Fallback high-quality curated piano & asset imagery
const FALLBACK_IMAGES: Record<string, string[]> = {
  "Piano Inventory Goods": [
    "https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1552422535-c45813c61732?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1571974599782-87624638275e?auto=format&fit=crop&w=1000&q=80"
  ],
  "Personal Asset": [
    "https://images.unsplash.com/photo-1513883049090-d0b7439799bf?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80"
  ],
  "Shop Asset": [
    "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=1000&q=80",
    "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80"
  ]
};

export async function GET(req: NextRequest) {
  const token = process.env.AIRTABLE_API_TOKEN || "";
  const baseId = process.env.AIRTABLE_BASE_ID || "appZXsrxksqmSnake";
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Piano Inventory";

  const { searchParams } = new URL(req.url);
  const isFresh = searchParams.get("fresh") === "true";

  if (!token) {
    return NextResponse.json({
      error: "AIRTABLE_API_TOKEN is missing in environment variables",
      source: "fallback",
      records: []
    }, { status: 500 });
  }

  try {
    const url = `https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}?sort[0][field]=Name&sort[0][direction]=asc`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      cache: isFresh ? "no-store" : "default",
      ...(isFresh ? {} : { next: { revalidate: 60 } })
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Airtable API Error:", errText);
      return NextResponse.json(
        { error: `Airtable API error: ${res.statusText}`, details: errText },
        { status: res.status }
      );
    }

    const data = await res.json();
    const rawRecords = data.records || [];

    const formattedRecords: InventoryItem[] = rawRecords.map((r: any, idx: number) => {
      const f = r.fields || {};
      
      // Parse attachments or assign fallback photos
      let images: string[] = [];
      if (Array.isArray(f.Attachments) && f.Attachments.length > 0) {
        images = f.Attachments.map((att: any) => att.url || att.thumbnails?.large?.url).filter(Boolean);
      }
      
      const category: "Piano Inventory Goods" | "Personal Asset" | "Shop Asset" =
        f.Category === "Personal Asset"
          ? "Personal Asset"
          : f.Category === "Shop Asset"
          ? "Shop Asset"
          : "Piano Inventory Goods";

      if (images.length === 0) {
        const fallbacks = FALLBACK_IMAGES[category] || FALLBACK_IMAGES["Piano Inventory Goods"];
        images = [fallbacks[idx % fallbacks.length]];
      }

      return {
        id: r.id,
        name: f.Name || f.name || "Untitled Product",
        category,
        price: typeof f.Price === "number" ? f.Price : parseFloat(f.Price) || 0,
        status: f.Status === "Sold" ? "Sold" : f.Status === "Reserved" ? "Reserved" : "Available",
        description: f.Description || f.Notes || "Premium item managed in RHPS Airtable Inventory.",
        location: f.Location || "Main Showroom",
        notes: f.Notes || "",
        images,
        createdTime: r.createdTime || new Date().toISOString()
      };
    });

    return NextResponse.json({
      success: true,
      source: "airtable",
      baseId,
      tableName,
      totalRecords: formattedRecords.length,
      lastSynced: new Date().toISOString(),
      records: formattedRecords
    });
  } catch (error: any) {
    console.error("Failed to fetch Airtable inventory:", error);
    return NextResponse.json(
      { error: "Internal Server Error fetching Airtable data", message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const token = process.env.AIRTABLE_API_TOKEN || "";
  const baseId = process.env.AIRTABLE_BASE_ID || "appZXsrxksqmSnake";
  const tableName = process.env.AIRTABLE_TABLE_NAME || "Piano Inventory";

  if (!token) {
    return NextResponse.json({ error: "Missing Airtable Token" }, { status: 500 });
  }

  try {
    const body = await req.json();
    const { name, category, price, status, description, location, notes, imageUrl, images } = body;

    if (!name) {
      return NextResponse.json({ error: "Item Name is required" }, { status: 400 });
    }

    let attachmentList: { url: string }[] = [];
    if (Array.isArray(images) && images.length > 0) {
      attachmentList = images.map((u: string) => ({ url: u })).filter((item: any) => item.url && item.url.startsWith("http"));
    } else if (imageUrl && typeof imageUrl === "string" && imageUrl.startsWith("http")) {
      attachmentList = [{ url: imageUrl }];
    }

    const payload = {
      records: [
        {
          fields: {
            Name: name,
            Category: category || "Piano Inventory Goods",
            Price: Number(price) || 0,
            Status: status || "Available",
            Description: description || "",
            Location: location || "Main Showroom",
            Notes: notes || "",
            ...(attachmentList.length > 0 ? { Attachments: attachmentList } : {})
          }
        }
      ]
    };

    const res = await fetch(`https://api.airtable.com/v0/${baseId}/${encodeURIComponent(tableName)}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "Failed to create item in Airtable", details: errText }, { status: res.status });
    }

    const result = await res.json();
    return NextResponse.json({ success: true, createdRecord: result.records?.[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
