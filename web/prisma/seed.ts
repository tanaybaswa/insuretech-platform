import {
  PrismaClient,
  OrgType,
  MembershipRole,
  QuestionInputType,
} from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

const QUESTIONS: {
  prompt: string;
  helpText?: string;
  inputType: QuestionInputType;
  required?: boolean;
  options?: string[];
}[] = [
  {
    prompt: "What decisions does this AI product make, and what value is at risk?",
    helpText: "Describe the decision type and potential financial/liability impact.",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "Which environments is this product version intended to run in?",
    helpText: "e.g. hospital PACS, factory edge, cloud SaaS.",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "Is human oversight required before acting on model output?",
    inputType: QuestionInputType.SELECT,
    options: ["Always", "Sometimes", "Never"],
  },
  {
    prompt: "Describe known failure modes and estimated failure rates for this version.",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "What logging / audit trail exists for each inference or decision?",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "Can the product report model version and usage counts to an external monitor?",
    inputType: QuestionInputType.BOOLEAN,
  },
  {
    prompt: "Summarize access controls for who may invoke the model.",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "Have you completed an independent AI assurance or AIUC-style assessment?",
    inputType: QuestionInputType.SELECT,
    options: ["Yes — report attached", "In progress", "Not yet"],
  },
  {
    prompt: "List residual risks you expect an underwriter to price against.",
    inputType: QuestionInputType.TEXTAREA,
  },
  {
    prompt: "Primary contact for underwriting diligence",
    inputType: QuestionInputType.TEXT,
  },
];

async function main() {
  await prisma.reviewEvent.deleteMany();
  await prisma.evidenceAsset.deleteMany();
  await prisma.questionnaireAnswer.deleteMany();
  await prisma.qualificationCase.deleteMany();
  await prisma.aiProductVersion.deleteMany();
  await prisma.aiProduct.deleteMany();
  await prisma.questionnaireQuestion.deleteMany();
  await prisma.questionnaireDefinition.deleteMany();
  await prisma.membership.deleteMany();
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();

  const passwordHash = await hash("password123", 10);

  const vendorOrg = await prisma.organization.create({
    data: { name: "Acme Diagnostics", type: OrgType.VENDOR },
  });

  const underwriterOrg = await prisma.organization.create({
    data: { name: "Harbor Underwriting", type: OrgType.UNDERWRITER },
  });

  await prisma.organization.create({
    data: { name: "Northshore Hospital", type: OrgType.INSURED },
  });

  const vendorUser = await prisma.user.create({
    data: {
      email: "vendor@acme.ai",
      name: "Alex Vendor",
      passwordHash,
      memberships: {
        create: {
          organizationId: vendorOrg.id,
          role: MembershipRole.VENDOR,
        },
      },
    },
  });

  const underwriterUser = await prisma.user.create({
    data: {
      email: "underwriter@harborins.com",
      name: "Jordan Underwriter",
      passwordHash,
      memberships: {
        create: {
          organizationId: underwriterOrg.id,
          role: MembershipRole.UNDERWRITER,
        },
      },
    },
  });

  const questionnaire = await prisma.questionnaireDefinition.create({
    data: {
      key: "ai_risk_soc_v1",
      version: 1,
      title: "AI Risk Qualification (SOC-like) v1",
      questions: {
        create: QUESTIONS.map((q, index) => ({
          sortOrder: index + 1,
          prompt: q.prompt,
          helpText: q.helpText ?? "",
          inputType: q.inputType,
          required: q.required ?? true,
          optionsJson: JSON.stringify(q.options ?? []),
        })),
      },
    },
  });

  console.log("Seeded users:");
  console.log(`  vendor:      ${vendorUser.email} / password123`);
  console.log(`  underwriter: ${underwriterUser.email} / password123`);
  console.log(
    `Questionnaire: ${questionnaire.title} (${QUESTIONS.length} questions)`,
  );
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
