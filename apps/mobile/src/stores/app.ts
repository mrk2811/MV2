import { create } from 'zustand';

interface AppState {
  lastActiveTenantId: string | null;
  currentTenantId: string | null;
  setCurrentTenant: (tenantId: string) => void;
  clearCurrentTenant: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  lastActiveTenantId: null,
  currentTenantId: null,
  setCurrentTenant: (tenantId) =>
    set({ currentTenantId: tenantId, lastActiveTenantId: tenantId }),
  clearCurrentTenant: () => set({ currentTenantId: null }),
}));
