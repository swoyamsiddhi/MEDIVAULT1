import { Scan, ScanCategory, SavedComparison } from '../types';

// Using localStorage to persist data across reloads for the demo
const SCAN_KEY = 'medivault_scans';
const COMP_KEY = 'medivault_comparisons';

export const mockDb = {
  // --- SCANS ---
  getScans: async (): Promise<Scan[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(SCAN_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  getScanById: async (id: string): Promise<Scan | undefined> => {
    const scans = await mockDb.getScans();
    return scans.find(s => s.id === id);
  },

  saveScan: async (scan: Scan): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const scans = await mockDb.getScans();
    const updatedScans = [...scans, scan];
    localStorage.setItem(SCAN_KEY, JSON.stringify(updatedScans));
  },

  // --- COMPARISONS ---
  getComparisons: async (): Promise<SavedComparison[]> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem(COMP_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveComparison: async (comp: SavedComparison): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    const comps = await mockDb.getComparisons();
    const updated = [comp, ...comps]; // Prepend
    localStorage.setItem(COMP_KEY, JSON.stringify(updated));
  },

  deleteComparison: async (id: string): Promise<void> => {
    const comps = await mockDb.getComparisons();
    const updated = comps.filter(c => c.id !== id);
    localStorage.setItem(COMP_KEY, JSON.stringify(updated));
  },

  // Helper to generate IDs
  generateId: (): string => {
    return Math.random().toString(36).substr(2, 9);
  }
};