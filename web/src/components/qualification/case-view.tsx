import type { CaseView } from "@/lib/qualification/types";
import { statusLabel } from "@/lib/qualification/types";

export function StatusText({ status }: { status: CaseView["status"] }) {
  return (
    <span className="font-medium text-[var(--ink)]">{statusLabel(status)}</span>
  );
}

export function CaseHeader({ view }: { view: CaseView }) {
  return (
    <div className="border-b border-[var(--border)] pb-6">
      <p className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {view.product.organizationName}
      </p>
      <h1 className="mt-2 text-[28px] font-semibold tracking-tight">
        {view.product.name}{" "}
        <span className="font-mono text-[20px] text-[var(--muted)]">
          {view.version.version}
        </span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-[var(--muted)]">
        {view.product.description || "No description provided."}
      </p>
      <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-3">
        <div>
          <dt className="text-[var(--muted)]">Status</dt>
          <dd className="mt-1">
            <StatusText status={view.status} />
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Questionnaire</dt>
          <dd className="mt-1">
            {view.requiredQuestionsAnswered}/{view.requiredQuestionsTotal}{" "}
            required answered
          </dd>
        </div>
        <div>
          <dt className="text-[var(--muted)]">Evidence</dt>
          <dd className="mt-1">{view.evidenceCount} file(s)</dd>
        </div>
      </dl>
      {view.lastReviewNote ? (
        <p className="mt-4 text-sm text-[var(--ink)]">
          <span className="text-[var(--muted)]">Last review note: </span>
          {view.lastReviewNote}
        </p>
      ) : null}
    </div>
  );
}

export function QuestionnaireSection({
  view,
  editable,
}: {
  view: CaseView;
  editable: boolean;
}) {
  return (
    <section className="mt-10">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        {view.questionnaire.title}
      </h2>
      <div className="mt-4 space-y-5">
        {view.questionnaire.questions.map((q) => (
          <label key={q.id} className="block text-sm">
            <span className="font-medium text-[var(--ink)]">
              {q.prompt}
              {q.required ? " *" : ""}
            </span>
            {q.helpText ? (
              <span className="mt-1 block text-[var(--muted)]">{q.helpText}</span>
            ) : null}
            {editable ? (
              q.inputType === "TEXTAREA" ? (
                <textarea
                  name={`answer_${q.id}`}
                  defaultValue={q.answer}
                  rows={3}
                  className="mt-2 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 py-2 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
                />
              ) : q.inputType === "BOOLEAN" ? (
                <select
                  name={`answer_${q.id}`}
                  defaultValue={q.answer}
                  className="mt-2 h-10 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
                >
                  <option value="">Select…</option>
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              ) : q.inputType === "SELECT" ? (
                <select
                  name={`answer_${q.id}`}
                  defaultValue={q.answer}
                  className="mt-2 h-10 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
                >
                  <option value="">Select…</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  name={`answer_${q.id}`}
                  type="text"
                  defaultValue={q.answer}
                  className="mt-2 h-10 w-full rounded border border-[var(--border)] bg-[var(--surface)] px-3 outline-none focus:outline focus:outline-2 focus:outline-[var(--accent)]"
                />
              )
            ) : (
              <p className="mt-2 whitespace-pre-wrap text-[var(--ink)]">
                {q.answer || "—"}
              </p>
            )}
          </label>
        ))}
      </div>
    </section>
  );
}

export function EvidenceSection({
  view,
  editable,
}: {
  view: CaseView;
  editable: boolean;
}) {
  return (
    <section className="mt-10 border-t border-[var(--border)] pt-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        Evidence assets
      </h2>
      {view.evidence.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No evidence uploaded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-[var(--border)] border-t border-b border-[var(--border)]">
          {view.evidence.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between gap-4 py-3 text-sm"
            >
              <div>
                <div className="font-medium">{e.label || e.filename}</div>
                <div className="font-mono text-xs text-[var(--muted)]">
                  {e.filename} · {e.sizeBytes} bytes
                </div>
              </div>
              <a
                href={`/api/evidence/${e.id}`}
                className="text-sm text-[var(--ink)] underline-offset-2 hover:underline"
              >
                Download
              </a>
            </li>
          ))}
        </ul>
      )}
      {editable ? (
        <p className="mt-3 text-xs text-[var(--muted)]">
          Upload controls are below the questionnaire actions.
        </p>
      ) : null}
    </section>
  );
}

export function TimelineSection({ view }: { view: CaseView }) {
  return (
    <section className="mt-10 border-t border-[var(--border)] pt-6">
      <h2 className="text-xs font-medium uppercase tracking-[0.08em] text-[var(--muted)]">
        Review timeline
      </h2>
      {view.timeline.length === 0 ? (
        <p className="mt-3 text-sm text-[var(--muted)]">No events yet.</p>
      ) : (
        <ol className="mt-4 space-y-3">
          {view.timeline.map((ev) => (
            <li key={ev.id} className="text-sm">
              <div className="font-medium text-[var(--ink)]">
                {ev.fromStatus ? `${statusLabel(ev.fromStatus)} → ` : ""}
                {statusLabel(ev.toStatus)}
              </div>
              <div className="text-[var(--muted)]">
                {ev.actorName} · {new Date(ev.createdAt).toLocaleString()}
              </div>
              {ev.note ? <div className="mt-1">{ev.note}</div> : null}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
