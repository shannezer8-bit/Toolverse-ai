import { GoogleGenAI, Type } from "@google/genai";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY is missing from environment variables.");
  }
  return new GoogleGenAI({ apiKey });
};

// Helper to clean base64 string
const stripBase64Prefix = (base64: string) => {
  return base64.replace(/^data:(.*,)?/, '');
};

// --- specialized functions ---

export const summarizePdf = async (base64Pdf: string, summaryType: string = 'detailed'): Promise<string> => {
  const ai = getAiClient();
  const cleanBase64 = stripBase64Prefix(base64Pdf);
  
  const promptMap: Record<string, string> = {
    'bullets': "Provide a concise summary in bullet points, focusing only on the critical facts.",
    'short': "Provide a short, 1-paragraph abstract of the document.",
    'detailed': "Provide a comprehensive summary. Highlight key points, main arguments, and important conclusions. Format with clear Markdown headings."
  };

  const prompt = promptMap[summaryType] || promptMap['detailed'];

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'application/pdf',
              data: cleanBase64
            }
          },
          {
            text: prompt
          }
        ]
      }
    });
    return response.text || "No summary generated.";
  } catch (error) {
    console.error("PDF Summary Error", error);
    throw error;
  }
};

export const convertPdfToFormat = async (base64Pdf: string, format: 'word' | 'excel'): Promise<string> => {
  const ai = getAiClient();
  const cleanBase64 = stripBase64Prefix(base64Pdf);
  
  const prompt = format === 'word' 
    ? "Extract the text content from this PDF. Preserve the structural hierarchy (headings, paragraphs, lists) using Markdown. Do not include any preamble, just the content. If there are tables, try to represent them as Markdown tables."
    : "Extract tabular data from this PDF and output it strictly as CSV format. If there are multiple tables, separate them with a blank line. Do not include markdown formatting or explanations, just the CSV data.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType: 'application/pdf', data: cleanBase64 } },
          { text: prompt }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("Conversion Error", error);
    throw error;
  }
};

export const generateResume = async (userData: string, jobDescription?: string): Promise<string> => {
  const ai = getAiClient();
  let prompt = `Create a professional resume in Markdown format based on the following raw user data. Ensure it looks polished, uses professional language, and is structured correctly (Header, Summary, Experience, Education, Skills). Raw Data: \n\n${userData}`;
  
  if (jobDescription) {
    prompt += `\n\nTarget Job Description: ${jobDescription}\n\nPlease tailor the resume summary and highlight skills relevant to this job description.`;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Could not generate resume.";
  } catch (error) {
    console.error("Resume Gen Error", error);
    throw error;
  }
};

export const generateCoverLetter = async (userData: string, jobDescription: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = `Write a professional and persuasive cover letter in Markdown format.
  
  Applicant's Details:
  ${userData}
  
  Target Job Description:
  ${jobDescription || "General Application"}
  
  Instructions:
  - Use a formal business letter format.
  - Connect the applicant's skills and experience directly to the requirements in the job description.
  - Keep the tone enthusiastic but professional.
  - Ensure the letter flows logically: Introduction, Why I'm a fit (Body), and Conclusion.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "Could not generate cover letter.";
  } catch (error) {
    console.error("Cover Letter Gen Error", error);
    throw error;
  }
};

export const generateCaptions = async (description: string, imageBase64: string | undefined, platform: string, tone: string): Promise<string> => {
  const ai = getAiClient();
  const parts: any[] = [{ text: `Generate 5 ${tone} social media captions (including hashtags) for ${platform} based on this context: ${description}` }];
  
  if (imageBase64) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg', // Assuming jpeg for simplicity, normally detect type
        data: stripBase64Prefix(imageBase64)
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts }
    });
    return response.text || "No captions generated.";
  } catch (error) {
    console.error("Caption Gen Error", error);
    throw error;
  }
};

export const generateStory = async (topic: string, character: string, age: string, genre: string, moral: string, language: string = 'English'): Promise<string> => {
  const ai = getAiClient();
  let prompt = `Write a creative and engaging children's story (approx 300 words) in ${language}. \nTopic: ${topic}\nMain Character: ${character}\nTarget Audience Age: ${age} years old.\nGenre: ${genre}.`;
  
  if (moral) {
    prompt += `\nMoral/Lesson: ${moral}`;
  }
  
  prompt += `\nFormat nicely with Markdown.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });
    return response.text || "No story generated.";
  } catch (error) {
    console.error("Story Gen Error", error);
    throw error;
  }
};

export const solveHomework = async (question: string, imageBase64?: string): Promise<string> => {
  const ai = getAiClient();
  // Using Pro for better reasoning capabilities
  const model = 'gemini-3-pro-preview'; 
  
  const parts: any[] = [{ text: `You are an expert tutor. Solve the following homework problem step-by-step. Explain the reasoning clearly. Use LaTeX for math equations where appropriate (wrapped in $ or $$). \nQuestion: ${question}` }];

  if (imageBase64) {
    parts.unshift({
      inlineData: {
        mimeType: 'image/jpeg',
        data: stripBase64Prefix(imageBase64)
      }
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts }
    });
    return response.text || "Could not solve problem.";
  } catch (error) {
    console.error("Homework Error", error);
    throw error;
  }
};

export interface BudgetResult {
  analysis: string;
  chartData: { name: string; value: number }[];
}

export const planBudget = async (financialData: string): Promise<BudgetResult> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Analyze the following financial data and create a monthly budget plan. 
      Return the response in JSON format with two keys: "analysis" (a markdown string explaining the budget advice) and "categories" (an array of objects with "name" and "value" representing suggested expense distribution).
      
      Financial Data: ${financialData}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            analysis: { type: Type.STRING },
            categories: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  value: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });
    
    const text = response.text;
    if (!text) throw new Error("No data returned");
    
    const json = JSON.parse(text);
    return {
      analysis: json.analysis,
      chartData: json.categories
    };

  } catch (error) {
    console.error("Budget Error", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: string = "1:1"): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: aspectRatio
        }
      }
    });
    
    // Iterate through parts to find the image
    if (response.candidates?.[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:image/png;base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("No image data found in response");
  } catch (error) {
    console.error("Image Gen Error", error);
    throw error;
  }
};

export const generateSpeech = async (text: string, voiceName: string): Promise<string> => {
  const ai = getAiClient();
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: text }] }],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: voiceName },
            },
        },
      },
    });
    
    // Extract base64 audio
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio generated");
    return base64Audio;
  } catch (error) {
    console.error("Speech Gen Error", error);
    throw error;
  }
};