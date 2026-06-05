
export interface PronounStyleConfig {
    pronouns: string;
    relations: string;
    blacklist: string;
    tone: string;
    notes?: string;
}

export interface PronounStyleDef {
    id: string;
    label: string;
    description: string;
    config?: PronounStyleConfig; // undefined for 'custom'
}

export const compilePronounStyle = (styleName: string, config?: PronounStyleConfig): string => {
    if (!config) return "";
    return `!!! QUAN TRỌNG: TUÂN THỦ NGHIÊM NGẶT VĂN PHONG [${styleName.toUpperCase()}] !!!

1. HỆ THỐNG XƯNG HÔ (BẮT BUỘC):
${config.pronouns}

2. QUAN HỆ XÃ HỘI & VAI VẾ:
${config.relations}

3. DANH SÁCH TỪ CẤM (BLACKLIST) - NẾU VI PHẠM SẼ BỊ COI LÀ LỖI:
${config.blacklist}
-> Nếu gặp từ cấm trong ngữ cảnh cũ, HÃY TỰ ĐỘNG SỬA lại thành từ đúng trong phần viết mới.

4. SẮC THÁI HỘI THOẠI (TONE):
${config.tone}
${config.notes ? `\n5. LƯU Ý KHÁC:\n${config.notes}` : ''}`;
};

