import { AnalysisData, ComparisonResult, Scan } from "../types";

const getApiKey = (): string => {
    const key = import.meta.env.VITE_GEMINI_API_KEY;
    if (!key) {
        throw new Error("VITE_GEMINI_API_KEY is not set. Please add it to your .env file.");
    }
    return key;
};

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

export const geminiService = {
    analyzeScan: async (imageBase64: string, category: string): Promise<AnalysisData> => {
        const API_KEY = getApiKey();

        // Clean base64 string
        const cleanBase64 = imageBase64.includes(',') ? imageBase64.split(',')[1] : imageBase64;

        const prompt = `
      You are an expert medical AI assistant. Analyze this ${category} image.
      Provide a structured analysis including:
      1. A patient-friendly summary (2-3 sentences).
      2. Key observations/anomalies found.
      3. An urgency score from 1 (routine) to 10 (critical).
      4. Extracted biomarkers/metrics with their values and standard reference ranges (numeric only).
      5. Next steps and prevention tips.
      
      Return ONLY valid JSON.
    `;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { inline_data: { mime_type: 'image/jpeg', data: cleanBase64 } },
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        summary: { type: 'STRING' },
                        keyObservations: { type: 'ARRAY', items: { type: 'STRING' } },
                        urgencyScore: { type: 'NUMBER' },
                        metrics: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    name: { type: 'STRING' },
                                    value: { type: 'NUMBER' },
                                    unit: { type: 'STRING' },
                                    refMin: { type: 'NUMBER' },
                                    refMax: { type: 'NUMBER' },
                                    status: { type: 'STRING', enum: ['Low', 'Normal', 'High'] }
                                }
                            }
                        },
                        nextSteps: { type: 'ARRAY', items: { type: 'STRING' } }
                    }
                }
            }
        };

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = 'Gemini API request failed.';
                try {
                    const parsed = JSON.parse(errorData);
                    errorMessage = parsed?.error?.message || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response from Gemini.');
            }

            return JSON.parse(text) as AnalysisData;
        } catch (error) {
            console.error("Analysis Error:", error);
            throw error;
        }
    },

    compareScans: async (scans: Scan[]): Promise<ComparisonResult> => {
        const API_KEY = getApiKey();

        // Sort scans by date
        const sortedScans = [...scans].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Prepare input data
        const scansData = sortedScans.map((s, i) =>
            `Scan ${i + 1} (${s.date}): ${JSON.stringify(s.analysis?.metrics || [])}`
        ).join('\n');

        const prompt = `
      Compare these sequential medical scans (sorted chronologically).
      For each common metric found across the scans:
      1. Calculate the percentage change between the first and last available values. Format strictly as "+X%" or "-X%".
      2. Identify if the change is significant (absolute value > 10%).
      3. Provide a detailed medical reasoning for the change.
         CRITICAL: For changes >10%, explicitly explain the potential clinical significance and causes.
      
      Also provide:
      4. An overall trajectory analysis summarizing the patient's health progress.
      5. PREDICTIVE ANALYTICS: Based on the current rate of change in key metrics, forecast what might happen in the next 3 months if the trend continues.
      
      Input Data:
      ${scansData}

      Return ONLY valid JSON.
    `;

        const requestBody = {
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: 'OBJECT',
                    properties: {
                        rows: {
                            type: 'ARRAY',
                            items: {
                                type: 'OBJECT',
                                properties: {
                                    metric: { type: 'STRING' },
                                    oldValue: { type: 'STRING' },
                                    newValue: { type: 'STRING' },
                                    change: { type: 'STRING' },
                                    reasoning: { type: 'STRING' }
                                }
                            }
                        },
                        overallAnalysis: { type: 'STRING' },
                        prediction: { type: 'STRING' }
                    }
                }
            }
        };

        try {
            const response = await fetch(`${GEMINI_API_URL}?key=${API_KEY}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            });

            if (!response.ok) {
                const errorData = await response.text();
                let errorMessage = 'Gemini API request failed.';
                try {
                    const parsed = JSON.parse(errorData);
                    errorMessage = parsed?.error?.message || errorMessage;
                } catch {}
                throw new Error(errorMessage);
            }

            const data = await response.json();
            const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

            if (!text) {
                throw new Error('No response from Gemini.');
            }

            return JSON.parse(text) as ComparisonResult;
        } catch (error) {
            console.error("Comparison Error:", error);
            throw error;
        }
    }
};