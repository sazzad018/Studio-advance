import { GoogleGenAI, Type, Schema } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function parseClientData(rawText: string) {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      businessName: { type: Type.STRING },
      websiteUrl: { type: Type.STRING },
      whatsappNumber: { type: Type.STRING },
      email: { type: Type.STRING },
      serviceType: { type: Type.STRING, enum: ['Website', 'Automation', 'Ads', 'Marketing'] },
      facebookPageLink: { type: Type.STRING },
      adAccountId: { type: Type.STRING },
      fbAdStartDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
      fbAdEndDate: { type: Type.STRING, description: "YYYY-MM-DD format" },
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract the client data from the following text and map it to the provided schema fields. 
Translate any Bengali fields into the matching English schema properties. 
If a field is not present, omit it or return an empty string.

Text:
${rawText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
}

export async function parseLeadData(rawText: string) {
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      clientName: { type: Type.STRING },
      conversationId: { type: Type.STRING },
      whatsappNumber: { type: Type.STRING },
      facebookPageLink: { type: Type.STRING },
      businessType: { type: Type.STRING },
      businessDuration: { type: Type.STRING },
      averageProductPrice: { type: Type.STRING },
      dailyMarketingBudget: { type: Type.STRING },
      currentProblems: { type: Type.STRING },
      websiteStatus: { type: Type.STRING },
      mainGoal: { type: Type.STRING },
      notes: { type: Type.STRING },
    }
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Extract the lead information from the following text. 
Translate any Bengali field names to match the schema properties, but keep the values in their original language (usually Bengali or English).
If a field is not present, omit it or return an empty string.

Text:
${rawText}`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: schema,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    return null;
  } catch (error) {
    console.error("AI Parsing Error:", error);
    return null;
  }
}
