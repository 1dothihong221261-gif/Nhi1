export interface ChunkingOptions {
  min?: number;    // Độ dài tối thiểu
  target?: number; // Độ dài lý tưởng
  max?: number;    // Độ dài tối đa
  overlap?: number; // Độ dài chồng lấn (overlap) bằng ký tự
}

export const chunkingService = {
  /**
   * Giúp giữ nguyên tính toàn vẹn và hỗ trợ overlap bối cảnh
   */
  chunkTextByParagraph: (text: string, options: ChunkingOptions = {}): string[] => {
    if (!text) return [];
    const { min = 500, target = 850, max = 1200, overlap = 150 } = options;
    
    // Tách
    const paras = text.split(/\n\s*\n/);
    const chunks: string[] = [];
    let buffer = '';

    for (const p of paras) {
      const cleanP = p.trim();
      if (!cleanP) continue;

      // Nếu một đoạn văn duy nhất đã quá dài
      if (cleanP.length > max) {
        if (buffer) {
          chunks.push(buffer.trim());
          buffer = '';
        }
        // Regex tách câu cơ bản
        const sentences = cleanP.match(/[^.!?]+[.!?]+(\s|$)/g) || [cleanP];
        let subBuffer = '';
        for (const sent of sentences) {
          if ((subBuffer + sent).length > target && subBuffer.length >= min) {
            chunks.push(subBuffer.trim());
            
            // Apply sentence level overlap if desired
            if (overlap > 0 && subBuffer.length > overlap) {
              const overlapText = subBuffer.substring(subBuffer.length - overlap);
              const spaceIdx = overlapText.indexOf(' ');
              const cleanOverlap = spaceIdx !== -1 ? overlapText.substring(spaceIdx + 1) : overlapText;
              subBuffer = cleanOverlap + sent;
            } else {
              subBuffer = sent;
            }
          } else {
            subBuffer += sent;
          }
        }
        if (subBuffer) buffer = subBuffer;
        continue;
      }

      const prospectiveLength = buffer ? buffer.length + 2 + cleanP.length : cleanP.length;

      if (prospectiveLength > max) {
        if (buffer) {
          chunks.push(buffer.trim());
          
          if (overlap > 0 && buffer.length > overlap) {
            const overlapText = buffer.substring(buffer.length - overlap);
            const spaceIdx = overlapText.indexOf(' ');
            const cleanOverlap = spaceIdx !== -1 ? overlapText.substring(spaceIdx + 1) : overlapText;
            buffer = cleanOverlap + '\n\n' + cleanP;
          } else {
            buffer = cleanP;
          }
        } else {
          buffer = cleanP;
        }
      } else if (prospectiveLength > target && buffer.length >= min) {
        chunks.push(buffer.trim());
        
        if (overlap > 0 && buffer.length > overlap) {
          const overlapText = buffer.substring(buffer.length - overlap);
          const spaceIdx = overlapText.indexOf(' ');
          const cleanOverlap = spaceIdx !== -1 ? overlapText.substring(spaceIdx + 1) : overlapText;
          buffer = cleanOverlap + '\n\n' + cleanP;
        } else {
          buffer = cleanP;
        }
      } else {
        buffer = buffer ? (buffer + '\n\n' + cleanP) : cleanP;
      }
    }

    if (buffer.trim()) chunks.push(buffer.trim());
    return chunks;
  }
};
