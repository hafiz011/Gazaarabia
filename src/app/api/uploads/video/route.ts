import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";

const MAX_VIDEO_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_TYPES = ["video/mp4", "video/webm"];

export async function POST(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const folder = searchParams.get("folder") || "variant-videos";

        const formData = await req.formData();
        const files = formData.getAll("files") as File[];

        if (!files || files.length === 0) {
            return NextResponse.json({ error: "No video provided" }, { status: 400 });
        }

        const urls: string[] = [];

        for (const file of files) {
            // TYPE CHECK
            if (!ALLOWED_TYPES.includes(file.type)) {
                return NextResponse.json(
                    { error: "Only MP4 or WEBM videos allowed" },
                    { status: 400 }
                );
            }

            //  SIZE CHECK
            if (file.size > MAX_VIDEO_SIZE) {
                return NextResponse.json(
                    { error: "Video must be under 15MB" },
                    { status: 400 }
                );
            }

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const ext = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}.${ext}`;

            const uploadDir = path.join(process.cwd(), "uploads", folder);
            await fs.mkdir(uploadDir, { recursive: true });

            const filePath = path.join(uploadDir, fileName);
            await fs.writeFile(filePath, buffer);

            urls.push(`/uploads/${folder}/${fileName}`);
        }

        return NextResponse.json({ urls });
    } catch (error) {
        console.error("VIDEO UPLOAD ERROR:", error);
        return NextResponse.json(
            { error: "Video upload failed" },
            { status: 500 }
        );
    }
}
