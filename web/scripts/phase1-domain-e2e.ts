import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  PrismaClient,
  QualificationStatus,
  MembershipRole,
} from "@prisma/client";

// Simple Phase 1 domain E2E without browser
const prisma = new PrismaClient();

async function main() {
  const vendor = await prisma.user.findUniqueOrThrow({
    where: { email: "vendor@acme.ai" },
    include: { memberships: true },
  });
  const underwriter = await prisma.user.findUniqueOrThrow({
    where: { email: "underwriter@harborins.com" },
  });
  const questionnaire = await prisma.questionnaireDefinition.findFirstOrThrow({
    where: { key: "ai_risk_soc_v1" },
    include: { questions: true },
  });

  const product = await prisma.aiProduct.create({
    data: {
      organizationId: vendor.memberships[0].organizationId,
      name: "ACME MRI Diagnostic",
      description: "MRI decision support",
      category: "Medical imaging",
      versions: {
        create: {
          version: "v2",
          releaseNotes: "Improved sensitivity",
          qualificationCase: {
            create: {
              questionnaireId: questionnaire.id,
              status: QualificationStatus.DRAFT,
              reviewEvents: {
                create: {
                  actorId: vendor.id,
                  toStatus: QualificationStatus.DRAFT,
                  note: "Created",
                },
              },
            },
          },
        },
      },
    },
    include: {
      versions: { include: { qualificationCase: true } },
    },
  });

  const version = product.versions[0];
  const caseId = version.qualificationCase!.id;

  for (const q of questionnaire.questions) {
    let value = "Sample answer for diligence.";
    if (q.inputType === "BOOLEAN") value = "true";
    if (q.inputType === "SELECT") {
      const opts = JSON.parse(q.optionsJson) as string[];
      value = opts[0] ?? "Yes";
    }
    await prisma.questionnaireAnswer.create({
      data: { caseId, questionId: q.id, value },
    });
  }

  const storageKey = path.join(caseId, "demo-aiuc.txt");
  const full = path.join(process.cwd(), "uploads", storageKey);
  await mkdir(path.dirname(full), { recursive: true });
  await writeFile(full, "Demo AIUC evidence pack");

  await prisma.evidenceAsset.create({
    data: {
      caseId,
      uploadedById: vendor.id,
      filename: "demo-aiuc.txt",
      contentType: "text/plain",
      sizeBytes: 22,
      storageKey,
      label: "AIUC report",
    },
  });

  await prisma.qualificationCase.update({
    where: { id: caseId },
    data: {
      status: QualificationStatus.SUBMITTED,
      submittedAt: new Date(),
    },
  });
  await prisma.reviewEvent.create({
    data: {
      caseId,
      actorId: vendor.id,
      fromStatus: QualificationStatus.DRAFT,
      toStatus: QualificationStatus.SUBMITTED,
      note: "Submitted",
    },
  });

  await prisma.qualificationCase.update({
    where: { id: caseId },
    data: { status: QualificationStatus.IN_REVIEW },
  });
  await prisma.reviewEvent.create({
    data: {
      caseId,
      actorId: underwriter.id,
      fromStatus: QualificationStatus.SUBMITTED,
      toStatus: QualificationStatus.IN_REVIEW,
      note: "Started review",
    },
  });

  await prisma.qualificationCase.update({
    where: { id: caseId },
    data: {
      status: QualificationStatus.QUALIFIED,
      lastReviewNote: "Approved for Harbor appetite",
    },
  });
  await prisma.reviewEvent.create({
    data: {
      caseId,
      actorId: underwriter.id,
      fromStatus: QualificationStatus.IN_REVIEW,
      toStatus: QualificationStatus.QUALIFIED,
      note: "Approved for Harbor appetite",
    },
  });

  const shared = await prisma.qualificationCase.findUniqueOrThrow({
    where: { id: caseId },
    include: {
      answers: true,
      evidenceAssets: true,
      productVersion: { include: { product: true } },
    },
  });

  console.log(
    JSON.stringify(
      {
        ok: true,
        caseId,
        status: shared.status,
        product: shared.productVersion.product.name,
        version: shared.productVersion.version,
        answers: shared.answers.length,
        evidence: shared.evidenceAssets.length,
        roleCheck: {
          vendorRole: MembershipRole.VENDOR,
          underwriterRole: MembershipRole.UNDERWRITER,
        },
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
