export interface GenreDefinition {
    id: string;
    keywords: string[];
    name: string;
    description: string;
    systemPrompt: string;
}

export const GENRE_PRESETS: GenreDefinition[] = [
    {
        id: "tien_hiep",
        name: "Tiên Hiệp / Tu Chân",
        keywords: ["tiên hiệp", "tu tiên", "tu chân", "xianxia"],
        description: "Tập trung vào hành trình tu tiên đắc đạo, nghịch thiên tầm đạo, cảnh giới luyện khí, trúc cơ, kim đan...",
        systemPrompt: `
### ⚔️ QUY TẮC THỂ LOẠI: TIÊN HIỆP / TU CHÂN (XIANXIA)
1. **Hệ thống sức mạnh & Cảnh giới:** Tuân thủ tuyệt đối các thuật ngữ tu chân: Luyện Khí, Trúc Cơ, Kim Đan, Nguyên Anh, Hóa Thần... Sức mạnh đi liền với ngộ đạo, tâm cảnh, thiên kiếp, tẩy tủy, luyện đan, bố trận.
2. **Phong thái văn học:** Sử dụng phong phú từ Hán Việt trang trọng, phong trần, đậm chất cổ phong cổ đại. Văn phong thoát tục, đại khí, thâm trầm nhưng tàn khốc ("Đạo nhân vô tình", thế kỷ cá lớn nuốt cá bé).
3. **Thuật ngữ độc quyền:** Linh khí, phi kiếm, đạo hữu, thiên kiếp, tinh thạch, đan điền, thức hải, độ kiếp, mật thất, đan dược.
4. **Cấm kỵ khí thế:** KHÔNG được dùng ngôn bừa bãi hay từ dịch hiện đại ("ok", "chill", "funny", "computational", "lắp đặt"). Tránh viết các hành động đời thường quá trần tục trừ khi tăng tiến ngộ đạo.
`
    },
    {
        id: "huyen_huyen",
        name: "Huyền Huyễn / Khoa Huyễn Diệu Kỳ",
        keywords: ["huyền huyễn", "huyễn tưởng", "xuanhuan"],
        description: "Thế giới dị giới, bạo phát sức mạnh huyết mạch, ma thú, đấu khí, võ hồn...",
        systemPrompt: `
### 🔮 QUY TẮC THỂ LOẠI: HUYỀN HUYỄN (XUANHUAN)
1. **Hệ thống sức mạnh:** Sử dụng đấu khí, võ hồn, ma thú, tinh linh, huyết mạch truyền thừa, thần binh tinh thạch. Chiến đấu tốc độ cao, hào sảng, bộc phát rực rỡ kì ảo.
2. **Phong thái văn học:** Hùng tráng, nhiệt huyết, kịch tính, nhịp điệu nhanh. Tập trung tả thực chiến đấu rực lửa, kịch trường lớn, gia tộc đối địch hoành tráng.
3. **Thuật ngữ độc quyền:** Ma thú, võ hồn, thức tỉnh, đấu khí, tông môn đại hội, võ kỹ, tuyệt học gia tộc, kết giới.
`
    },
    {
        id: "do_thi",
        name: "Đô Thị / Trọng Sinh / Hệ Thống",
        keywords: ["đô thị", "modern", "trọng sinh", "hệ thống", "system"],
        description: "Thế giới hiện đại, ẩn môn cao thủ, nghịch thiên cải mệnh, sảng văn...",
        systemPrompt: `
### 🏙️ QUY TẮC THỂ LOẠI: ĐÔ THỊ / HỆ THỐNG / SẢNG VĂN (URBAN)
1. **Đặc trưng thể loại:** Cơ duyên nghịch thiên ở đô thị hiện đại, trọng sinh giải hận hoặc ràng buộc "Hệ thống". Tả thực thương trường đấu đá, thế gia ẩn thế, võ học cổ truyền, y thuật nghịch thiên vả mặt kẻ địch.
2. **Văn phong:** Gãy gọn, hiện đại, nhịp điệu kích tính nhanh, sắc bén, xen kẽ hài hước thâm sâu.
3. **Thuật ngữ độc quyền:** Ký chủ, hệ thống, kích hoạt nhiệm vụ, tích điểm đổi thưởng, tập đoàn, thế gia ẩn sơn, cổ võ, châm cứu.
`
    },
    {
        id: "khoa_huyen",
        name: "Khoa Huyễn / Sci-Fi / Cyberpunk",
        keywords: ["khoa huyễn", "scifi", "cyberpunk", "vũ trụ", "tương lai"],
        description: "Cơ giáp, chiến hạm không gian, AI, biến đổi gen, cybernetics...",
        systemPrompt: `
### 🚀 QUY TẮC THỂ LOẠI: KHOA HUYỄN / SCI-FI / CYBERPUNK
1. **Đặc trưng thể loại:** Viễn tưởng tương lai, chiến hạm không gian tinh vân, cơ giáp mecha đại chiến, trí tuệ nhân tạo (AI), thế giới hậu tận thế, sửa đổi cơ thể bằng máy móc (cybernetics).
2. **Văn phong:** Logic, lạnh lùng, mang đặc tính kỹ thuật cao thuyết phục, mô tả công nghệ dứt khoát sắc lạnh, cô độc hoành tráng hoặc bụi bặm gai góc.
3. **Thuật ngữ độc quyền:** Cơ giáp, thạch anh động lực, chỉ năng nhân tạo, tinh vân chiến hạm, cấy ghép cyber, mô-đun năng lượng.
`
    },
    {
        id: "vong_du",
        name: "Võng Du / LitRPG",
        keywords: ["võng du", "litrpg", "game", "trò chơi"],
        description: "Thế giới trò chơi thực tế ảo, game hóa thực tại, thuộc tính thủ hộ...",
        systemPrompt: `
### 🎮 QUY TẮC THỂ LOẠI: VÕNG DU / LITRPG
1. **Đặc trưng thể loại:** Nhập vai game thực tế ảo hoặc thế giới bị game hóa thuộc tính. Tập trung vào thăng cấp (level up), tranh đoạt bãi quái, săn Boss, vượt phó bản hoàng kim, xây dựng công hội (guild).
2. **Văn phong:** Thiết thực, sôi nổi hào hứng đời thực của các game thủ, hiển thị khéo léo thông số kĩ năng mà không lạm dụng làm loãng nhịp độ chính.
3. **Thuật ngữ độc quyền:** Phó bản, Boss thế giới, bảng chỉ số, điểm kinh nghiệm, bạo kích sát thương, công hội đại chiến, trang bị sử thi.
`
    },
    {
        id: "trinh_tham",
        name: "Trinh Thám / Kỳ Bí / Kinh Dị",
        keywords: ["trinh thám", "kỳ bí", "suspense", "mystery", "kinh dị"],
        description: "Phá án tìm manh mối, giải mã tội phạm ẩn dụ, rùng rợn tâm linh kỳ quái...",
        systemPrompt: `
### 🕵️‍♂️ QUY TẮC THỂ LOẠI: TRINH THÁM / KỲ BÍ (MYSTERY / SUSPENSE)
1. **Đặc trưng thể loại:** Khảo sát manh mối hiện trường, logic suy lý, tội phạm thông minh vượt trội, hoặc linh hồn kì bí, bóng tối u linh kinh sợ bần bật.
2. **Văn phong:** U ám trầm lặng, hồi hộp căng thẳng, kích hoạt cao độ các giác quan của độc giả qua âm thanh khe khẽ, hơi gió buốt lạnh, mùi vị gỉ sắt...
3. **Thuật ngữ độc quyền:** Dấu vết pháp y, chứng cứ ngoại phạm, suy luận loại trừ, hung thủ dã tâm, quỷ khí, u linh hiện thế.
`
    },
    {
        id: "tay_phuong_fantasy",
        name: "Tây Phương Fantasy / Sử Thi",
        keywords: ["fantasy", "phương tây", "sử thi", "epic"],
        description: "Kiếm và ma pháp kiểu thần thoại phương Tây, kỵ sĩ, phù thủy...",
        systemPrompt: `
### 🏰 QUY TẮC THỂ LOẠI: TÂY PHƯƠNG FANTASY / KIẾM VÀ MA PHÁP
1. **Đặc trưng thể loại:** Pháp sư nguyên tố, kỵ sĩ thánh kiếm, loài rồng thức tỉnh, Elves kiêu hãnh, Ma vương bóng tối đại chiến đại lục.
2. **Văn phong:** Mang sắc thái văn học cổ điển phương Tây hào hùng trang nghiêm, sử thi tráng lệ, trôi chảy tự nhiên như khúc ca trung cổ.
3. **Thuật ngữ độc quyền:** Ma pháp trận, chú văn niệm chú, linh hồn thủ hộ, đấu khí kỵ sĩ, vực thẩm ma giới, vương quyền giáo hội.
`
    }
];

export const getGenreInstruction = (genreText: string): string => {
    if (!genreText) return "";
    const lower = genreText.toLowerCase();
    const matched = GENRE_PRESETS.find(preset => 
        preset.keywords.some(keyword => lower.includes(keyword))
    );
    if (matched) {
        return matched.systemPrompt;
    }
    return `
### 📝 QUY TẮC THỂ LOẠI: TỰ DO (${genreText.toUpperCase()})
- Thích ứng toàn vẹn theo phong thái văn thể tự do nhằm kiến tạo câu truyện xuất sắc nhất theo bối cảnh "${genreText}".
`;
};
