"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { QualificationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  assertVendorOwnsCase,
  getActiveQuestionnaire,
  isCaseEditable,
  loadCaseById,
  UNDERWRITER_VISIBLE,
  computeCompleteness,
  type SessionUser,
} from "@/lib/qualification/types";
import { saveUploadFile } from "@/lib/qualification/storage";

async function requireSession(): Promise<SessionUser> {
  const session = await auth();
  if (!session?.user) {
    throw new Error("Unauthorized");
  }
  return session.user;
}

export async function createProductAction(formData: FormData) {
  const user = await requireSession();
  if (user.role !== "VENDOR") {
    throw new Error("Forbidden");
  }

  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const category = String(formData.get("category") ?? "").trim();
  const version = String(formData.get("version") ?? "").trim() || "v1";
  const releaseNotes = String(formData.get("releaseNotes") ?? "").trim();

  if (!name) {
    throw new Error("Product name is required");
  }

  const questionnaire = await getActiveQuestionnaire();

  const product = await prisma.aiProduct.create({
    data: {
      organizationId: user.organizationId,
      name,
      description,
      category,
      versions: {
        create: {
          version,
          releaseNotes,
          qualificationCase: {
            create: {
              questionnaireId: questionnaire.id,
              status: QualificationStatus.DRAFT,
              reviewEvents: {
                create: {
                  actorId: user.id,
                  fromStatus: null,
                  toStatus: QualificationStatus.DRAFT,
                  note: "Qualification case created",
                },
              },
            },
          },
        },
      },
    },
    include: { versions: true },
  });

  const versionId = product.versions[0].id;
  redirect(`/vendor/products/${product.id}/versions/${versionId}`);
}

export async function saveAnswersAction(caseId: string, formData: FormData) {
  const user = await requireSession();
  if (user.role !== "VENDOR") {
    throw new Error("Forbidden");
  }

  const record = await assertVendorOwnsCase(user, caseId);
  if (!isCaseEditable(record.status)) {
    throw new Error("Case is not editable");
  }

  const questionIds = record.questionnaire.questions.map((q) => q.id);
  await prisma.$transaction(
    questionIds.map((questionId) => {
      const value = String(formData.get(`answer_${questionId}`) ?? "");
      return prisma.questionnaireAnswer.upsert({
        where: {
          caseId_questionId: { caseId, questionId },
        },
        create: { caseId, questionId, value },
        update: { value },
      });
    }),
  );

  revalidatePath(`/vendor/products/${record.productVersion.productId}/versions/${record.productVersionId}`);
  revalidatePath(`/underwriter/qualifications/${caseId}`);
}

export async function uploadEvidenceAction(caseId: string, formData: FormData) {
  const user = await requireSession();
  if (user.role !== "VENDOR") {
    throw new Error("Forbidden");
  }

  const record = await assertVendorOwnsCase(user, caseId);
  if (!isCaseEditable(record.status)) {
    throw new Error("Case is not editable");
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    throw new Error("File is required");
  }

  const label = String(formData.get("label") ?? "").trim();
  const bytes = Buffer.from(await file.arrayBuffer());
  const saved = await saveUploadFile({
    caseId,
    originalName: file.name,
    bytes,
  });

  await prisma.evidenceAsset.create({
    data: {
      id: saved.assetId,
      caseId,
      uploadedById: user.id,
      filename: saved.safeName,
      contentType: file.type || "application/octet-stream",
      sizeBytes: bytes.length,
      storageKey: saved.storageKey,
      label: label || saved.safeName,
    },
  });

  revalidatePath(`/vendor/products/${record.productVersion.productId}/versions/${record.productVersionId}`);
  revalidatePath(`/underwriter/qualifications/${caseId}`);
}

