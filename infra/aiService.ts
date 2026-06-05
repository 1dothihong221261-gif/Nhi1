import { GoogleGenAI, Type } from "@google/genai";
import { Character, EntityRegistry } from "../types";
import { promptBuilderService } from "../narrative/prompting/narrativePromptAssembler";

const MODEL_WRITING_PRIMARY = 'gemini-3.1-pro-preview';
const MODEL_WRITING_FALLBACK = 'gemini-3.1-pro-preview';
const MODEL_AUX = 'gemini-3.1-pro-preview';
const MODEL_EMBEDDING = 'gemini-embedding-2';

// Cooldown mechanism for Primary Model (3.1 Pro)
const MODEL_COOLDOWN_DURATION = 60 * 60 * 1000; // 1 hour
let primaryModelCooldownUntil = 0;

const isPrimaryModelAvailable = () => Date.now() > primaryModelCooldownUntil;

const setPrimaryModelCooldown = () => {
    primaryModelCooldownUntil = Date.now() + MODEL_COOLDOWN_DURATION;
    console.warn(`model ${MODEL_WRITING_PRIMARY} test test.`);
};

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanAndParseJSON = (text: string): any => {
    if (!text) return [];
    let cleanText = text.trim();
    // More robust cleanup for markdown code blocks
    if (cleanText.includes('```')) {
        cleanText = cleanText.replace(/```(?:json)?\s*([\s\S]*?)\s*```/g, '$1').trim();
    }
    
    // Fallback: Attempt to find JSON object or array boundaries if cleanup failed or text is messy
    const firstBracket = cleanText.indexOf('[');
    const firstBrace = cleanText.indexOf('{');
    
    try {
        if (firstBracket !== -1 && (firstBrace === -1 || firstBracket < firstBrace)) {
            const lastBracket = cleanText.lastIndexOf(']');
            if (lastBracket !== -1) cleanText = cleanText.substring(firstBracket, lastBracket + 1);
        } else if (firstBrace !== -1) {
             const lastBrace = cleanText.lastIndexOf('}');
             if (lastBrace !== -1) cleanText = cleanText.substring(firstBrace, lastBrace + 1);
        }
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("JSON Parse Error:", e, "Original Text:", text);
        return [];
    }
};

export interface CanonExtractionResult {
    rules: string[];
    character_profiles: { name: string; core: string; traits: string[] }[];
    relationships: string[];
    locations: string[]; // New
    factions: string[]; // New
}

export const validateEmbedding = (embedding: number[]): boolean => {
  if (!Array.isArray(embedding)) return false;
  if (embedding.length === 0) return false;
  if (embedding.length !== 768) {
    console.error(`Dimension mismatch: expected 768-dimensional vector, but got ${embedding.length} dimensions.`);
    return false;
  }
  if (embedding.some(isNaN)) {
    console.error("Embedding contains invalid NaN values.");
    return false;
  }
  return true;
};

