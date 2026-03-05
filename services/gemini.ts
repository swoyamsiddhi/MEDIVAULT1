import { AnalysisData, ComparisonResult, Scan } from "../types";

export const geminiService = {
    analyzeScan: async (imageBase64: string, category: string): Promise<AnalysisData> => {
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ imageBase64, category }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            return await response.json() as AnalysisData;
        } catch (error) {
            console.error("Analysis Error:", error);
            throw error;
        }
    },

    compareScans: async (scans: Scan[]): Promise<ComparisonResult> => {
        // Sort scans by date
        const sortedScans = [...scans].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Prepare input data
        const scansData = sortedScans.map((s, i) =>
            `Scan ${i + 1} (${s.date}): ${JSON.stringify(s.analysis?.metrics || [])}`
        ).join('\n');

        try {
            const response = await fetch('/api/compare', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ scansData }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Server error: ${response.status}`);
            }

            return await response.json() as ComparisonResult;
        } catch (error) {
            console.error("Comparison Error:", error);
            throw error;
        }
    }
};