-- CreateEnum
CREATE TYPE "QualificationStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'IN_REVIEW', 'QUALIFIED', 'NEEDS_INFO');

-- CreateEnum
CREATE TYPE "QuestionInputType" AS ENUM ('TEXT', 'TEXTAREA', 'BOOLEAN', 'SELECT');

-- CreateTable
CREATE TABLE "AiProduct" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "category" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiProductVersion" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "releaseNotes" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AiProductVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QualificationCase" (
    "id" TEXT NOT NULL,
    "productVersionId" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "status" "QualificationStatus" NOT NULL DEFAULT 'DRAFT',
    "lastReviewNote" TEXT NOT NULL DEFAULT '',
    "submittedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QualificationCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireDefinition" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireDefinition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireQuestion" (
    "id" TEXT NOT NULL,
    "questionnaireId" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL,
    "prompt" TEXT NOT NULL,
    "helpText" TEXT NOT NULL DEFAULT '',
    "inputType" "QuestionInputType" NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "optionsJson" TEXT NOT NULL DEFAULT '[]',

    CONSTRAINT "QuestionnaireQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionnaireAnswer" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL DEFAULT '',
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "QuestionnaireAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EvidenceAsset" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "uploadedById" TEXT NOT NULL,
    "filename" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "sizeBytes" INTEGER NOT NULL,
    "storageKey" TEXT NOT NULL,
    "label" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EvidenceAsset_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReviewEvent" (
    "id" TEXT NOT NULL,
    "caseId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "fromStatus" "QualificationStatus",
    "toStatus" "QualificationStatus" NOT NULL,
    "note" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReviewEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AiProduct_organizationId_idx" ON "AiProduct"("organizationId");

-- CreateIndex
CREATE INDEX "AiProductVersion_productId_idx" ON "AiProductVersion"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "AiProductVersion_productId_version_key" ON "AiProductVersion"("productId", "version");

-- CreateIndex
CREATE UNIQUE INDEX "QualificationCase_productVersionId_key" ON "QualificationCase"("productVersionId");

-- CreateIndex
CREATE INDEX "QualificationCase_status_idx" ON "QualificationCase"("status");

-- CreateIndex
CREATE INDEX "QualificationCase_questionnaireId_idx" ON "QualificationCase"("questionnaireId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireDefinition_key_version_key" ON "QuestionnaireDefinition"("key", "version");

-- CreateIndex
CREATE INDEX "QuestionnaireQuestion_questionnaireId_idx" ON "QuestionnaireQuestion"("questionnaireId");

-- CreateIndex
CREATE INDEX "QuestionnaireAnswer_caseId_idx" ON "QuestionnaireAnswer"("caseId");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionnaireAnswer_caseId_questionId_key" ON "QuestionnaireAnswer"("caseId", "questionId");

-- CreateIndex
CREATE INDEX "EvidenceAsset_caseId_idx" ON "EvidenceAsset"("caseId");

-- CreateIndex
CREATE INDEX "ReviewEvent_caseId_idx" ON "ReviewEvent"("caseId");

-- AddForeignKey
ALTER TABLE "AiProduct" ADD CONSTRAINT "AiProduct_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiProductVersion" ADD CONSTRAINT "AiProductVersion_productId_fkey" FOREIGN KEY ("productId") REFERENCES "AiProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualificationCase" ADD CONSTRAINT "QualificationCase_productVersionId_fkey" FOREIGN KEY ("productVersionId") REFERENCES "AiProductVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QualificationCase" ADD CONSTRAINT "QualificationCase_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "QuestionnaireDefinition"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireQuestion" ADD CONSTRAINT "QuestionnaireQuestion_questionnaireId_fkey" FOREIGN KEY ("questionnaireId") REFERENCES "QuestionnaireDefinition"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "QualificationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionnaireAnswer" ADD CONSTRAINT "QuestionnaireAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuestionnaireQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "QualificationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EvidenceAsset" ADD CONSTRAINT "EvidenceAsset_uploadedById_fkey" FOREIGN KEY ("uploadedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_caseId_fkey" FOREIGN KEY ("caseId") REFERENCES "QualificationCase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewEvent" ADD CONSTRAINT "ReviewEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
