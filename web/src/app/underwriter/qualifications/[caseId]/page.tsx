import { notFound, redirect } from "next/navigation";
import { QualificationStatus } from "@prisma/client";
import { auth } from "@/lib/auth";
import {
  qualifyCaseAction,
  requestInfoAction,
  startReviewAction,
} from "@/lib/qualification/actions";
import {
  assertCanViewCase,
  toCaseView,
} from "@/lib/qualification/types";
import {
  CaseHeader,
  EvidenceSection,
  QuestionnaireSection,
  TimelineSection,
} from "@/components/qualification/case-view";

export default async function UnderwriterCasePage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const session = await auth();
  if (!session?.user || session.user.role !== "UNDERWRITER") {
    redirect("/login");
  }

  const { caseId } = await params;
  let record;
  try {
    record = await assertCanViewCase(session.user, caseId);
  } catch {
    notFound();
  }

  const view = toCaseView(record);

  async function startReview() {
    "use server";
    await startReviewAction(caseId);
  }

  async function qualify(formData: FormData) {
    "use server";
    await qualifyCaseAction(caseId, formData);
  }

  async function requestInfo(formData: FormData) {
    "use server";
    await requestInfoAction(caseId, formData);
  }

  return (
    <div>
      <CaseHeader view={view} />
      <QuestionnaireSection view={view} editable={false} />
      <EvidenceSection view={view} editable={false} />

      <section className="mt-10 border-t border-[var(--border)] pt-6">
        <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
          Review actions
        </h2>

        {view.status === QualificationStatus.SUBMITTED ? (
          <form action={startReview} className="mt-4">
            <button
              type="submit"
              className="h-10 rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
            >
              Start review
            </button>
          </form>
        ) : null}

        {view.status === QualificationStatus.IN_REVIEW ? (
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            <form action={qualify} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Qualify note</label>
              <textarea
                name="note"
                rows={3}
                placeholder="Optional note"
                className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
              />
              <button
                type="submit"
                className="h-10 w-fit rounded bg-[var(--accent)] px-4 text-sm font-medium text-white hover:bg-[var(--accent-hover)]"
              >
                Mark qualified
              </button>
            </form>
            <form action={requestInfo} className="flex flex-col gap-3">
              <label className="text-sm font-medium">Request more info</label>
              <textarea
                name="note"
                required
                rows={3}
                placeholder="What is missing?"
                className="rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
              />
              <button
                type="submit"
                className="h-10 w-fit rounded border border-[var(--border)] px-4 text-sm font-medium hover:bg-[var(--bg)]"
              >
                Request info
              </button>
            </form>
          </div>
        ) : null}

        {view.status === QualificationStatus.QUALIFIED ? (
          <p className="mt-4 text-sm text-[var(--success)]">
            This product version is VizCo qualified.
          </p>
        ) : null}

        {view.status === QualificationStatus.NEEDS_INFO ? (
          <p className="mt-4 text-sm text-[var(--muted)]">
            Waiting on vendor to update answers/evidence and resubmit.
          </p>
        ) : null}
      </section>

      <TimelineSection view={view} />
    </div>
  );
}
