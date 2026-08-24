import { NextResponse } from "next/server";
import { repository } from "../../../src/domain/repository.mjs";
import { createXMediaUploadJob } from "../../../src/domain/workflow.mjs";

export function GET() {
  return NextResponse.json({ mediaUploadJobs: repository.listMediaUploadJobs() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mediaAsset = repository.getMediaAssetById(body.mediaAssetId);
  const imageApproval = repository.getApprovalById(body.imageApprovalId);

  if (!mediaAsset) {
    return NextResponse.json({ error: "media_asset_not_found" }, { status: 404 });
  }

  if (!imageApproval) {
    return NextResponse.json({ error: "image_approval_not_found" }, { status: 404 });
  }

  try {
    const job = createXMediaUploadJob({
      id: body.id ?? `x_media_upload_${mediaAsset.id}`,
      mediaAssetId: mediaAsset.id,
      imageApproval
    });

    return NextResponse.json({ mediaUploadJob: job }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "invalid_media_upload_job" }, { status: 409 });
  }
}
