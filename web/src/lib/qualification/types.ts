import {
  QualificationStatus,
  QuestionInputType,
  type MembershipRole,
} from "@prisma/client";
import { prisma } from "@/lib/db";

export const EDITABLE_STATUSES: QualificationStatus[] = [
  QualificationStatus.DRAFT,
  QualificationStatus.NEEDS_INFO,
];

export const UNDERWRITER_VISIBLE: QualificationStatus[] = [
  QualificationStatus.SUBMITTED,
  QualificationStatus.IN_REVIEW,
  QualificationStatus.QUALIFIED,
  QualificationStatus.NEEDS_INFO,
];

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: MembershipRole;
  organizationId: string;
  organizationName: string;
};

export function isCaseEditable(status: QualificationStatus) {
  return EDITABLE_STATUSES.includes(status);
}

export function statusLabel(status: QualificationStatus) {
  switch (status) {
    case QualificationStatus.DRAFT:
      return "Draft";
    case QualificationStatus.SUBMITTED:
      return "Submitted";
    case QualificationStatus.IN_REVIEW:
      return "In review";
    case QualificationStatus.QUALIFIED:
      return "Qualified";
    case QualificationStatus.NEEDS_INFO:
      return "Needs info";
    default:
      return status;
  }
}

export type CaseView = {
  caseId: string;
  status: QualificationStatus;
  statusLabel: string;
  lastReviewNote: string;
  submittedAt: string | null;
  canEdit: boolean;
  canSubmit: boolean;
  requiredQuestionsTotal: number;
  requiredQuestionsAnswered: number;
  evidenceCount: number;
  product: {
    id: string;
    name: string;
    description: string;
    category: string;
    organizationId: string;
    organizationName: string;
  };
  version: {
    id: string;
    version: string;
    releaseNotes: string;
  };
  questionnaire: {
    id: string;
    title: string;
    questions: {
      id: string;
      prompt: string;
      helpText: string;
      inputType: QuestionInputType;
      required: boolean;
      options: string[];
      answer: string;
    }[];
  };
  evidence: {
    id: string;
    filename: string;
    label: string;
    contentType: string;
    sizeBytes: number;
    createdAt: string;
  }[];
  timeline: {
    id: string;
    fromStatus: QualificationStatus | null;
    toStatus: QualificationStatus;
    note: string;
    createdAt: string;
    actorName: string;
  }[];
};

function answerComplete(value: string, inputType: QuestionInputType) {
  if (inputType === QuestionInputType.BOOLEAN) {
    return value === "true" || value === "false";
  }
  return value.trim().length > 0;
}

export function computeCompleteness(
  questions: { id: string; required: boolean; inputType: QuestionInputType }[],
  answersByQuestionId: Map<string, string>,
  evidenceCount: number,
) {
  const required = questions.filter((q) => q.required);
  const requiredAnswered = required.filter((q) =>
    answerComplete(answersByQuestionId.get(q.id) ?? "", q.inputType),
  ).length;

  return {
    requiredQuestionsTotal: required.length,
    requiredQuestionsAnswered: requiredAnswered,
    evidenceCount,
    canSubmit:
      requiredAnswered === required.length &&
      required.length > 0 &&
      evidenceCount >= 1,
  };
}

const caseInclude = {
  productVersion: {
    include: {
      product: { include: { organization: true } },
    },
  },
  questionnaire: {
    include: {
      questions: { orderBy: { sortOrder: "asc" as const } },
    },
  },
  answers: true,
  evidenceAssets: { orderBy: { createdAt: "desc" as const } },
  reviewEvents: {
    orderBy: { createdAt: "desc" as const },
    include: { actor: true },
  },
} as const;

export async function getActiveQuestionnaire() {
  const questionnaire = await prisma.questionnaireDefinition.findFirst({
    where: { key: "ai_risk_soc_v1" },
    orderBy: { version: "desc" },
    include: { questions: { orderBy: { sortOrder: "asc" } } },
  });
  if (!questionnaire) {
    throw new Error("Questionnaire ai_risk_soc_v1 is not seeded.");
  }
  return questionnaire;
}

export function toCaseView(
  record: Awaited<ReturnType<typeof loadCaseById>>,
): CaseView {
  if (!record) {
    throw new Error("Case not found");
  }

  const answersByQuestionId = new Map(
    record.answers.map((a) => [a.questionId, a.value]),
  );
  const completeness = computeCompleteness(
    record.questionnaire.questions,
    answersByQuestionId,
    record.evidenceAssets.length,
  );
  const editable = isCaseEditable(record.status);

  return {
    caseId: record.id,
    status: record.status,
    statusLabel: statusLabel(record.status),
    lastReviewNote: record.lastReviewNote,
    submittedAt: record.submittedAt?.toISOString() ?? null,
    canEdit: editable,
    canSubmit: editable && completeness.canSubmit,
    requiredQuestionsTotal: completeness.requiredQuestionsTotal,
    requiredQuestionsAnswered: completeness.requiredQuestionsAnswered,
    evidenceCount: completeness.evidenceCount,
    product: {
      id: record.productVersion.product.id,
      name: record.productVersion.product.name,
      description: record.productVersion.product.description,
      category: record.productVersion.product.category,
      organizationId: record.productVersion.product.organizationId,
      organizationName: record.productVersion.product.organization.name,
    },
    version: {
      id: record.productVersion.id,
      version: record.productVersion.version,
      releaseNotes: record.productVersion.releaseNotes,
    },
    questionnaire: {
      id: record.questionnaire.id,
      title: record.questionnaire.title,
      questions: record.questionnaire.questions.map((q) => ({
        id: q.id,
        prompt: q.prompt,
        helpText: q.helpText,
        inputType: q.inputType,
        required: q.required,
        options: JSON.parse(q.optionsJson) as string[],
        answer: answersByQuestionId.get(q.id) ?? "",
      })),
    },
    evidence: record.evidenceAssets.map((e) => ({
      id: e.id,
      filename: e.filename,
      label: e.label,
      contentType: e.contentType,
      sizeBytes: e.sizeBytes,
      createdAt: e.createdAt.toISOString(),
    })),
    timeline: record.reviewEvents.map((ev) => ({
      id: ev.id,
      fromStatus: ev.fromStatus,
      toStatus: ev.toStatus,
      note: ev.note,
      createdAt: ev.createdAt.toISOString(),
      actorName: ev.actor.name,
    })),
  };
}

export async function loadCaseById(caseId: string) {
  return prisma.qualificationCase.findUnique({
    where: { id: caseId },
    include: caseInclude,
  });
}

export async function loadCaseByVersionId(versionId: string) {
  return prisma.qualificationCase.findUnique({
    where: { productVersionId: versionId },
    include: caseInclude,
  });
}

export async function assertVendorOwnsCase(
  user: SessionUser,
  caseId: string,
) {
  const record = await loadCaseById(caseId);
  if (!record) {
    throw new Error("Case not found");
  }
  if (record.productVersion.product.organizationId !== user.organizationId) {
    throw new Error("Forbidden");
  }
  return record;
}

export async function assertCanViewCase(user: SessionUser, caseId: string) {
  const record = await loadCaseById(caseId);
  if (!record) {
    throw new Error("Case not found");
  }
  if (user.role === "VENDOR") {
    if (record.productVersion.product.organizationId !== user.organizationId) {
      throw new Error("Forbidden");
    }
    return record;
  }
  if (user.role === "UNDERWRITER") {
    if (!UNDERWRITER_VISIBLE.includes(record.status)) {
      throw new Error("Case is not visible to underwriters yet");
    }
    return record;
  }
  throw new Error("Forbidden");
}
