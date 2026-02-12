export enum ScanCategory {
  BLOOD = 'Blood Report',
  MRI = 'MRI Scan',
  XRAY = 'X-Ray',
  CT = 'CT Scan'
}

export interface Metric {
  name: string;
  value: number;
  unit: string;
  refMin: number;
  refMax: number;
  status: 'Low' | 'Normal' | 'High';
}

export interface AnalysisData {
  summary: string;
  keyObservations: string[];
  urgencyScore: number; // 1-10
  metrics: Metric[];
  nextSteps: string[];
}

export interface Scan {
  id: string;
  category: ScanCategory;
  date: string; // ISO String
  imageUrl: string;
  analysis: AnalysisData | null;
}

export interface ComparisonRow {
  metric: string;
  oldValue: string;
  newValue: string;
  change: string;
  reasoning: string;
}

export interface ComparisonResult {
  rows: ComparisonRow[];
  overallAnalysis: string;
  prediction: string;
}

export interface SavedComparison {
  id: string;
  date: string;
  title: string;
  scanIds: string[];
  result: ComparisonResult;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

// Global definition for html2pdf
declare global {
  interface Window {
    html2pdf: any;
  }
}