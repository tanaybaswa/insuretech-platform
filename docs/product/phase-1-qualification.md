# Phase 1 — Shared pre-qualification

## Purpose

Answer: “How did the underwriter know ACME could be qualified for this deal?”

Vendor and underwriter portals read the **same** `QualificationCase` record for a
versioned AI product. Role changes actions and list scope only—not the data.

## Entities

- `AiProduct` / `AiProductVersion` — vendor-owned, versioned product
- `QualificationCase` — shared unit of work + status
- `QuestionnaireDefinition` / `QuestionnaireQuestion` / `QuestionnaireAnswer`
- `EvidenceAsset` — file metadata (bytes on local disk under `web/uploads/`)
- `ReviewEvent` — append-only status audit trail

## Status

`DRAFT` → `SUBMITTED` → `IN_REVIEW` → `QUALIFIED`  
(or `IN_REVIEW` → `NEEDS_INFO` → vendor resubmits → `SUBMITTED`)

## Visibility

- Vendor: own org products only; edit only in `DRAFT` / `NEEDS_INFO`
- Underwriter: all cases with status `SUBMITTED` or later

## Exit criteria

1. Vendor creates product + version, completes questionnaire, uploads evidence, submits
2. Underwriter opens the same case and sees identical status, answers, evidence
3. Underwriter qualifies (or requests info); vendor sees the update on the same case
4. Role boundaries hold
