import { db } from '../db/connection.js';

interface BudgetCaps {
  total_approved_budget: number;
  sk_allocation_ceiling: number;
  calamity_allocation_ceiling: number;
}

export async function getTotalSpentByCategory(budgetId: string, category: string): Promise<number> {
  const result = await db('project_disbursements')
    .where({ barangay_budget_id: budgetId, fund_category: category })
    .whereNot({ status: 'REJECTED' })
    .sum('amount as total')
    .first();
  return parseFloat(result?.total || '0');
}

export async function validateDisbursement(
  budgetId: string,
  category: string,
  amount: number
): Promise<{ valid: boolean; remaining: number; ceiling: number; spent: number }> {
  const budget = await db('barangay_budgets')
    .where({ id: budgetId })
    .select('total_approved_budget', 'sk_allocation_ceiling', 'calamity_allocation_ceiling')
    .first() as BudgetCaps;

  if (!budget) {
    throw new Error('Budget not found');
  }

  const spent = await getTotalSpentByCategory(budgetId, category);

  let ceiling: number;
  switch (category) {
    case 'SK_FUND':
      ceiling = parseFloat(budget.sk_allocation_ceiling as any);
      break;
    case 'CALAMITY_FUND':
      ceiling = parseFloat(budget.calamity_allocation_ceiling as any);
      break;
    case 'GENERAL_FUND':
      ceiling = parseFloat(budget.total_approved_budget as any)
        - parseFloat(budget.sk_allocation_ceiling as any)
        - parseFloat(budget.calamity_allocation_ceiling as any);
      break;
    default:
      throw new Error(`Invalid fund category: ${category}`);
  }

  const remaining = ceiling - spent;
  const valid = amount <= remaining;

  return { valid, remaining, ceiling, spent };
}
