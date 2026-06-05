import { VectorData } from '../../types';

/**
 * Tính toán độ lớn của Vector (Magnitude) với cơ cấu cache bảo vệ
 */
export const getMagnitude = (vec: number[]): number => {
  if (!vec || vec.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < vec.length; i++) {
    sum += vec[i] * vec[i];
  }
  return Math.sqrt(sum);
};

/**
 * Tính toán độ tương đồng Cosine tối ưu hóa dải băng thông
 */
export const cosineSimilarityOptimized = (vecA: number[], vecB: number[], normA: number, normB: number): number => {
  if (vecA.length !== vecB.length) return 0;
  let dotProduct = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (normA * normB);
};

// Cấu hình (Memory Decay) - Canon Data không bao giờ bị quên (Decay = 0)
const DECAY_RATES: Record<string, number> = {
  'lore': 0,           
  'canon_core': 0,     // Tuyệt đối không quên tính cách nhân vật
  'canon_rule': 0,     // Tuyệt đối không quên luật thế giới
  'canon_rel': 0,      // Tuyệt đối không quên quan hệ
  'source_material': 0.001, // Dữ liệu thô ít quan trọng hơn
  'character': 0,      
  'summary': 0.002,    
  'chapter': 0.015,    
  'beat': 0.08,        
};

/**
 * Điểm số tối thiểu cho phép đối với từng loại dữ liệu
 */
const MIN_SCORE_BY_TYPE: Record<string, number> = {
  'canon_core': 0.45,  // Nới lỏng một chút để đảm bảo tìm thấy tính cách chủ chốt
  'canon_rule': 0.48,
  'canon_rel': 0.48,
  'lore': 0.55,
  'source_material': 0.55, 
  'character': 0.52,
  'summary': 0.50,
  'chapter': 0.48,
  'beat': 0.45,
};

export interface SearchOptions {
  topK?: number;
  focusCharacterIds?: string[]; 
  minScore?: number;
  currentPov?: string;
  maxChunksPerSource?: number; 
  queryText?: string;          // Nội dung text dạng thô để kéo tìm kiếm Hybrid BM25
  hybridAlpha?: number;        // Trọng số hòa trộn Dense (alpha) và BM25 (1 - alpha), mặc định 0.65
}

/**
 * 🛠️ BỘ CÔNG CỤ TÌM KIẾM TỪ KHÓA BM25 SIÊU NHẸ (Client-side BM25 Search Engine)
 * Đảm bảo các thuật ngữ chuyên môn, danh từ riêng cổ trang/tu tiên không bị thất lạc.
 */
interface BM25Index {
  documentId: string;
  termFreqs: Map<string, number>;
  docLen: number;
}

const tokenizeText = (text: string): string[] => {
  if (!text) return [];
  // Tokenize gộp cả chữ tiếng Việt dính dấu, chữ Latin thường gặp, loại bỏ ký tự đặc biệt
  return text
    .toLowerCase()
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'\[\]]/g, " ")
    .split(/\s+/)
    .filter(word => word.length > 0);
};

export const computeBM25Scores = (
  queryText: string,
  vectors: VectorData[]
): Map<string, number> => {
  const scores = new Map<string, number>();
  if (!queryText || vectors.length === 0) return scores;

  const queryTerms = tokenizeText(queryText);
  if (queryTerms.length === 0) return scores;

  const N = vectors.length;
  const indices: BM25Index[] = [];
  let totalDocLen = 0;
  const docFreqs = new Map<string, number>();

  // 1. Phân tích ngữ cảnh tần suất từ khóa trong DB
  vectors.forEach(v => {
    const tokens = tokenizeText(v.text);
    const termFreqs = new Map<string, number>();
    tokens.forEach(t => {
      termFreqs.set(t, (termFreqs.get(t) || 0) + 1);
    });

    indices.push({
      documentId: v.id,
      termFreqs,
      docLen: tokens.length
    });

    totalDocLen += tokens.length;

    // Tính Document Frequency (df)
    termFreqs.forEach((_, term) => {
      docFreqs.set(term, (docFreqs.get(term) || 0) + 1);
    });
  });

  const avgdl = totalDocLen / N || 1;
  const k1 = 1.2;
  const b = 0.75;

  // 2. Tính điểm BM25 cho từng văn bản
  indices.forEach(idx => {
    let docScore = 0;
    queryTerms.forEach(term => {
      const df = docFreqs.get(term) || 0;
      if (df === 0) return;

      // IDF kinh điển (Smooth)
      const idf = Math.log(1 + (N - df + 0.5) / (df + 0.5));
      const tf = idx.termFreqs.get(term) || 0;

      // BM25 Formula
      const numerator = tf * (k1 + 1);
      const denominator = tf + k1 * (1 - b + b * (idx.docLen / avgdl));
      docScore += idf * (numerator / denominator);
    });

    if (docScore > 0) {
      scores.set(idx.documentId, docScore);
    }
  });

  return scores;
};