export const geminiService = {
  
  async embedText(
    text: string, 
    taskType: 'RETRIEVAL_DOCUMENT' | 'RETRIEVAL_QUERY' | 'SEMANTIC_SIMILARITY' | 'CLASSIFICATION' | 'CLUSTERING' | 'QUESTION_ANSWERING' | 'FACT_VERIFICATION' = 'RETRIEVAL_DOCUMENT'
  ): Promise<number[]> {
    if (!text || text.length < 5) return []; 
    try {
      const ai = getAI();
      const response = await ai.models.embedContent({
        model: MODEL_EMBEDDING, 
        contents: [{ parts: [{ text: text }] }],
        config: {
          taskType: taskType,
          outputDimensionality: 768
        }
      });
      const values = response.embeddings?.[0]?.values || [];
      if (values.length > 0 && !validateEmbedding(values)) {
        console.warn("Invalid embedding received from API for model:", MODEL_EMBEDDING);
      }
      return values;
    } catch (e) {
      console.error("Embedding failed:", e);
      return [];
    }
  },

  async extractCanonData(textChunk: string): Promise<CanonExtractionResult> {
    if (!textChunk || textChunk.length < 100) return { rules: [], character_profiles: [], relationships: [], locations: [], factions: [] };

    const prompt = `Phân tích đoạn văn bản thô từ tiểu thuyết gốc sau đây và trích xuất dữ liệu cốt lõi (Canon) để làm cơ sở dữ liệu cho Fanfiction (Existence Lock).
    
    Yêu cầu đầu ra (JSON):
    1. rules: Các quy tắc thế giới, hệ thống sức mạnh, hoặc sự kiện lịch sử không thể thay đổi.
    2. character_profiles: Hồ sơ tâm lý nhân vật. (Tên, tính cách cốt lõi).
    3. relationships: Tương tác quan hệ.
    4. locations: DANH SÁCH TÊN ĐỊA DANH / ĐỊA ĐIỂM xuất hiện (Để làm Whitelist).
    5. factions: DANH SÁCH TÊN TỔ CHỨC / MÔN PHÁI / GIA TỘC xuất hiện (Để làm Whitelist).

    Văn bản gốc:
    ${textChunk.substring(0, 15000)}... (đã cắt bớt)`;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_AUX,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        rules: { type: Type.ARRAY, items: { type: Type.STRING } },
                        character_profiles: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    name: { type: Type.STRING },
                                    core: { type: Type.STRING, description: "Tính cách cốt lõi / Core Personality" },
                                    traits: { type: Type.ARRAY, items: { type: Type.STRING } }
                                },
                                required: ["name", "core"]
                            }
                        },
                        relationships: { type: Type.ARRAY, items: { type: Type.STRING } },
                        locations: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Whitelist of valid locations" },
                        factions: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Whitelist of valid orgs/groups" }
                    },
                    required: ["rules", "character_profiles", "locations", "factions"]
                }
            }
        });
        const result = cleanAndParseJSON(response.text || "{}");
        return {
            rules: result.rules || [],
            character_profiles: result.character_profiles || [],
            relationships: result.relationships || [],
            locations: result.locations || [],
            factions: result.factions || []
        };
    } catch (e) {
        console.error("Canon extraction failed", e);
        return { rules: [], character_profiles: [], relationships: [], locations: [], factions: [] };
    }
  },

  async *generateStoryStream(
    immediateContext: string,
    rollingSummaries: string,
    worldBible: string,
    augmentedContext: string,
    synopsis: string,
    characters: Character[],
    worldLore: string[],
    genre: string,
    writingStyle: string,
    pov: string,
    pronounStyle: string,
    negativePrompt: string,
    nsfw: boolean,
    userInstruction: string,
    sourceUrl: string | undefined,
    entityRegistry: EntityRegistry | undefined,
    currentChapterTitle: string, // NEW
    eniMode: boolean = false
  ) {
    const prompt = promptBuilderService.buildContinuePrompt(
      immediateContext,
      rollingSummaries,
      worldBible,
      augmentedContext,
      synopsis,
      characters,
      worldLore,
      userInstruction,
      pronounStyle,
      currentChapterTitle,
      nsfw
    );

    const systemInstruction = promptBuilderService.buildSystemInstruction(
        genre, worldBible, pov, pronounStyle, writingStyle, negativePrompt, nsfw, eniMode, sourceUrl, entityRegistry
    );

    const ai = getAI();
    const config = {
        systemInstruction: systemInstruction,
        temperature: 0.9, 
        topK: 64,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 32768 },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
            { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "OFF" }
        ] as any
    };

    // Helper to try streaming with a specific model
    const tryStream = async function*(model: string) {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: config
        });
        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield { text: chunk.text, usageMetadata: chunk.usageMetadata };
            }
        }
    };

    let useFallback = !isPrimaryModelAvailable();

    if (!useFallback) {
        try {
            // Try Primary Model
            yield* tryStream(MODEL_WRITING_PRIMARY);
        } catch (e: any) {
            // Check for quota error (429 or "exhausted")
            const isQuotaError = e.toString().includes('429') || 
                                 e.toString().toLowerCase().includes('quota') || 
                                 e.toString().toLowerCase().includes('exhausted') ||
                                 (e.status === 429);
            
            if (isQuotaError) {
                setPrimaryModelCooldown();
            }
            console.warn(`Primary model ${MODEL_WRITING_PRIMARY} failed, switching to fallback ${MODEL_WRITING_FALLBACK}. Error:`, e);
            useFallback = false;
        }
    }

    if (useFallback) {
        try {
            
            yield* tryStream(MODEL_WRITING_FALLBACK);
        } catch (fallbackError) {
            console.error("Story generation failed on both models", fallbackError);
            throw fallbackError;
        }
    }
  },

  async *rewriteContentStream(
    originalText: string,
    instruction: string,
    contextData: {
        worldBible: string;
        synopsis: string;
        characters: Character[];
        worldLore: string[];
        genre: string;
        writingStyle: string;
        pov: string;
        pronounStyle: string;
        negativePrompt: string;
        nsfw: boolean;
        eniMode?: boolean;
        sourceUrl?: string;
        entityRegistry?: EntityRegistry;
    }
  ) {
    const prompt = promptBuilderService.buildRewritePrompt(
        originalText,
        instruction,
        contextData.characters,
        contextData.worldLore,
        contextData.worldBible,
        contextData.synopsis,
        contextData.pronounStyle
    );

    const systemInstruction = promptBuilderService.buildSystemInstruction(
        contextData.genre, contextData.worldBible, contextData.pov, contextData.pronounStyle, contextData.writingStyle, contextData.negativePrompt, contextData.nsfw, contextData.eniMode || false, contextData.sourceUrl, contextData.entityRegistry
    );

    const ai = getAI();
    const config = {
        systemInstruction: systemInstruction,
        temperature: 0.7, 
        topK: 64,
        topP: 0.95,
        thinkingConfig: { thinkingBudget: 16384 },
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
            { category: "HARM_CATEGORY_CIVIC_INTEGRITY", threshold: "OFF" }
        ] as any
    };

    const tryStream = async function*(model: string) {
        const responseStream = await ai.models.generateContentStream({
            model: model,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: config
        });
        for await (const chunk of responseStream) {
            if (chunk.text) {
                yield { text: chunk.text, usageMetadata: chunk.usageMetadata };
            }
        }
    };

    let useFallback = !isPrimaryModelAvailable();

    if (!useFallback) {
        try {
            yield* tryStream(MODEL_WRITING_PRIMARY);
        } catch (e: any) {
            
            const isQuotaError = e.toString().includes('429') || 
                                 e.toString().toLowerCase().includes('quota') || 
                                 e.toString().toLowerCase().includes('exhausted') ||
                                 (e.status === 429);
            
            if (isQuotaError) {
                setPrimaryModelCooldown();
            }
            console.warn(`Primary model ${MODEL_WRITING_PRIMARY} failed for rewrite, switching to fallback ${MODEL_WRITING_FALLBACK}. Error:`, e);
            useFallback = false;
        }
    }

    if (useFallback) {
        try {
            yield* tryStream(MODEL_WRITING_FALLBACK);
        } catch (fallbackError) {
            console.error("Rewrite generation failed on both models", fallbackError);
            throw fallbackError;
        }
    }
  },

  async extractCharacters(text: string, pronounStyle: string): Promise<Character[]> {
    const systemInstruction = promptBuilderService.buildExtractionSystemInstruction(pronounStyle);
    const prompt = `Phân tích văn bản và trích xuất danh sách JSON các nhân vật quan trọng. 
    HÃY SUY LUẬN ĐỂ ĐIỀN ĐẦY ĐỦ CÁC TRƯỜNG: Ngoại hình (Tóc, Mắt, Quần áo), Tính cách (Big Five, MBTI) dựa trên hành động của họ.
    Nếu thông tin không có, hãy suy luận hợp lý nhất dựa trên bối cảnh.`;
    
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: MODEL_AUX,
        contents: {
            parts: [
                { text: prompt },
                { text: `Văn bản cần phân tích:\n${text}` }
            ]
        },
        config: {
          systemInstruction: systemInstruction,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
                characters: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.OBJECT,
                        properties: {
                            name: { type: Type.STRING },
                            role: { type: Type.STRING },
                            description: { type: Type.STRING, description: "Tiểu sử, quá khứ, động lực" },
                            appearance: {
                                type: Type.OBJECT,
                                properties: {
                                    general: { type: Type.STRING },
                                    face: { type: Type.STRING },
                                    body: { type: Type.STRING },
                                    hair: { type: Type.STRING },
                                    clothing: { type: Type.STRING },
                                    body_impression: { type: Type.STRING }
                                },
                                required: ["general", "face", "clothing"]
                            },
                            core_personality: { type: Type.STRING, description: "Tính cách cốt lõi bất biến" },
                            personality: { type: Type.STRING, description: "Biểu hiện bên ngoài" },
                            mbti: { type: Type.STRING },
                            big_five: {
                                type: Type.OBJECT,
                                properties: {
                                    O: { type: Type.NUMBER, description: "Openness (0.0-1.0)" },
                                    C: { type: Type.NUMBER, description: "Conscientiousness (0.0-1.0)" },
                                    E: { type: Type.NUMBER, description: "Extraversion (0.0-1.0)" },
                                    A: { type: Type.NUMBER, description: "Agreeableness (0.0-1.0)" },
                                    N: { type: Type.NUMBER, description: "Neuroticism (0.0-1.0)" }
                                }
                            },
                            emotionState: {
                                type: Type.OBJECT,
                                properties: {
                                    anger: { type: Type.NUMBER },
                                    joy: { type: Type.NUMBER },
                                    sadness: { type: Type.NUMBER },
                                    fear: { type: Type.NUMBER },
                                    trust: { type: Type.NUMBER },
                                    surprise: { type: Type.NUMBER }
                                }
                            },
                            status: { type: Type.STRING, description: "Trạng thái hiện tại (VD: Đang bị thương)" },
                            traits: { type: Type.ARRAY, items: { type: Type.STRING } },
                            voiceSample: { type: Type.STRING, description: "Một câu thoại mẫu điển hình" },
                            emotional_state: { type: Type.STRING, description: "Trạng thái cảm xúc sâu sắc phục vụ cốt truyện" },
                            personality_traits: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Các đặc điểm tính cách hỗ trợ sâu sắc hơn" },
                            intimate_profile: {
                                type: Type.OBJECT,
                                properties: {
                                    // Bộ thuộc tính cũ
                                    sexual_response: { type: Type.STRING, description: "Phản ứng thầm kín khi làm tình, cách cơ thể phản hồi nhạy cảm" },
                                    libido: { type: Type.STRING, description: "Mức độ ham muốn tình dục, nhịp độ dục vọng" },
                                    sexual_initiative: { type: Type.STRING, description: "Mức độ chủ động/thụ động/bán chủ động khi ân ái" },
                                    kinks: { type: Type.STRING, description: "Xu hướng đặc biệt hoặc gu thầm kín khi mặn nồng" },
                                    intimate_emotion: { type: Type.STRING, description: "Mặt cảm xúc tinh thần khi ân ái mặn nồng (chiếm hữu, yếu mềm, gắn kết...)" },
                                    bedroom_personality: { type: Type.STRING, description: "Tính cách/phong thái trên giường ngủ khi âu yếm" },

                                    // Bộ thuộc tính mới
                                    reaction_intimate: { type: Type.STRING, description: "Phản ứng thầm kín khi làm tình, cách cơ thể phản hồi nhạy cảm" },
                                    libido_level: { type: Type.STRING, description: "Mức độ ham muốn tình dục, nhịp độ dục vọng" },
                                    assertiveness_level: { type: Type.STRING, description: "Mức độ chủ động/thụ động/bán chủ động khi ân ái" },
                                    quirks: { type: Type.STRING, description: "Xu hướng đặc biệt hoặc thói quen thầm kín khi mây mưa" },
                                    intimate_personality: { type: Type.STRING, description: "Tính cách/phong thái trên giường ngủ khi âu yếm" }
                                }
                            }
                        },
                        required: ["name", "role", "description", "core_personality"],
                    }
                }
            }
          }
        }
      });

      const parsed = cleanAndParseJSON(response.text || "{}");
      const list = parsed.characters || (Array.isArray(parsed) ? parsed : []);
      
      if (!Array.isArray(list)) return [];

      return list.map((c: any, index: number) => {
        const mappedChar = {
          ...c,
          id: `char_${Date.now()}_${index}`,
          traits: c.traits || []
        };

        if (mappedChar.intimate_profile) {
          const ip = mappedChar.intimate_profile;
          mappedChar.intimate_profile = {
            ...ip,
            sexual_response: ip.sexual_response || ip.reaction_intimate || "",
            reaction_intimate: ip.reaction_intimate || ip.sexual_response || "",

            libido: ip.libido || ip.libido_level || "",
            libido_level: ip.libido_level || ip.libido || "",

            sexual_initiative: ip.sexual_initiative || ip.assertiveness_level || "",
            assertiveness_level: ip.assertiveness_level || ip.sexual_initiative || "",

            kinks: ip.kinks || ip.quirks || "",
            quirks: ip.quirks || ip.kinks || "",

            intimate_emotion: ip.intimate_emotion || "",

            bedroom_personality: ip.bedroom_personality || ip.intimate_personality || "",
            intimate_personality: ip.intimate_personality || ip.bedroom_personality || ""
          };
        }

        return mappedChar;
      });
    } catch (e) {
      console.error("Extraction failed", e);
      return [];
    }
  },

  // New method for Fanfic mode using Google Search Grounding
  async ingestFanficData(fandomName: string, url: string): Promise<{ setting: string; characters: Character[] }> {
    const ai = getAI();
    let prompt = `Research the Fandom/Series "${fandomName}"`;
    if (url && url.length > 5) {
        prompt += ` and the Wiki topic at this URL: "${url}"`;
    }
    
    prompt += `.
    
    Task 1: Summarize the World Building, Power System (Levels, Skills), and key Lore into a comprehensive "Setting" description (in Vietnamese).
    Task 2: Extract key characters mentioned in the source material with their deep profiles (Appearance, Personality, Powers).

    Return the result in JSON format.`;

    try {
      const response = await ai.models.generateContent({
        model: MODEL_AUX,
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        config: {
          tools: [{ googleSearch: {} }], // Use Search for grounding
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              setting: { type: Type.STRING, description: "Detailed description of world, power system, and lore in Vietnamese." },
              characters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    role: { type: Type.STRING },
                    description: { type: Type.STRING },
                    appearance: {
                        type: Type.OBJECT,
                        properties: {
                            general: { type: Type.STRING },
                            face: { type: Type.STRING },
                            body: { type: Type.STRING },
                            hair: { type: Type.STRING },
                            clothing: { type: Type.STRING },
                        },
                    },
                    core_personality: { type: Type.STRING },
                    traits: { type: Type.ARRAY, items: { type: Type.STRING } },
                  },
                  required: ["name", "role", "description"],
                }
              }
            },
            required: ["setting", "characters"],
          }
        }
      });

      const data = cleanAndParseJSON(response.text || "{}");
      
      const characters = Array.isArray(data.characters) 
        ? data.characters.map((c: any, index: number) => ({
            ...c,
            id: `char_fanfic_${Date.now()}_${index}`,
            traits: c.traits || [],
            // Fallbacks for optional deeply nested fields if not returned by generic fanfic search
            appearance: c.appearance || { general: "Không rõ", face: "", body: "", hair: "", clothing: "" },
            core_personality: c.core_personality || "Không rõ",
            personality: c.core_personality || "",
          }))
        : [];

      return {
        setting: data.setting || "",
        characters: characters
      };

    } catch (e) {
      console.error("Fanfic ingestion failed", e);
      // Return empty structure if search fails so the user can fill it manually
      return { setting: "", characters: [] };
    }
  },

  async summarize(text: string, pronounStyle: string): Promise<string> {
    const systemInstruction = promptBuilderService.buildSummarySystemInstruction(pronounStyle);
    const prompt = `Hãy đọc văn bản sau và tạo bản tóm tắt nén cho AI, tuân thủ đúng hệ thống xưng hô.\n\nVăn bản:\n${text}`;
    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: MODEL_AUX,
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                systemInstruction: systemInstruction,
                thinkingConfig: { thinkingBudget: 4096 }
            }
        });
        return response.text || "";
    } catch (e) {
        return "";
    }
  }
};