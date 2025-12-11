import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import "pdfjs-dist/web/pdf_viewer.css";

pdfjsLib.GlobalWorkerOptions.workerSrc =
  `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;

export default function PdfSummarizer() {
  const [summary, setSummary] = useState("");
  const [fileName, setFileName] = useState("");

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((i) => i.str).join(" ") + " ";
    }

    setSummary(text.substring(0, 1500) + "...");
  }

  return (
    <div style={{ padding: "20px" }}>
      <h2>PDF Summarizer</h2>
      <input type="file" accept="application/pdf" onChange={handleFile} />

      {fileName && <p><b>Uploaded:</b> {fileName}</p>}

      {summary && (
        <div style={{ marginTop: "20px" }}>
          <h3>Summary</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
}
