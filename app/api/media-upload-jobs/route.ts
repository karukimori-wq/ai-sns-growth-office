import { NextResponse } from "next/server";
import { approvalRequests, mediaAssets, mediaUploadJobs } from "../../../src/domain/seed.mjs";
import { createXMediaUploadJob } from "../../../src/domain/workflow.mjs";

export function GET() {
  return NextResponse.json({ mediaUploadJobs });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const mediaAsset = mediaAssets.find((item) => item.id === body.mediaAssetId);
  const imageApproval = approvalRequests.find((item) => item.id === body.imageApprovalId);

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
