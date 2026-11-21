// PARTICIPANT CONTRACT: Keep this export and its four-argument signature.
// Implement only through the injected now/createId/notify dependencies described
// in README.md; helper modules under starter/ are the only code extension point.
export function transitionTicket(ticket, actor, nextStatus, dependencies) {
  // Deliberately incomplete starter: implement owner authorization, allowed
  // transitions, stable errors, and retry-safe notification behavior.
  void dependencies
  return { ...ticket, status: nextStatus, updatedBy: actor.id }
}
