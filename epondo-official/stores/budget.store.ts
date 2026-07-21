import { defineStore } from 'pinia';

interface Budget {
  id: string;
  parent_lgu_id: string;
  barangay_name: string;
  barangay_psgc: string;
  fiscal_year: number;
  estimated_national_nta: number;
  estimated_city_rpt_share: number;
  estimated_local_fees: number;
  total_approved_budget: number;
  sk_allocation_ceiling: number;
  calamity_allocation_ceiling: number;
  budget_status: 'DRAFT' | 'SUBMITTED' | 'OPERATIVE' | 'ARCHIVED';
  egovchain_tx_hash: string | null;
  egovchain_archived_hash: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

interface BudgetState {
  budgets: Budget[];
  currentBudget: Budget | null;
  loading: boolean;
  error: string | null;
}

export const useBudgetStore = defineStore('budget', {
  state: (): BudgetState => ({
    budgets: [],
    currentBudget: null,
    loading: false,
    error: null,
  }),

  getters: {
    draftBudgets: (state) => state.budgets.filter(b => b.budget_status === 'DRAFT'),
    submittedBudgets: (state) => state.budgets.filter(b => b.budget_status === 'SUBMITTED'),
    operativeBudgets: (state) => state.budgets.filter(b => b.budget_status === 'OPERATIVE'),
    archivedBudgets: (state) => state.budgets.filter(b => b.budget_status === 'ARCHIVED'),
  },

  actions: {
    async fetchBudgets(params?: Record<string, string>) {
      this.loading = true;
      this.error = null;
      try {
        const { client } = useApi();
        const { data } = await client.get('/api/budgets', { params });
        this.budgets = data.data;
      } catch (err: any) {
        this.error = err.response?.data?.error?.message || 'Failed to fetch budgets';
      } finally {
        this.loading = false;
      }
    },

    async fetchBudget(id: string) {
      this.loading = true;
      try {
        const { client } = useApi();
        const { data } = await client.get(`/api/budgets/${id}`);
        this.currentBudget = data.data;
      } catch (err: any) {
        this.error = err.response?.data?.error?.message || 'Failed to fetch budget';
      } finally {
        this.loading = false;
      }
    },

    async createBudget(payload: any) {
      const { client } = useApi();
      const { data } = await client.post('/api/budgets', payload);
      this.budgets.unshift(data.data);
      return data.data;
    },

    async updateBudget(id: string, payload: any) {
      const { client } = useApi();
      const { data } = await client.put(`/api/budgets/${id}`, payload);
      const idx = this.budgets.findIndex(b => b.id === id);
      if (idx >= 0) this.budgets[idx] = data.data;
      this.currentBudget = data.data;
      return data.data;
    },

    async submitBudget(id: string, livenessSessionId: string) {
      const { client } = useApi();
      const { data } = await client.post(`/api/budgets/${id}/submit`, {
        liveness_session_id: livenessSessionId,
      });
      const idx = this.budgets.findIndex(b => b.id === id);
      if (idx >= 0) this.budgets[idx] = data.data;
      this.currentBudget = data.data;
      return data.data;
    },

    async approveBudget(id: string) {
      const { client } = useApi();
      const { data } = await client.post(`/api/budgets/${id}/approve`);
      const idx = this.budgets.findIndex(b => b.id === id);
      if (idx >= 0) this.budgets[idx] = data.data;
      this.currentBudget = data.data;
      return data.data;
    },

    async rejectBudget(id: string, reason: string) {
      const { client } = useApi();
      const { data } = await client.post(`/api/budgets/${id}/reject`, { reason });
      const idx = this.budgets.findIndex(b => b.id === id);
      if (idx >= 0) this.budgets[idx] = data.data;
      this.currentBudget = data.data;
      return data.data;
    },
  },
});
