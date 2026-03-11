import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
        return res.status(500).json({ error: 'API key not configured on server.' });
    }

    try {
        const { imageBase64, category } = req.body;
        if (!imageBase64 || !category) {
            return res.status(400).json({ error: 'Missing imageBase64 or category.' });
        }

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

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestBody),
            }
        );

        if (!response.ok) {
            const errorData = await response.text();
            console.error('Gemini API error:', errorData);
            let errorMessage = 'Gemini API request failed.';
            try {
                const parsed = JSON.parse(errorData);
                errorMessage = parsed?.error?.message || errorMessage;
            } catch {}
            return res.status(response.status).json({ error: errorMessage });
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({ error: 'No response from Gemini.' });
        }

        return res.status(200).json(JSON.parse(text));
    } catch (error: any) {
        console.error('Server error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error.' });
    }
}
