export default async function handler(req, res) {
  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { base64Image, mimeType } = req.body;
    const API_KEY = process.env.VITE_GEMINI_API_KEY;

    if (!API_KEY) {
      throw new Error("API key not configured");
    }

    const model = "gemini-1.5-flash";
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${API_KEY}`;

    const promptText =
      "Extract nutrition information from this image of a nutrition facts label. Return only valid JSON with keys: name, brand, calories, protein, carbs, fats, servingSize. Units: grams for macros and kcal for calories. If a value is not present, set it to an empty string.";

    const body = {
      contents: [
        {
          parts: [
            { text: promptText },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64Image,
              },
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 512,
      },
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const txt = await response.text();
      throw new Error(`Gemini API error ${response.status}: ${txt}`);
    }

    const json = await response.json();
    const generated = json.candidates[0].content.parts[0].text;

    let parsedData = null;
    try {
      parsedData = JSON.parse(generated);
    } catch {
      // If not strict JSON, return the text for client-side parsing
      parsedData = { rawText: generated };
    }

    res.status(200).json(parsedData);
  } catch (error) {
    console.error("Error processing OCR:", error);
    res.status(500).json({ error: error.message });
  }
}
