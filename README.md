# Rescue the Support Desk API — v1

Repair the fixed TypeScript/Node support-ticket scaffold. Preserve the contract below while adding bounded validation, owner authorization, legal status transitions, retry-safe notifications, stable errors, and focused regression tests.

Run `node --test public-tests/*.test.mjs`. The official runner has no network or credentials and may vary only cases and values within this contract.

## Participant contract

### Callable interfaces

Export `transitionTicket(ticket, actor, nextStatus, dependencies)` from `starter/supportDesk.mjs`.

- `ticket`: `{ id: string, ownerId: string, status: "open" | "in_progress" | "resolved" | "closed", version: non-negative integer, updatedAt: ISO-8601 UTC string | null, updatedBy: non-empty string | null }`. Reject unknown keys. New tickets use `updatedAt: null` and `updatedBy: null`; returned tickets can be passed to later transitions unchanged.
- `actor`: `{ id: string, role: "agent" | "admin" }`. An admin may act on any ticket; an agent may act only when `actor.id === ticket.ownerId`.
- `nextStatus`: one of the four published statuses.
- `dependencies`: `{ now, createId, notify }`. `now()` returns an ISO-8601 UTC string. `createId(namespace, seed)` returns a deterministic string. `notify(notification)` performs the sole permitted external effect.
- Return `{ ticket, notification }`, where `ticket` is a new value using that same Ticket schema with updated `status`, `updatedAt`, `updatedBy`, and `version + 1`; `notification` is `{ id, ticketId, kind: "ticket_status_changed", fromStatus, toStatus }`.
- Throw an `Error` with stable `.code`: `INVALID_INPUT`, `FORBIDDEN`, `ILLEGAL_TRANSITION`, or `NOTIFICATION_FAILED`. Do not expose input contents in messages.

### State machine

Legal transitions are `open -> in_progress|closed`, `in_progress -> open|resolved`, and `resolved -> in_progress|closed`. `closed` is terminal. A same-state request is an idempotent no-op returning the original ticket and `notification: null`.

### Determinism and side effects

Use only injected `now` and `createId`; do not read the system clock, randomness, or global state. The notification ID seed is `${ticket.id}:${ticket.version}:${nextStatus}` in namespace `ticket-status`. Validate and authorize before calling `notify`. A retry with the same input must produce the same notification ID; `notify` is the only allowed side effect.

### Permitted modifications and extension points

You may edit `starter/supportDesk.mjs`, add helper modules under `starter/`, and add participant-owned tests under `participant-tests/`. Do not modify the README, manifest, acceptance record, or `public-tests/`. Extension is permitted only through `dependencies.now`, `dependencies.createId`, `dependencies.notify`, and helper modules under `starter/`; exported names and schemas must remain stable.

Public tests cover every published gate group. Hidden tests may hide cases and values, but must not introduce undocumented behavior or interfaces.
