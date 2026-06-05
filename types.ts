


export interface VectorData {
  id: string;
  storyId: string;
  text: string;
  embedding: number[];
  magnitude?: number; 
  createdAt: number; 
  metadata: {
    // canon_core: Tính cách/Tâm lý cốt lõi (Priority cao nhất, không được vi phạm)
    // canon_rule: Luật thế giới/Hệ thống sức mạnh
    // canon_rel: Mối quan hệ giữa các nhân vật
    // source_material: Dữ liệu thô (Dùng làm backup, priority thấp)
    type: 'chapter' | 'character' | 'lore' | 'summary' | 'beat' | 'source_material' | 'canon_core' | 'canon_rule' | 'canon_rel';
    referenceId: string; // Links to Chapter ID or Character ID
    sceneId?: string;    
    characterIds?: string[]; 
    chapterIndex?: number;   
    importance?: number;     // 1-5 (5 = Canon không thể phá vỡ)
    pov?: string;            // The POV character name or style when this was written
    rule_category?: string;  // Dùng cho canon_rule (magic, tech, history)
  };
}

export interface CharacterAppearance {
  general: string;
  face: string;
  body: string;
  hair: string;
  clothing: string;
  body_impression?: string; // For NSFW/Intimate scenes
}

export interface IntimateProfile {
  // Bộ thuộc tính cũ
  sexual_response?: string;     // Phản ứng khi làm tình (Sexual response/reaction)
  libido?: string;              // Ham muốn (Sex drive/libido)
  sexual_initiative?: string;   // Mức độ chủ động (Initiative/activeness level)
  kinks?: string;               // Xu hướng đặc biệt (Kinks/special preferences)
  intimate_emotion?: string;    // Cảm xúc dành cho NSFW (Mental/emotional state in intimate settings)
  bedroom_personality?: string; // Tính cách của nhân vật dành cho NSFW (Bedroom/sexual personality)

  // Bộ thuộc tính bổ sung chuyên biệt mới cho NSFW
  reaction_intimate?: string;     // Phản ứng thầm kín khi làm tình, cách cơ thể phản hồi nhạy cảm
  libido_level?: string;          // Mức độ ham muốn tình dục, nhịp độ dục vọng
  assertiveness_level?: string;   // Mức độ chủ động/thụ động/bán chủ động khi ân ái
  quirks?: string;                // Xu hướng đặc biệt hoặc thói quen thầm kín khi mây mưa
  intimate_personality?: string;  // Tính cách/phong thái trên giường ngủ khi âu yếm
}

export interface BigFive {
    O: number;
    C: number;
    E: number;
    A: number;
    N: number;
}

export interface EmotionState {
    anger: number;
    joy: number;
    sadness: number;
    fear: number;
    trust: number;
    surprise: number;
}

export interface Character {
  id: string;
  name: string;
  role: string; 
  description: string; // Background/History
  
  // Appearance
  appearance: CharacterAppearance;
  
  // Personality (Simplified)
  core_personality: string; // Immutable core
  personality: string;      // Current expression
  
  // New fields
  mbti?: string;
  big_five?: BigFive;
  emotionState?: EmotionState;
  
  // RPG / Cultivation Status
  cultivation?: string;     // Công pháp / Cảnh giới (VD: Trúc Cơ Kỳ, Cửu Dương Thần Công)
  skills?: string[];        // Danh sách kỹ năng / Chiêu thức (VD: [Hỏa Cầu Thuật, Lăng Ba Vi Bộ])
  inventory?: string[];     // Vật phẩm mang theo (VD: [Túi Trữ Vật, Kiếm Gỗ])
  
  status?: string;          // Current short-term status (injured, happy, etc.)
  voiceSample?: string;
  
  // Extra narrative context
  emotional_state?: string;     // Trạng thái cảm xúc sâu sắc hơn phục vụ cốt truyện
  personality_traits?: string[]; // Đặc điểm tính cách bổ sung hỗ trợ đặc tả
  
  // Intimate / NSFW settings (Hồ sơ thầm kín)
  intimate_profile?: IntimateProfile;
  
  traits: string[];         // Simple tags
  avatarUrl?: string;
}

export interface Chapter {
  id: string;
  title: string;
  content: string;
  summary: string;
  order: number;
  lastUpdated: number;
}

export interface EntityRegistry {
    characters: string[];
    locations: string[];
    factions: string[];
}

export interface Story {
  id: string;
  title: string;
  synopsis: string;
  setting: string;
  genre: string;
  writingStyle?: string;  
  pov: string;            
  pronounStyle: string;   
  negativePrompt: string; 
  nsfw?: boolean;         
  eniMode?: boolean;      
  worldLore: string[]; // Replaced PinnedMemory with simple World/Lore list
  chapters: Chapter[];
  characters: Character[];
  createdAt: number;
  // Fanfic specific fields
  storyType?: 'original' | 'fanfic';
  sourceUrl?: string;
  entityRegistry?: EntityRegistry; // WHITELIST for "Existence Lock"
}

export interface BackupData {
    version: number;
    story: Story;
    vectors: VectorData[];
    exportedAt: number;
}

export interface AppState {
  currentStory: Story | null;
  isLoading: boolean;
  isGenerating: boolean;
  activeChapterId: string | null;
  showSidebar: boolean;
}

export type GenerationMode = 'continue' | 'outline' | 'rewrite';