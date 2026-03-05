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
        const { scansData } = req.body;
        if (!scansData) {
            return res.status(400).json({ error: 'Missing scansData.' });
        }

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
            return res.status(response.status).json({ error: 'Gemini API request failed.' });
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
