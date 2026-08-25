import { NextResponse } from "next/server";
import { createNumeriaXDraftFromInstruction, decomposeCeoInstruction } from "../../../src/domain/orchestration.mjs";
import { repository } from "../../../src/domain/repository-runtime.mjs";

export async function GET() {
  return NextResponse.json({ instructions: await repository.listCeoInstructions() });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const now = body.createdAt ?? new Date().toISOString();
  const instruction = await repository.saveCeoInstruction({
    id: body.id ?? `instruction_${now.replaceAll(/[^0-9]/g, "").slice(0, 14)}`,
    appProjectId: body.appProjectId ?? "app_numeria_studio",
    title: body.title ?? "社長指示",
    body: body.body ?? "Numeria Studioの毎日X運用を進める",
    requestedBy: "ceo",
    status: "decomposed",
    createdAt: now,
    decompositionSummary: "秘書AIが顧客理解、SNS戦略、投稿制作、画像方針、分析へタスク分解しました。"
  });
  const employeeTasks = [];

  for (const task of decomposeCeoInstruction(instruction)) {
    employeeTasks.push(await repository.saveEmployeeTask(task));
  }

  const contentDraft = await repository.saveContentDraft(
    createNumeriaXDraftFromInstruction({
      id: `draft_x_${instruction.id}`,
      appProjectId: instruction.appProjectId,
      instructionId: instruction.id
    })
  );

  return NextResponse.json({ instruction, employeeTasks, contentDraft }, { status: 201 });
}