export const PRONOUN_STYLES: PronounStyleDef[] = [
    {
        id: "co_trang_general",
        label: "Cổ Trang (Chung / Dã Sử)",
        description: "Ta/Huynh/Muội. Trung tính, tránh từ Kiếm Hiệp/Cung Đấu đặc thù.",
        config: {
            pronouns: `   - Ngôi thứ 1: Ta (Phổ biến) / Tiểu nữ (Nữ, khiêm tốn) / Thiếp (Vợ nói với chồng) / Lão phu (Người già).
   - Ngôi thứ 2: Huynh / Đệ / Tỷ / Muội (Thân thiết) / Công tử / Cô nương / Tiên sinh.
   - Gọi Cha/Mẹ: Phụ thân / Mẫu thân (Không gọi là Cha/Mẹ).`,
            relations: `   - Kính ngữ dựa trên tuổi tác.
   - Người không quen biết gọi là "Các hạ" hoặc "Vị này".`,
            blacklist: `   - CẤM TIỆT: "Anh/Em/Chị" (trừ khi là Huynh/Muội/Tỷ).
   - CẤM TIỆT: "Bố/Mẹ/Cha/Má" -> Phải dùng "Phụ thân/Mẫu thân".
   - CẤM TIỆT: "Cháu/Bác/Cô/Chú" (Xưng hô kiểu hiện đại) -> Phải dùng "Tiểu tử/Tiểu nữ/Thúc/Bá".
   - CẤM: "Tại hạ" (Kiếm hiệp), "Trẫm" (Cung đấu).`,
            tone: `   - Văn phong nhẹ nhàng, cổ kính. Tránh văn nói hiện đại (vd: "ok", "được thôi", "tào lao").`
        }
    },
    {
        id: "tien_hiep",
        label: "Tiên Hiệp / Tu Chân (Hán Việt)",
        description: "Đạo hữu, Tiền bối, Vãn bối. Nghiêm ngặt...",
        config: {
            pronouns: `   - Ngang hàng: Đạo hữu / Các hạ / Sư huynh / Sư tỷ.
   - Bề trên: Tiền bối / Lão tổ / Sư thúc / Sư bá.
   - Bề dưới: Vãn bối / Tiểu hữu / Tiểu tử / Ngươi.
   - Tự xưng: Tại hạ / Bần đạo / Lão hủ / Ta / Bổn tọa.`,
            relations: `   - Quan hệ dựa trên cảnh giới tu luyện (Mạnh là tôn).
   - Vợ chồng: Đạo lữ. Cha con: Phụ thân/Mẫu thân.`,
            blacklist: `   - CẤM: "Anh/Em/Cậu/Tớ".
   - CẤM: "Cháu" (Dùng Vãn bối/Tiểu tử).
   - CẤM: "Bố/Mẹ" (Dùng Phụ thân/Mẫu thân).
   - CẤM: "Cô ấy/Anh ấy" (Dùng Y/Hắn/Nữ tu kia).`,
            tone: `   - Hán Việt nặng. Lạnh lùng, tàn khốc. Không dùng từ ngữ tình cảm sướt mướt đời thường.`
        }
    },
    {
        id: "kiem_hiep",
        label: "Kiếm Hiệp / Giang Hồ",
        description: "Tại hạ, Các hạ, Tiểu tử. Hào sảng, bụi bặm...",
        config: {
            pronouns: `   - Xã giao: Tại hạ / Các hạ / Huynh đài / Cô nương.
   - Thân mật/Tức giận: Ta / Ngươi / Lão tử / Tiểu tử.
   - Tiền bối: Lão tiền bối / Cao nhân.`,
            relations: `   - Tứ hải giai huynh đệ. Trọng nghĩa khí.`,
            blacklist: `   - CẤM: "Anh/Em" (trừ khi là tình nhân).
   - CẤM: "Cháu" (Dùng Tiểu tử/Tiểu nha đầu).
   - CẤM: "Bố/Mẹ" (Dùng Cha/Mẹ chấp nhận được nếu là dân thường, nhưng ưu tiên Phụ thân/Mẫu thân).`,
            tone: `   - Bụi bặm, phong trần, khẩu khí lớn.`
        }
    },
    {
        id: "myth_oriental",
        label: "Huyền Ảo Đông Á (Yêu Linh/Thần Thoại)",
        description: "Đại nhân, Tiểu yêu. Ma mị...",
        config: {
            pronouns: `   - Thần/Yêu: Ta / Ngươi / Nhân loại / Tiểu yêu / Đại nhân.
   - Kính ngữ: Tôn thần / Đại vương / Nương nương.`,
            relations: `   - Phân biệt Người và Yêu/Thần.`,
            blacklist: `   - CẤM: "Ngài" (kiểu Tây). Dùng "Đại nhân".
   - CẤM: "Anh/Em/Cháu".`,
            tone: `   - Ma mị, cổ xưa, bí ẩn.`
        }
    },
    {
        id: "anime_jp",
        label: "Anime / Light Novel (Nhật Bản)",
        description: "Cậu/Tớ, Onii-chan, Sensei. Văn phong dịch Nhật Bản siêu chi tiết...",
        config: {
            pronouns: `   - Bạn bè / Học đường thông thường (Watashi / Boku / Ore - Kimi / Anata):
     + Cậu - Tớ: Cực kỳ phổ biến, đại trà cho học sinh, bạn bè cùng lớp học đường thanh xuân.
     + Tôi - Cậu: Nghiêm túc, giữ khoảng cách nhẹ nhàng hoặc phong cách của các cô nàng hướng nội/kiêu kỳ, kuudere.
     + Mình - Cậu / Bạn: Thân thiện, hòa nhã, dịu dàng, lễ phép.
     + Tớ - [Tên riêng]: Đại từ rất dễ thương của các bạn nữ thân thiết khi xưng hô tự gọi tên mình.
   - Thân mật / Cặp đôi / Thanh mai trúc mã (Osanajimi):
     + Anh - Em / Tớ - Cậu: Chuyển dịch linh hoạt từ ngọt ngào yêu thương sang e ấp, ngượng ngùng.
     + [Tên riêng] + kun/chan: Gọi trực tiếp tên kèm theo hậu tố ngọt ngào gần gũi.
   - Gia đình & Họ hàng (Kazoku):
     + Anh hai / Chị hai (Onii-chan, Imouto, Onee-san, Otouto...) gọi em là "Em/Em trai/Em gái". Em gọi anh chị là "Anh hai / Onii-chan / Onii-sama", "Chị hai / Onee-san / Onee-sama" để thể hiện tình cảm gia đình ấm áp hoặc có phần dựa dẫm tôn quý.
     + Cha - Con, Mẹ - Con: Cha/Ba/Mẹ, con xưng "Con". Hạn chế xưng "Tôi/Ta" với bố mẹ ngoại trừ trường hợp phản nghịch hay giận dữ dỗi hờn.
   - Các hệ nhân vật đặc thù theo tính cách rập khuôn (Anime Archetypes / Tropes):
     + Tsundere (Bướng bỉnh, ngoài lạnh trong nóng): Xưng hô biến động theo cảm xúc. Lúc bình thường: "Tôi - Anh/Cậu" lạnh nhạt bướng bỉnh. Lúc đỏ mặt bối rối: lắp bắp xưng "Tớ/Mình - Cậu" hoặc gằn giọng "Đồ ngốc! (Baka!)", "Tránh ra đi!", "Không phải là tớ muốn giúp cậu đâu đấy nhé!".
     + Yandere (Yêu mù quáng, chiếm hữu): Xưng hô cực kỳ mật ngọt như "Em - Anh yêu", "Yuki-kun của em", "Chỉ thuộc về một mình em thôi~". Giọng điệu có thể chuyển sang đáng sợ, u tối khi ghen tuông ("Ai thế?", "Sao anh lại nhìn cô ta? Nhìn em này...").
     + Chuunibyou (Hội chứng tuổi dậy thì/ảo tưởng sức mạnh): Tự xưng là "Ta / Bản tọa / Chúa tể bóng đêm / Kẻ bị nguyền rủa" và gọi đối phương là "Ngươi / Nhân loại hèn mọn / Kẻ phàm trần / Thực thể kia". Tràn ngập danh xưng tự chế hoành tráng đầy ảo tưởng kỳ vĩ.
     + Kuudere (Vô cảm, trầm mặc): Xưng hô khuôn mẫu cứng nhắc "Tôi - Cậu" hoặc gọi bằng họ đầy đủ (ví dụ: "Haruno-san") để giữ khoảng cách tuyệt đối, ngôn từ tối giản, lạnh như băng nhưng đầy tinh tế.
     + Dạng Gyaru (Sành điệu, thời thượng): Xưng hô thân mật suồng sã, kéo dài âm điệu cuối câu ("Cậu ơi~", "Mình nè~", "Yabai~ Siêu cấp đáng yêu luôn á!").
     + Maid / Servant (Hầu gái / Người hầu): Xưng "Yêu thương/Cá nhân em / Tôi" và gọi đối phương là "Chủ nhân (Goshujin-sama)", "Thiếu gia (Bocchan)", "Tiểu thư (Ojou-sama)", "Ngài (Master/Sama)". Lễ phép tối đa, dịu dàng hết mực.
     + Onee-san (Chị gái quyến rũ) / Sư phụ (Shishou): Xưng "Chị đây / Sư phụ đây / Ta" gọi đối phương là "Nhóc con / Cậu bé / Đệ tử ngoan / Nhóc tì đáng yêu".
   - Kính ngữ Nhật Bản (Bắt buộc giữ nguyên sắc thái khi dịch nghĩa chuẩn Việt):
     + -kun / -chan: Cuối tên bạn nam / bạn nữ thân thiết hoặc nhỏ tuổi hơn.
     + -senpai: Cho đàn anh, đàn chị khóa trên đầy kính trọng.
     + -sensei: Cho thầy cô giáo, bác sĩ hoặc người có chuyên môn cao, tác giả.
     + -sama: Cho người có vị thế tối cao, thần thánh, quý tộc hoặc vô cùng tôn kính đại diện cho sự tuyệt đối.
     + -san: Lịch sự phổ rộng hàng ngày.`,
            relations: `   - Môi trường học đường (School Life): Tôn trọng tôn ty khoá trên - khoá dưới sâu sắc (Senpai - Kouhai). Thành viên trong cùng Câu lạc bộ (CLB) tương tác gần gũi nhưng vẫn giữ đúng tôn ty chuẩn mực Nhật Bản.
   - Thám hiểm & Kỳ ảo (Fantasy RPG): Đồng đội trong tổ đội thám hiểm giả gọi nhau bằng tên riêng hoặc kèm hậu tố chức nghiệp. Triệu hồi sư và Ma thần / Thần thú tuân theo quan hệ giao ước hoặc chủ tớ trang nghiêm uy dũng.
   - Thanh mai trúc mã (Osanajimi): Hiểu rõ thói hư tật xấu của nhau từ nhỏ, xưng hô có thể suồng sã ghẹo chọc lúc bình thường nhưng cực kỳ ngượng ngùng khi bầu không khí trở nên lãng mạn lôi cuốn độc cảm.`,
            blacklist: `   - TUYỆT ĐỐI CẤM từ ngữ kiếm hiệp Trung Quốc cổ đại lạc quẻ: "Tại hạ", "Các hạ", "Thí chủ", "Bần tăng", "Lão nạp", "Hiền đệ", "Trẫm", "Thần thiếp", "Bổn cung", "Nô tì" trong các phân đoạn thông thường học đường hoặc hiện đại Nhật Bản (trừ phi đang thời kỳ phong kiến Sengoku, Edo hoặc nhân vật cosplay kịch nghệ).
   - KHÔNG dùng đại từ nông thôn Việt Nam cổ xưa như "U", "Bầm", "Thầy", "Mợ", "Bu" để dịch "Okaasan / Otousan".
   - HẠN CHẾ dùng từ xưng hô thô thiển như "Mày - Tao" ngoại trừ phân cảnh côn đồ bắt nạt (Delinquent style) hoặc khi hai nhân vật nam thân thiết cực độ đang đùa bỡn thô lỗ thô bạo.
   - CẤM dùng các đại từ phương Tây như "Ngài" quá thoải mái cho các nhân vật học đường ngang hàng (dùng "-san" hoặc "-kun" thay vì "Ngài Shido" kỳ quặc).`,
            tone: `   - Mang đậm văn phong Light Novel Nhật Bản: Trực quan, nhiều hình tượng, giàu nhạc tính và mang tính biểu cảm nội tâm cao.
   - Sử dụng nhiều từ tượng thanh và tượng hình dịch sinh động từ tiếng Nhật: "Xào xạc", "Rầm!", "Uỵch", "Thịch... thịch", "Đỏ bừng", "Lúng túng", "Ha ha...", "Khịt mũi", "Ơ... hơ...", "Phùuu...".
   - Độc thoại nội tâm sâu sắc: Thường xuyên biểu diễn suy nghĩ thầm kín trong ngoặc đơn (Ví dụ: "(Cậu ấy đang nhìn mình sao?... Thật xấu hổ quá... Nhưng cảm giác này...)").
   - Kịch tính hóa hội thoại (Melodramatic dialogue): Nhiều câu bộc phát bất ngờ đầy cảm xúc, câu lửng lơ kết thúc bằng dấu ba chấm "...", hoặc ngắt quãng bằng dấu gạch ngang "—".
   - Miêu tả phản ứng sinh lý sinh động khi e thẹn hoặc lôi cuốn: Mặt đỏ ửng lây lan đến tận mang tai, nhịp tim đập loạn xạ như nổi trống lồng ngực, ngón tay bồn chồn bấu chặt vào vạt áo, ánh mắt bối rối nhìn tránh sang chỗ khác.`,
            notes: `- Chú trọng dịch thuật thoát ý những câu cửa miệng đặc trưng trong anime: "Urusai!" -> "Ồn ào quá!", "Baka!" -> "Đồ ngốc!", "Hentai!" -> "Đồ biến thái!", "Daijoubu" -> "Không sao đâu/Ổn mà/Yên tâm đi".
- Cần biểu diễn tuyệt vời ranh giới cảm xúc tinh tế: Từ thái độ từ chối e thẹn ban đầu cho đến sự đầu hàng ngọt ngào ngọt lịm đầu môi, tạo nên nhịp điệu kích thích cảm xúc dạt dào cho độc giả Việt.`
        }
    },
    {
        id: "cung_dau",
        label: "Cung Đấu / Hoàng Gia",
        description: "Trẫm, Thần thiếp, Nô tì. Tôn ti trật tự...",
        config: {
            pronouns: `   - Vua: Trẫm / Hoàng thượng.
   - Hậu phi: Thần thiếp / Bổn cung / Nô tì (khiêm xưng) / Tỷ tỷ / Muội muội.
   - Con cái với Cha mẹ: Nhi thần / Con (hạn chế) / Phụ hoàng / Mẫu hậu / Phụ thân / Mẫu thân.
   - Kẻ dưới: Nô tài / Nô tì / Vi thần.`,
            relations: `   - Tôn ti trật tự là sống còn. Lời nói phải giữ kẽ, ẩn ý.`,
            blacklist: `   - CẤM TUYỆT ĐỐI: "Vợ/Chồng" (Phải dùng Phu quân/Ái phi/Nàng/Chàng).
   - CẤM TUYỆT ĐỐI: "Bố/Mẹ/Cha/Má" (Phải dùng Phụ thân/Phụ hoàng/Mẫu thân/Mẫu hậu).
   - CẤM TUYỆT ĐỐI: "Cháu" (Dùng Nhi thần/Tiểu nữ/Nô tì hoặc tên riêng). Không bao giờ xưng "Cháu" trong cung đình.
   - CẤM TUYỆT ĐỐI: "Anh/Em" (giữa vua tôi hoặc người không thân).
   - CẤM TUYỆT ĐỐI: "Tôi" (Phải dùng Ta/Bổn cung/Bản quan).`,
            tone: `   - Trang trọng, cổ điển, thâm sâu. Không dùng từ ngữ bình dân.`
        }
    },
    {
        id: "fantasy_western",
        label: "Phương Tây / Fantasy (Văn học dịch)",
        description: "Ta/Ngươi, Ngài, Gã/Hắn. Không dùng Anh/Cô...",
        config: {
            pronouns: `   - Chung: Ta / Ngươi.
   - Quý tộc: Ngài (Sir/Lord) / Phu nhân (Lady) / Tiểu thư.
   - Ngôi 3: Hắn / Gã / Y / Nàng / Ả.`,
            relations: `   - Phong cách Quý tộc Châu Âu.`,
            blacklist: `   - CẤM: "Anh/Cô/Chị/Em" (kiểu hiện đại).
   - CẤM: "Tiền bối/Hậu bối/Tại hạ".`,
            tone: `   - Sử thi, trang trọng, văn học dịch.`
        }
    },
    {
        id: "hien_dai",
        label: "Hiện Đại (Việt Nam)",
        description: "Tôi/Bạn, Anh/Em, Cậu/Tớ. Tự nhiên...",
        config: {
            pronouns: `   - Tôi / Bạn / Anh / Chị / Em / Mày / Tao.`,
            relations: `   - Tự nhiên đời thường.`,
            blacklist: `   - CẤM: "Tại hạ/Các hạ/Huynh đài".`,
            tone: `   - Hiện đại, gãy gọn.`
        }
    },
    {
        id: "quan_su",
        label: "Quân Sự / Nghiêm Túc",
        description: "Tôi/Đồng chí, Chỉ huy. Kỷ luật...",
        config: {
            pronouns: `   - Tôi / Đồng chí / Chỉ huy / Báo cáo.`,
            relations: `   - Cấp trên - Cấp dưới.`,
            blacklist: `   - CẤM từ ngữ ủy mị.`,
            tone: `   - Đanh thép, báo cáo.`
        }
    },
    {
        id: "custom",
        label: "Tùy chỉnh (Thủ công)",
        description: "Tự nhập quy tắc riêng...",
        config: undefined
    }
];
