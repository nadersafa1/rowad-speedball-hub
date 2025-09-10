// Tests Store - Single responsibility: Tests state management
import { create } from 'zustand';
import { apiClient } from '@/lib/api-client';
import type { Test, TestWithResults } from '@/types';

interface TestsState {
  tests: Test[];
  selectedTest: TestWithResults | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    testType: string;
    dateFrom: string;
    dateTo: string;
  };

  // Actions
  fetchTests: () => Promise<void>;
  fetchTest: (id: string, includeResults?: boolean) => Promise<void>;
  createTest: (data: any) => Promise<void>;
  updateTest: (id: string, data: any) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  setFilters: (filters: Partial<TestsState['filters']>) => void;
  clearError: () => void;
  clearSelectedTest: () => void;
}

export const useTestsStore = create<TestsState>((set, get) => ({
  tests: [],
  selectedTest: null,
  isLoading: false,
  error: null,
  filters: {
    testType: '',
    dateFrom: '',
    dateTo: '',
  },

  fetchTests: async () => {
    set({ isLoading: true, error: null });
    try {
      const filters = get().filters;
      const params = {
        testType: filters.testType as any || undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
      };
      
      const tests = await apiClient.getTests(params) as Test[];
      set({ tests, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch tests',
        isLoading: false 
      });
    }
  },

  fetchTest: async (id: string, includeResults = false) => {
    set({ isLoading: true, error: null });
    try {
      const test = await apiClient.getTest(id, includeResults) as TestWithResults;
      set({ selectedTest: test, isLoading: false });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch test',
        isLoading: false 
      });
    }
  },

  createTest: async (data: any) => {
    set({ isLoading: true, error: null });
    try {
      const newTest = await apiClient.createTest(data) as Test;
      set(state => ({ 
        tests: [...state.tests, newTest],
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create test',
        isLoading: false 
      });
      throw error;
    }
  },

  updateTest: async (id: string, data: any) => {
    set({ isLoading: true, error: null });
    try {
      const updatedTest = await apiClient.updateTest(id, data) as Test;
      set(state => ({ 
        tests: state.tests.map(t => t.id === id ? updatedTest : t),
        selectedTest: state.selectedTest?.id === id ? { ...updatedTest, testResults: state.selectedTest.testResults } : state.selectedTest,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update test',
        isLoading: false 
      });
      throw error;
    }
  },

  deleteTest: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.deleteTest(id);
      set(state => ({ 
        tests: state.tests.filter(t => t.id !== id),
        selectedTest: state.selectedTest?.id === id ? null : state.selectedTest,
        isLoading: false 
      }));
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete test',
        isLoading: false 
      });
      throw error;
    }
  },

  setFilters: (newFilters) => {
    set(state => ({ 
      filters: { ...state.filters, ...newFilters } 
    }));
    // Auto-fetch when filters change
    setTimeout(() => get().fetchTests(), 0);
  },

  clearError: () => set({ error: null }),
  clearSelectedTest: () => set({ selectedTest: null }),
}));
