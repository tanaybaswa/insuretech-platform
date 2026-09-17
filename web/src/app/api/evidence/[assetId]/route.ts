import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { assertCanViewCase } from "@/lib/qualification/types";
import { absoluteUploadPath } from "@/lib/qualification/storage";

export async function GET(
  _req: Request,
  context: { params: Promise<{ assetId: string }> },
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { assetId } = await context.params;
  const asset = await prisma.evidenceAsset.findUnique({
    where: { id: assetId },
  });
  if (!asset) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await assertCanViewCase(session.user, asset.caseId);
  } catch {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const bytes = await readFile(absoluteUploadPath(asset.storageKey));
    return new NextResponse(bytes, {
      headers: {
        "Content-Type": asset.contentType,
        "Content-Disposition": `attachment; filename="${asset.filename}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "File missing" }, { status: 404 });
  }
}