export const narrativeMemoryService = {
  /**
   * Truy vấn tìm kiếm lai kết hợp (Hybrid Search: Dense Vector + BM25)
   */
  search: (
    queryEmbedding: number[], 
    vectors: VectorData[], 
    options: SearchOptions = {}
  ): VectorData[] => {
    if (vectors.length === 0) return [];
    
    const { 
      topK = 6, 
      focusCharacterIds = [], 
      minScore = 0.52, 
      currentPov = "",
      maxChunksPerSource = 2,
      queryText = "",
      hybridAlpha = 0.65 
    } = options;

    const queryNorm = getMagnitude(queryEmbedding);
    if (queryNorm === 0) return [];

    // 1. Tính toán điểm BM25 nếu có queryText
    let bm25Scores = new Map<string, number>();
    let maxBM25 = 0;
    if (queryText && queryText.trim().length > 0) {
      bm25Scores = computeBM25Scores(queryText, vectors);
      bm25Scores.forEach(val => {
        if (val > maxBM25) maxBM25 = val;
      });
    }

    const now = Date.now();
    const ONE_DAY_MS = 86400000;

    const scored = vectors
      .filter(v => {
        if (!v.embedding || !Array.isArray(v.embedding)) {
          console.warn(`Skipping vector item ${v.id} as it lacks a valid embedding.`);
          return false;
        }
        if (v.embedding.length !== queryEmbedding.length) {
          console.warn(`Skipping vector item ${v.id} due to dimension mismatch: query dimension is ${queryEmbedding.length}, vector has ${v.embedding.length} dimensions.`);
          return false;
        }
        return true;
      })
      .map(v => {
        // A. Tính điểm ngữ nghĩa Vector (Dense cosine similarity)
        const vecNorm = v.magnitude || getMagnitude(v.embedding);
        const semanticScore = cosineSimilarityOptimized(queryEmbedding, v.embedding, queryNorm, vecNorm);
        
        // B. Lấy điểm BM25 và chuẩn hóa về miền 0 đến 1
        const rawBM25 = bm25Scores.get(v.id) || 0;
        const normalizedBM25 = maxBM25 > 0 ? rawBM25 / maxBM25 : 0;

        // C. Kết hợp lai (Hybrid Fusion Score)
        const combinedBaseScore = queryText.trim().length > 0
          ? (hybridAlpha * semanticScore + (1 - hybridAlpha) * normalizedBM25)
          : semanticScore;

        // D. Tăng cường dựa trên độ quan trọng (Importance Boost)
        const importanceBoost = 1 + ((v.metadata.importance || 1) - 1) * 0.08;

        // E. Tăng cường nếu đúng nhân vật đang focus (Character Focus Boost)
        let charBoost = 1.0;
        if (focusCharacterIds.length > 0 && v.metadata.characterIds) {
          if (v.metadata.characterIds.some(id => focusCharacterIds.includes(id))) {
            if (v.metadata.type === 'canon_core' || v.metadata.type === 'canon_rel') {
                charBoost = 1.4; 
            } else {
                charBoost = 1.25;
            }
          }
        }

        // F. Chiến lược khớp Góc nhìn (POV Boost)
        let povBoost = 1.0;
        if (currentPov && v.metadata.pov) {
          povBoost = v.metadata.pov === currentPov ? 1.1 : 0.9;
        }

        // G. Áp dụng Decay thời gian cho trí nhớ ngắn hạn
        const type = v.metadata.type;
        const decayRate = DECAY_RATES[type] ?? 0.02; 
        
        let decayMult = 1.0;
        if (decayRate > 0) {
          const daysOld = (now - v.createdAt) / ONE_DAY_MS;
          decayMult = Math.max(0.6, 1 - (daysOld * decayRate));
        }

        // H. Trọng số ưu tiên tầng của MTS-RAG (Type Priority)
        let typeMult = 1.0;
        if (type === 'canon_core') typeMult = 1.4; // Đảm bảo tính nhất quán của tâm hồn nhân vật
        if (type === 'canon_rule') typeMult = 1.35; // Bảo chứng luật chơi tu tiên/sức mạnh
        if (type === 'canon_rel') typeMult = 1.25;  // Quan hệ tương tác
        if (type === 'lore') typeMult = 1.2;
        if (type === 'summary') typeMult = 1.1;     // Trí nhớ tóm tắt tập chương cũ
        if (type === 'source_material') typeMult = 0.9; // Hạ thấp để tránh nhầm chữ thô nguyên tác

        const finalScore = combinedBaseScore * importanceBoost * charBoost * povBoost * decayMult * typeMult;

        return { item: v, score: finalScore };
      });

    // Sắp xếp theo điểm số giảm dần
    scored.sort((a, b) => b.score - a.score);

    const sourceCounter = new Map<string, number>();
    const results: VectorData[] = [];

    for (const s of scored) {
      const typeMinScore = MIN_SCORE_BY_TYPE[s.item.metadata.type] ?? minScore;
      if (s.score < typeMinScore) continue; 
      
      if (results.length >= topK) break;
      
      const sourceId = s.item.metadata.referenceId || s.item.id;
      const currentSourceCount = sourceCounter.get(sourceId) || 0;
      
      // Cho phép Canon Rule và Core hiển thị tự do hơn các trích đoạn chương lẻ
      const typeLimit = (s.item.metadata.type === 'canon_rule' || s.item.metadata.type === 'canon_core') ? 4 : maxChunksPerSource;

      if (currentSourceCount < typeLimit) {
        results.push(s.item);
        sourceCounter.set(sourceId, currentSourceCount + 1);
      }
    }

    return results;
  },

  /**
   * 🏆 HỆ THỐNG RAG ĐA TẦNG (Multi-Tiered Story RAG Pipeline - MTS-RAG)
   * Tách bách khoa toàn thư thành 4 Tầng độc lập, tự động lọc phân mảnh tối ưu:
   * 
   * - Tầng 1: Đạo luật & Bối cảnh bất biến (World Settings & Canon Rules)
   * - Tầng 2: Nhân cách & Tâm lý vĩnh cửu (Character Profiles & Core Instincts)
   * - Tầng 3: Tiến độ cục bộ & Quan hệ (Story Thread & Relationship dynamics)
   * - Tầng 4: Trích đoạn hồi ức chi tiết (Episodic detailed memories & Styles)
   */
  multiTieredSearch: (
    queryEmbedding: number[],
    vectors: VectorData[],
    options: SearchOptions & {
      activeCharacters?: string[]; // Danh sách các nhân vật đang hội thoại trong cảnh hiện tại
    } = {}
  ): VectorData[] => {
    if (vectors.length === 0) return [];

    const {
      focusCharacterIds = [],
      currentPov = "",
      queryText = "",
      activeCharacters = []
    } = options;

    const pipelineResults: VectorData[] = [];
    const now = Date.now();

    // Phân loại các Vectors vào 4 Tầng kết cấu dữ liệu để truy vấn đa tuyến
    const t1_RulesAndLore = vectors.filter(v => v.metadata.type === 'canon_rule' || v.metadata.type === 'lore');
    const t2_CharacterCores = vectors.filter(v => v.metadata.type === 'canon_core' || v.metadata.type === 'character');
    const t3_RelationsAndSummaries = vectors.filter(v => v.metadata.type === 'canon_rel' || v.metadata.type === 'summary');
    const t4_EpisodicChunks = vectors.filter(v => v.metadata.type === 'chapter' || v.metadata.type === 'source_material' || v.metadata.type === 'beat');

    // 🌟 TRUY VẤN TẦNG 1: Luật Thế giới & World Bible (Khóa triết lý cốt lõi)
    if (t1_RulesAndLore.length > 0) {
      // Tìm kiếm lai top-k = 2 điều luật thế giới sát sườn nhất
      const rules = narrativeMemoryService.search(queryEmbedding, t1_RulesAndLore, {
        topK: 2,
        minScore: 0.40,
        queryText: queryText
      });
      pipelineResults.push(...rules);
    }

    // 🌟 TRUY VẤN TẦNG 2: Tâm lý Nhân vật (Ngăn chặn OOC cốt tủy)
    if (t2_CharacterCores.length > 0) {
      // Phép tìm kiếm 2 luồng:
      // Luồng A: Ưu tiên nhắm trực diện vào các nhân vật đang xuất hiện tích cực trong khung cảnh hội thoại hiện thời
      const targetCharIds = focusCharacterIds.length > 0 ? focusCharacterIds : activeCharacters;
      
      if (targetCharIds.length > 0) {
        const charactersPresent = t2_CharacterCores.filter(v => 
          v.metadata.characterIds && v.metadata.characterIds.some(id => targetCharIds.includes(id))
        );
        // Lấy toàn bộ profiles cốt lõi của họ (hoặc giới hạn tối đa 3 profiles quan trọng nhất)
        pipelineResults.push(...charactersPresent.slice(0, 3));
      }

      // Luồng B: Tìm ngẫu nhiên hồ sơ nhân vật liên lụy khác khớp bổ trợ qua Semantic Search
      const semanticChars = narrativeMemoryService.search(queryEmbedding, t2_CharacterCores, {
        topK: 2,
        minScore: 0.45,
        queryText: queryText
      });
      // Chỉ gộp nếu chưa có trong danh sách
      semanticChars.forEach(sc => {
        if (!pipelineResults.some(pr => pr.id === sc.id)) {
          pipelineResults.push(sc);
        }
      });
    }

    // 🌟 TRUY VẤN TẦNG 3: Chuỗi Sự Kiện Cận Cảnh & Mối Quan Hệ (Giữ mạch liên hoan cốt truyện)
    if (t3_RelationsAndSummaries.length > 0) {
      // Tìm 1 tóm tắt đại cảnh chương trước gần nhất và 1 mối quan hệ gắn bó
      const relationsAndHistory = narrativeMemoryService.search(queryEmbedding, t3_RelationsAndSummaries, {
        topK: 2,
        minScore: 0.45,
        queryText: queryText,
        focusCharacterIds: focusCharacterIds.length > 0 ? focusCharacterIds : activeCharacters
      });
      pipelineResults.push(...relationsAndHistory);
    }

    // 🌟 TRUY VẤN TẦNG 4: Chi tiết tập kịch cục bộ & Văn phong gốc (Style Alignment)
    if (t4_EpisodicChunks.length > 0) {
      // Tìm max topk = 3 phân mảnh ngữ cảnh quá khứ cụ thể để lấy dữ liệu nhỏ lẻ ráp tiếp nối
      const semanticContextChunks = narrativeMemoryService.search(queryEmbedding, t4_EpisodicChunks, {
        topK: 3,
        minScore: 0.45,
        queryText: queryText,
        currentPov: currentPov
      });
      pipelineResults.push(...semanticContextChunks);
    }

    // Trả về danh sách nén gọn gàng, loại bỏ trùng lắp bất thường
    const uniqueMap = new Map<string, VectorData>();
    pipelineResults.forEach(v => {
      uniqueMap.set(v.id, v);
    });

    return Array.from(uniqueMap.values());
  }
};
