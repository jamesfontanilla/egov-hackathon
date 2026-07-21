import crypto from 'crypto';

/**
 * Mock eGovchain service.
 * Generates SHA-256 hashes to simulate blockchain anchoring.
 * Replace with real eGovchain API calls when documentation becomes available.
 */
export class EgovchainService {
  /**
   * Anchor a state transition to the mock blockchain.
   * Returns a 66-character hash (0x + 64 hex chars).
   */
  anchorState(payload: {
    entityType: string;
    entityId: string;
    action: string;
    timestamp: string;
    data: any;
  }): string {
    const serialized = JSON.stringify({
      ...payload,
      nonce: crypto.randomUUID(),
    });

    const hash = crypto.createHash('sha256').update(serialized).digest('hex');
    return `0x${hash}`;
  }

  /**
   * Anchor a budget approval (SUBMITTED → OPERATIVE)
   */
  anchorBudgetApproval(budgetId: string, approvedBy: string, totalBudget: number): string {
    return this.anchorState({
      entityType: 'barangay_budget',
      entityId: budgetId,
      action: 'BUDGET_APPROVED',
      timestamp: new Date().toISOString(),
      data: { approvedBy, totalBudget },
    });
  }

  /**
   * Anchor a budget archive (OPERATIVE → ARCHIVED)
   */
  anchorBudgetArchive(budgetId: string, finalBalance: number): string {
    return this.anchorState({
      entityType: 'barangay_budget',
      entityId: budgetId,
      action: 'BUDGET_ARCHIVED',
      timestamp: new Date().toISOString(),
      data: { finalBalance, vaultLock: true },
    });
  }

  /**
   * Anchor a disbursement approval
   */
  anchorDisbursement(disbursementId: string, amount: number, authorizedBy: string): string {
    return this.anchorState({
      entityType: 'project_disbursement',
      entityId: disbursementId,
      action: 'DISBURSEMENT_APPROVED',
      timestamp: new Date().toISOString(),
      data: { amount, authorizedBy },
    });
  }

  /**
   * Verify a hash (mock — always returns true for valid format)
   */
  verifyHash(hash: string): { valid: boolean; format: boolean } {
    const formatValid = /^0x[a-f0-9]{64}$/.test(hash);
    return { valid: formatValid, format: formatValid };
  }
}

export const egovchainService = new EgovchainService();