export async function submitCaseAction(caseId: string) {
  const user = await requireSession();
  if (user.role !== "VENDOR") {
    throw new Error("Forbidden");
  }

  const record = await assertVendorOwnsCase(user, caseId);
  if (!isCaseEditable(record.status)) {
    throw new Error("Case is not editable");
  }

  const answersByQuestionId = new Map(
    record.answers.map((a) => [a.questionId, a.value]),
  );
  const completeness = computeCompleteness(
    record.questionnaire.questions,
    answersByQuestionId,
    record.evidenceAssets.length,
  );
  if (!completeness.canSubmit) {
    throw new Error(
      "Complete all required questions and upload at least one evidence file before submitting.",
    );
  }

  const fromStatus = record.status;
  await prisma.$transaction([
    prisma.qualificationCase.update({
      where: { id: caseId },
      data: {
        status: QualificationStatus.SUBMITTED,
        submittedAt: new Date(),
        lastReviewNote: "",
      },
    }),
    prisma.reviewEvent.create({
      data: {
        caseId,
        actorId: user.id,
        fromStatus,
        toStatus: QualificationStatus.SUBMITTED,
        note:
          fromStatus === QualificationStatus.NEEDS_INFO
            ? "Vendor resubmitted after needs-info"
            : "Vendor submitted for review",
      },
    }),
  ]);

  revalidatePath(`/vendor/products/${record.productVersion.productId}/versions/${record.productVersionId}`);
  revalidatePath("/underwriter/qualifications");
  revalidatePath(`/underwriter/qualifications/${caseId}`);
}

export async function startReviewAction(caseId: string) {
  const user = await requireSession();
  if (user.role !== "UNDERWRITER") {
    throw new Error("Forbidden");
  }

  const record = await loadCaseById(caseId);
  if (!record || !UNDERWRITER_VISIBLE.includes(record.status)) {
    throw new Error("Case not found");
  }
  if (record.status !== QualificationStatus.SUBMITTED) {
    throw new Error("Only submitted cases can move to in review");
  }

  await prisma.$transaction([
    prisma.qualificationCase.update({
      where: { id: caseId },
      data: { status: QualificationStatus.IN_REVIEW },
    }),
    prisma.reviewEvent.create({
      data: {
        caseId,
        actorId: user.id,
        fromStatus: QualificationStatus.SUBMITTED,
        toStatus: QualificationStatus.IN_REVIEW,
        note: "Underwriter started review",
      },
    }),
  ]);

  revalidatePathsForCase(record.productVersion.productId, record.productVersionId, caseId);
}

export async function qualifyCaseAction(caseId: string, formData: FormData) {
  const user = await requireSession();
  if (user.role !== "UNDERWRITER") {
    throw new Error("Forbidden");
  }

  const note = String(formData.get("note") ?? "").trim();
  const record = await loadCaseById(caseId);
  if (!record || record.status !== QualificationStatus.IN_REVIEW) {
    throw new Error("Case must be in review to qualify");
  }

  await prisma.$transaction([
    prisma.qualificationCase.update({
      where: { id: caseId },
      data: {
        status: QualificationStatus.QUALIFIED,
        lastReviewNote: note,
      },
    }),
    prisma.reviewEvent.create({
      data: {
        caseId,
        actorId: user.id,
        fromStatus: QualificationStatus.IN_REVIEW,
        toStatus: QualificationStatus.QUALIFIED,
        note: note || "Qualified by underwriter",
      },
    }),
  ]);

  revalidatePathsForCase(record.productVersion.productId, record.productVersionId, caseId);
}

export async function requestInfoAction(caseId: string, formData: FormData) {
  const user = await requireSession();
  if (user.role !== "UNDERWRITER") {
    throw new Error("Forbidden");
  }

  const note = String(formData.get("note") ?? "").trim();
  if (!note) {
    throw new Error("A note is required when requesting more info");
  }

  const record = await loadCaseById(caseId);
  if (!record || record.status !== QualificationStatus.IN_REVIEW) {
    throw new Error("Case must be in review to request info");
  }

  await prisma.$transaction([
    prisma.qualificationCase.update({
      where: { id: caseId },
      data: {
        status: QualificationStatus.NEEDS_INFO,
        lastReviewNote: note,
      },
    }),
    prisma.reviewEvent.create({
      data: {
        caseId,
        actorId: user.id,
        fromStatus: QualificationStatus.IN_REVIEW,
        toStatus: QualificationStatus.NEEDS_INFO,
        note,
      },
    }),
  ]);

  revalidatePathsForCase(record.productVersion.productId, record.productVersionId, caseId);
}

function revalidatePathsForCase(
  productId: string,
  versionId: string,
  caseId: string,
) {
  revalidatePath(`/vendor/products/${productId}/versions/${versionId}`);
  revalidatePath("/vendor/products");
  revalidatePath("/underwriter/qualifications");
  revalidatePath(`/underwriter/qualifications/${caseId}`);
}
