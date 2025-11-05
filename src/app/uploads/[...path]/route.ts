import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(req: Request, { params }: any) {
  try {
    const filePath = path.join(process.cwd(), "uploads", ...params.path);
    const file:any = await fs.readFile(filePath);

    const ext = path.extname(filePath).slice(1);
    const mime = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      webp: "image/webp",
      gif: "image/gif",
    }[ext] || "application/octet-stream";

    return new Response(file, {
      headers: { "Content-Type": mime },
    });

  } catch (err) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
}
