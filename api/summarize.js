export default async function handler(req, res) {
  const { pdfBase64 } = await req.json();

  const API_KEY = process.env.GEMINI_API_KEY;

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`;

  const payload = {
    contents: [
      {
        parts: [
          { text: "Summarize the following PDF content:" },
          { inline_data: { mime_type: "application/pdf", data: pdfBase64 } }
        ]
      }
    ]
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  res.status(200).json(data);
}
