export type BudgetStatus = 'DRAFT' | 'SUBMITTED' | 'OPERATIVE' | 'ARCHIVED';

const VALID_TRANSITIONS: Record<BudgetStatus, BudgetStatus[]> = {
  DRAFT: ['SUBMITTED'],
  SUBMITTED: ['OPERATIVE', 'DRAFT'], // DRAFT = CBO rejection
  OPERATIVE: ['ARCHIVED'],
  ARCHIVED: [],
};

export function canTransition(current: BudgetStatus, target: BudgetStatus): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}

export function validateTransition(current: BudgetStatus, target: BudgetStatus): void {
  if (!canTransition(current, target)) {
    throw new Error(`Invalid state transition: ${current} → ${target}. Allowed: ${VALID_TRANSITIONS[current].join(', ') || 'none'}`);
  }
}
