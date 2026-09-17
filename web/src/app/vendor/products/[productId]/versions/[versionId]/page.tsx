import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  saveAnswersAction,
  submitCaseAction,
  uploadEvidenceAction,
} from "@/lib/qualification/actions";
import {
  loadCaseByVersionId,
  toCaseView,
} from "@/lib/qualification/types";
import {
  CaseHeader,
  EvidenceSection,
  QuestionnaireSection,
  TimelineSection,
} from "@/components/qualification/case-view";

export default async function VendorCasePage({
  params,
}: {
  params: Promise<{ productId: string; versionId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "VENDOR") {
    redirect("/login");
  }

  const { productId, versionId } = await params;
  const record = await loadCaseByVersionId(versionId);
  if (!record || record.productVersion.productId !== productId) {
    notFound();
  }
  if (record.productVersion.product.organizationId !== session.user.organizationId) {
    redirect("/vendor/products");
  }

  const view = toCaseView(record);
  const editable = view.canEdit;

  async function saveAnswers(formData: FormData) {
    "use server";
    await saveAnswersAction(view.caseId, formData);
  }

  async function uploadEvidence(formData: FormData) {
    "use server";
    await uploadEvidenceAction(view.caseId, formData);
  }

  async function submitCase() {
    "use server";
    await submitCaseAction(view.caseId);
  }

  return (
    <div>
      <CaseHeader view={view} />

      {editable ? (
        <form action={saveAnswers} className="mt-2">
          <QuestionnaireSection view={view} editable />
          <button
            type="submit"
            className="mt-6 h-10 rounded border border-[var(--border)] bg-[var(--surface)] px-4 text-sm font-medium hover:bg-[var(--bg)]"
          >
            Save answers
          </button>
        </form>
      ) : (
        <QuestionnaireSection view={view} editable={false} />
      )}

      <EvidenceSection view={view} editable={editable} />

      {editable ? (
        <form
          action={uploadEvidence}
          className="mt-4 flex max-w-xl flex-col gap-3 border border-[var(--border)] bg-[var(--surface)] p-4"
        >
          <p className="text-sm font-medium">Upload evidence</p>
          <input
            name="label"
            placeholder="Label (e.g. AIUC report)"
            className="h-10 rounded border border-[var(--border)] px-3 text-sm outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
          />
          <input name="file" type="file" required className="text-sm" />
          <button
            type="submit"
            className="h-10 w-fit rounded border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--bg)]"
          >
            Upload file
          </button>
        </form>
      ) : null}

      {editable ? (
        <form action={submitCase} className="mt-8">
          <button
            type="submit"
            disabled={!view.canSubmit}
            className="h-10 rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
          >
            {view.status === "NEEDS_INFO" ? "Resubmit for review" : "Submit for review"}
          </button>
          {!view.canSubmit ? (
            <p className="mt-2 text-sm text-[var(--muted)]">
              Complete all required questions and upload at least one evidence file.
            </p>
          ) : null}
        </form>
      ) : (
        <p className="mt-8 text-sm text-[var(--muted)]">
          This case is locked for editing while status is {view.statusLabel}.
        </p>
      )}

      <TimelineSection view={view} />
    </div>
  );
}
