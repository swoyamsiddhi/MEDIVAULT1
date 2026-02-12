import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisData, ComparisonResult, Scan } from "../types";

// NOTE: In a real app, never expose API keys on the client side.
// This is for demonstration purposes within the constraints.
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

const ai = new GoogleGenAI({ apiKey: API_KEY });

export const geminiService = {
    analyzeScan: async (imageBase64: string, category: string): Promise<AnalysisData> => {
        // Clean base64 string if it contains headers
        const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

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

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
                        { text: prompt }
                    ]
                },
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            summary: { type: Type.STRING },
                            keyObservations: { type: Type.ARRAY, items: { type: Type.STRING } },
                            urgencyScore: { type: Type.NUMBER },
                            metrics: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        name: { type: Type.STRING },
                                        value: { type: Type.NUMBER },
                                        unit: { type: Type.STRING },
                                        refMin: { type: Type.NUMBER },
                                        refMax: { type: Type.NUMBER },
                                        status: { type: Type.STRING, enum: ['Low', 'Normal', 'High'] }
                                    }
                                }
                            },
                            nextSteps: { type: Type.ARRAY, items: { type: Type.STRING } }
                        }
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No response from Gemini");
            return JSON.parse(text) as AnalysisData;

        } catch (error) {
            console.error("Gemini Analysis Error:", error);
            throw error;
        }
    },

    compareScans: async (scans: Scan[]): Promise<ComparisonResult> => {
        // Sort scans by date
        const sortedScans = [...scans].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Prepare input for Gemini
        const descriptions = sortedScans.map((s, i) =>
            `Scan ${i + 1} (${s.date}): ${JSON.stringify(s.analysis?.metrics || [])}`
        ).join('\n');

        const prompt = `
      Compare these sequential medical scans (sorted chronologically).
      For each common metric found across the scans:
      1. Calculate the percentage change between the first and last available values. Format strictly as "+X%" or "-X%".
      2. Identify if the change is significant (absolute value > 10%).
      3. Provide a detailed medical reasoning for the change.
         CRITICAL: For changes >10%, explicitly explain the potential clinical significance and causes (e.g., "Increase in WBC suggests immune response to infection").
      
      Also provide:
      4. An overall trajectory analysis summarizing the patient's health progress.
      5. PREDICTIVE ANALYTICS: "Minority Report" style forecasting. Based on the current rate of change in key metrics, forecast what might happen in the next 3 months if the trend continues. 
         (e.g., "At this rate of hemoglobin decline, you risk anemia in 3 months. Increase iron intake now.").
      
      Input Data:
      ${descriptions}

      Return ONLY valid JSON.
    `;

        try {
            const response = await ai.models.generateContent({
                model: 'gemini-flash-latest',
                contents: prompt,
                config: {
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            rows: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        metric: { type: Type.STRING },
                                        oldValue: { type: Type.STRING },
                                        newValue: { type: Type.STRING },
                                        change: { type: Type.STRING },
                                        reasoning: { type: Type.STRING }
                                    }
                                }
                            },
                            overallAnalysis: { type: Type.STRING },
                            prediction: { type: Type.STRING }
                        }
                    }
                }
            });

            const text = response.text;
            if (!text) throw new Error("No response from Gemini");
            return JSON.parse(text) as ComparisonResult;

        } catch (error) {
            console.error("Gemini Comparison Error:", error);
            throw error;
        }
    }
};