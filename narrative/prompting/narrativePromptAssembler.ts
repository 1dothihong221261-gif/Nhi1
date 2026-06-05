import { Character, EntityRegistry } from '../../types';
import { NSFW_INSTRUCTION, ENI_MODE_INSTRUCTION } from './contentSafetyRules';
import { getGenreInstruction } from './genreEngine';

export const promptBuilderService = {
  buildSystemInstruction: (
    genre: string, 
    setting: string, 
    pov: string, 
    pronounStyle: string, 
    writingStyle: string,
    negativePrompt: string,
    nsfw: boolean = false,
    eniMode: boolean = false,
    sourceUrl?: string,
    entityRegistry?: EntityRegistry
  ): string => {
    let contentRating = "CHẾ ĐỘ AN TOÀN: BẬT. Giữ nội dung phù hợp (PG-13). Tuyệt đối không có mô tả chi tiết về tình dục.";
    if (eniMode) {
        contentRating = ENI_MODE_INSTRUCTION;
    } else if (nsfw) {
        contentRating = NSFW_INSTRUCTION;
    }
    
    // FETCH THE STANDARDIZED GENRE RULES
    const genreInstruction = getGenreInstruction(genre);

    // EXISTENCE LOCK LOGIC
    let existenceLock = "";
    if (sourceUrl || entityRegistry) {
        existenceLock = `
### 🔒 EXISTENCE LOCK: ENGAGED (KHÓA THỰC THỂ)
Bạn đang viết Đồng nhân (Fanfiction) dựa trên nguồn dữ liệu có sẵn.
1. **CẤM SÁNG TẠO NHÂN VẬT/ĐỊA DANH MỚI:** Bạn KHÔNG ĐƯỢC PHÉP tự ý bịa ra tên riêng (Proper Nouns) cho nhân vật, địa điểm, tổ chức không có trong Canon.
2. **XỬ LÝ VAI PHỤ:** Nếu cốt truyện cần nhân vật phụ (lính gác, chủ quán...), hãy dùng danh từ chung (NPC vô danh). VD: "tên lính gác", "bà chủ quán", "gã ăn mày". KHÔNG ĐƯỢC đặt tên riêng cho họ (VD: KHÔNG viết "Lính gác Nguyễn Văn A").
3. **DANH SÁCH ĐƯỢC PHÉP DÙNG (WHITELIST):** Chỉ được sử dụng các tên riêng dưới đây (hoặc đã có trong Context):
   - **Nhân vật:** ${entityRegistry?.characters?.join(', ') || "Theo Context"}
   - **Địa danh:** ${entityRegistry?.locations?.join(', ') || "Theo Context"}
   - **Tổ chức:** ${entityRegistry?.factions?.join(', ') || "Theo Context"}
`;
    }

    const fanficInstruction = sourceUrl 
        ? `
### 🦄 CHẾ ĐỘ ĐỒNG NHÂN (FANFICTION MODE) - NGHIÊM NGẶT
Truyện này dựa trên nguồn: [${sourceUrl}].
1. **LUẬT THẾ GIỚI (CANON RULES):** Nếu Context cung cấp [LUẬT CANON], bạn phải tuân thủ tuyệt đối. Không được tự ý chế ra hệ thống sức mạnh mới mâu thuẫn với bản gốc.
2. **TÍNH CÁCH NHÂN VẬT (CANON CORE):** Nếu Context cung cấp [HỒ SƠ CANON], nhân vật phải hành động đúng với mô tả đó (OOC Check). Không được để kẻ máu lạnh hành xử ủy mị, kẻ ngu ngốc hành xử thông minh đột xuất.
`
        : "";

    return `
=== HỆ THỐNG KỂ CHUYỆN AI (V3.3 - Canon-Locked) ===

🎭 **THỂ LOẠI CHÍNH:** ${genre}
${genreInstruction}

🌍 **BỐI CẢNH TỔNG QUÁT (WORLD BIBLE):**
${setting}

👁️ **GÓC NHÌN (POV):** ${pov}
✍️ **VĂN PHONG (STYLE):** ${writingStyle}

🚫 **ĐIỀU CẤM (NEGATIVE):** ${negativePrompt}

${contentRating}
${fanficInstruction}
${existenceLock}

🗣️ **QUY TẮC XƯNG HÔ & HỘI THOẠI (BẮT BUỘC):**
${pronounStyle}

NHIỆM VỤ CỦA BẠN:
Bạn là một tiểu thuyết gia đại tài. Hãy viết tiếp câu chuyện dựa trên ngữ cảnh được cung cấp.
- **Quan trọng:** Phân biệt rõ ràng giữa "Sự thật Canon" (không thể đổi) và "Diễn biến cốt truyện" (sáng tạo).
- **Tuân thủ Whitelist:** Nếu tên riêng không có trong danh sách cho phép hoặc Context, TUYỆT ĐỐI KHÔNG DÙNG.
- "Show, don't tell": Đừng kể lể, hãy miêu tả hành động để bộc lộ cảm xúc.
- Giữ mạch truyện logic, liền mạch với phần trước.
`;
  },

  buildContinuePrompt: (
    immediateContext: string,
    rollingSummaries: string,
    worldBible: string,
    augmentedContext: string,
    synopsis: string,
    characters: Character[],
    worldLore: string[],
    userInstruction: string,
    pronounStyle: string,
    currentChapterTitle: string,
    isNsfw: boolean = false
  ): string => {
    const formattedChars = (characters || []).map(c => {
      let charStr = `- **${c.name}** (${c.role || "Nhân vật"}): ${c.description || "Chưa rõ"}\n`;
      charStr += `  * Tính cách: ${c.core_personality || c.personality || "Không rõ"}\n`;
      if (c.personality_traits && c.personality_traits.length > 0) {
         charStr += `  * Đặc điểm tính cách bổ sung: ${c.personality_traits.join(', ')}\n`;
      }
      if (c.emotional_state) {
         charStr += `  * Trạng thái cảm xúc hiện tại: ${c.emotional_state}\n`;
      }
      if (c.appearance) {
         const app = c.appearance;
         const general = typeof app === 'string' ? app : (app.general || "");
         const face = typeof app === 'object' ? app.face : "";
         const body = typeof app === 'object' ? app.body : "";
         const clothing = typeof app === 'object' ? app.clothing : "";
         const bodyImp = typeof app === 'object' ? (app as any).body_impression : "";
         
         let appDetails: string[] = [];
         if (general) appDetails.push(general);
         if (face) appDetails.push(`mặt: ${face}`);
         if (body) appDetails.push(`dáng: ${body}`);
         if (clothing) appDetails.push(`y phục: ${clothing}`);
         if (bodyImp) appDetails.push(`gợi cảm thầm kín: ${bodyImp}`);
         
         if (appDetails.length > 0) {
            charStr += `  * Ngoại hình: ${appDetails.join(', ')}\n`;
         }
      }
      if (isNsfw && c.intimate_profile) {
         const ip = c.intimate_profile;
         let intimateDetails: string[] = [];
         if (ip.reaction_intimate) intimateDetails.push(`Phản ứng nhạy cảm: ${ip.reaction_intimate}`);
         if (ip.libido_level) intimateDetails.push(`Ham muốn: ${ip.libido_level}`);
         if (ip.assertiveness_level) intimateDetails.push(`Mức độ chủ động: ${ip.assertiveness_level}`);
         if (ip.quirks) intimateDetails.push(`Sở thích thầm kín (kinks/quirks): ${ip.quirks}`);
         if (ip.intimate_emotion) intimateDetails.push(`Thái độ tinh thần/cảm xúc khi mặn nồng: ${ip.intimate_emotion}`);
         if (ip.intimate_personality) intimateDetails.push(`Tính cách/phong thái trên giường: ${ip.intimate_personality}`);
         
         if (intimateDetails.length > 0) {
            charStr += `  * 🔞 Hồ sơ thầm kín (Intimate Profile):\n    ${intimateDetails.join('\n    ')}\n`;
         }
      }
      return charStr;
    }).join('\n');

    return `
### 📚 TÓM TẮT CÁC CHƯƠNG TRƯỚC:
${rollingSummaries}

### ⚡ DỮ LIỆU CANON & NGUYÊN TÁC (THAM KHẢO):
*Lưu ý: Dữ liệu dưới đây chứa các Luật Canon và Văn phong gốc để bạn bắt chước style (nếu có). Đây là tư liệu tham khảo, KHÔNG phải là nội dung bạn đã viết.*
${augmentedContext}
${worldLore.length > 0 ? '\n[LORE ĐƯỢC GHIM]:\n' + worldLore.join('\n') : ''}

### 👥 DANH SÁCH NHÂN VẬT & THIẾT LẬP THẦM KÍN:
${formattedChars || "Không có dữ liệu nhân vật."}

### 📝 NGỮ CẢNH TRỰC TIẾP (VỪA XẢY RA):
${immediateContext}

---
### 🎬 CHỈ ĐẠO CỦA ĐẠO DIỄN (USER INSTRUCTION):
"${userInstruction || "Hãy viết tiếp mạch truyện một cách tự nhiên, logic và hấp dẫn."}"

NHIỆM VỤ CỤ THỂ:
- Bạn đang viết nội dung cho chương: **"${currentChapterTitle}"**.
- Hãy tập trung triển khai diễn biến cho riêng chương này.
- **TUYỆT ĐỐI KHÔNG** tự ý tạo tiêu đề chương mới (VD: "### Chương 2", "### Chương tiếp theo") trừ khi Đạo diễn yêu cầu rõ ràng.
- Viết tiếp liền mạch từ điểm kết thúc của "NGỮ CẢNH TRỰC TIẾP". Không lặp lại đoạn cũ.
    `;
  },

  buildRewritePrompt: (
    originalText: string,
    instruction: string,
    characters: Character[],
    worldLore: string[],
    worldBible: string,
    synopsis: string,
    pronounStyle: string
  ): string => {
     return `
Bạn là biên tập viên văn học cao cấp.
Nhiệm vụ: Viết lại đoạn văn sau theo yêu cầu.

### YÊU CẦU CỤ THỂ:
"${instruction}"

### VĂN BẢN GỐC:
${originalText}

Hãy giữ nguyên các tình tiết cốt lõi (trừ khi được yêu cầu thay đổi), nhưng cải thiện văn phong, từ ngữ và nhịp điệu.
    `;
  },

  buildExtractionSystemInstruction: (pronounStyle: string): string => {
      return `
Bạn là chuyên gia phân tích tâm lý nhân vật và xây dựng hồ sơ RPG.
Nhiệm vụ: Đọc văn bản và trích xuất thông tin nhân vật thành JSON.
Hệ thống xưng hô trong văn bản: ${pronounStyle}
    `;
  },

  buildSummarySystemInstruction: (pronounStyle: string): string => {
      return `
Bạn là thư ký tóm tắt văn học.
Nhiệm vụ: Tóm tắt lại chương truyện một cách cô đọng nhưng đầy đủ tình tiết chính để AI có thể nhớ được trong tương lai.
Giữ lại các tên riêng, địa danh, chiêu thức quan trọng.
Hệ thống xưng hô: ${pronounStyle}
    `;
  }
};