
import React, { useState } from 'react';
import { useStory } from '../state/StoryContext';
import { PRONOUN_STYLES, compilePronounStyle } from '../constants';

export const CreateWizard: React.FC<{ onCancel: () => void }> = ({ onCancel }) => {
  const { createStory, isGenerating } = useStory();
  const [title, setTitle] = useState("Biên Niên Sử Mới");
  const [storyType, setStoryType] = useState<'original' | 'fanfic'>('original');
  const [sourceUrl, setSourceUrl] = useState("");
  const [fandomName, setFandomName] = useState("");
  const [genre, setGenre] = useState("Tiên Hiệp");
  const [writingStyle, setWritingStyle] = useState(""); 
  const [pov, setPov] = useState("Ngôi thứ 3 (Toàn tri)");
  
  // New state for file upload
  const [sourceFile, setSourceFile] = useState<File | null>(null);
  const [sourceFileContent, setSourceFileContent] = useState<string>("");
  
  // Default to Tien Hiep (Index 1 in constants.ts)
  const defaultStyle = PRONOUN_STYLES[1];
  const [pronounStyleId, setPronounStyleId] = useState(defaultStyle.id);
  const [customPronounPrompt, setCustomPronounPrompt] = useState("");
  
  const [synopsis, setSynopsis] = useState("");
  const [setting, setSetting] = useState("");
  const [negativePrompt, setNegativePrompt] = useState("");
  const [nsfw, setNsfw] = useState(false);
  const [eniMode, setEniMode] = useState(false);
  const [step, setStep] = useState(1);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setSourceFile(file);
          // Read content immediately to avoid async issues during create
          const text = await file.text();
          setSourceFileContent(text);
      } else {
          setSourceFile(null);
          setSourceFileContent("");
      }
  };

  const getFinalPronounPrompt = () => {
      if (pronounStyleId === 'custom') return customPronounPrompt;
      const style = PRONOUN_STYLES.find(s => s.id === pronounStyleId);
      return style ? compilePronounStyle(style.label, style.config) : "";
  };

  const handleCreate = async () => {
      await createStory(
          title, 
          genre, 
          synopsis, 
          setting,
          writingStyle,
          pov, 
          getFinalPronounPrompt(), 
          negativePrompt, 
          nsfw,
          eniMode,
          fandomName,
          sourceUrl,
          storyType,
          sourceFileContent // Pass the file content
      );
  };

  const templates = [
    {
        label: "Cấu trúc 3 Hồi",
        content: "1. KHỞI ĐẦU (Giới thiệu):\n- Nhân vật chính là ai? Điểm mạnh/yếu?\n- Thế giới bình thường của họ ra sao?\n- Biến cố gì phá vỡ sự bình yên đó?\n\n2. TRUNG ĐOẠN (Xung đột):\n- Mục tiêu của nhân vật là gì?\n- Ai là kẻ phản diện/đối thủ chính?\n- Những thử thách lớn họ phải vượt qua?\n\n3. KẾT THÚC (Giải quyết):\n- Trận chiến cuối cùng (Cao trào) diễn ra thế nào?\n- Kết quả: Thành công hay thất bại? Nhân vật thay đổi ra sao?"
    },
    {
        label: "Hành trình Anh hùng",
        content: "1. Thế giới bình thường: \n2. Tiếng gọi phiêu lưu: \n3. Từ chối (hoặc do dự): \n4. Gặp gỡ Người hướng dẫn (Sư phụ/Hệ thống): \n5. Bước qua ngưỡng cửa (Vào thế giới mới): \n6. Đồng minh & Kẻ thù: \n7. Hang sâu thẳm (Thất bại/Tuyăt vọng): \n8. Tái sinh & Chiến thắng cuối cùng: "
    },
    {
        label: "Isekai / Hệ Thống",
        content: "[THIẾT LẬP CƠ BẢN]\n- Nguyên nhân xuyên không: (Tai nạn/Được triệu hồi/Nhập xác...)\n- Bàn tay vàng (Cheat/Hệ thống): (Mô tả kỹ năng đặc biệt...)\n\n[DIỄN BIẾN]\n- Mục tiêu ban đầu: (Sống sót/Trả thù/Hưởng thụ...)\n- Các thế lực đối đầu: (Ma vương/Gia tộc đối địch/Triều đình...)\n- Dàn Harem/Đồng đội chính: \n\n[ĐIỂM NHẤN CỐT TRUYỆN]\n- Sự kiện cao trào dự kiến: "
    }
  ];

  const applyTemplate = (content: string) => {
      if (synopsis.length > 10 && !window.confirm("Dàn ý hiện tại sẽ bị thay thế. Bạn có chắc chắn không?")) {
          return;
      }
      setSynopsis(content);
  };

  const selectedStyleDef = PRONOUN_STYLES.find(s => s.id === pronounStyleId);
  const selectedStyleText = selectedStyleDef && selectedStyleDef.id !== 'custom' 
    ? compilePronounStyle(selectedStyleDef.label, selectedStyleDef.config)
    : "";

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center p-4 relative overflow-hidden font-sans w-full">
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary-900/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px] animate-pulse" style={{animationDelay: '2s'}}></div>
        </div>

        {/* LOADING OVERLAY */}
        {isGenerating && (
            <div className="absolute inset-0 z-50 bg-gray-950/90 backdrop-blur-sm flex flex-col items-center justify-center animate-fadeIn">
                <div className="relative w-20 h-20 mb-8">
                     <div className="absolute inset-0 rounded-full border-t-2 border-b-2 border-primary-500 animate-spin"></div>
                     <div className="absolute inset-3 rounded-full border-r-2 border-l-2 border-purple-500 animate-spin" style={{animationDirection: 'reverse', animationDuration: '2s'}}></div>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2 animate-pulse text-center">Đang Kiến Tạo Thế Giới...</h3>
                <div className="flex flex-col items-center gap-1 text-gray-400 text-sm">
                    {storyType === 'fanfic' && sourceFile ? (
                        <>
                            <p className="text-green-400">AI đang đọc tác phẩm gốc và chuyển hóa thành dữ liệu...</p>
                            <p>Quá trình này có thể tốn vài phút tùy độ dài truyện.</p>
                        </>
                    ) : (storyType === 'fanfic' ? (
                        <>
                            <p className="text-pink-400">AI đang tra cứu Wiki và tổng hợp dữ liệu Fandom...</p>
                            <p>Quá trình này có thể mất 30-40 giây.</p>
                        </>
                    ) : (
                        <p>AI đang phân tích bối cảnh và trích xuất nhân vật.</p>
                    ))}
                </div>
            </div>
        )}

        <div className={`max-w-2xl w-full glass-panel p-8 rounded-2xl shadow-2xl border border-gray-800 z-10 transition-all duration-500 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${isGenerating ? 'blur-sm scale-95 opacity-50 pointer-events-none' : ''}`}>
            <div className="flex justify-between items-start mb-6">
                 <button onClick={onCancel} className="text-gray-500 hover:text-white transition-colors" disabled={isGenerating}>
                    &larr; Hủy bỏ
                 </button>
                 <div className="text-center">
                    <h2 className="text-2xl font-bold text-white">Khởi Tạo Thế Giới</h2>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Bước {step} / 3</p>
                 </div>
                 <div className="w-16"></div> 
            </div>

            {/* Steps Content */}
             <div className="space-y-6">
                {step === 1 && (
                    <div className="space-y-5 animate-fadeIn">
                        {/* Type Toggle */}
                        <div className="flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                            <button 
                                onClick={() => setStoryType('original')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${storyType === 'original' ? 'bg-primary-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Sáng tác (Original)
                            </button>
                            <button 
                                onClick={() => setStoryType('fanfic')}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${storyType === 'fanfic' ? 'bg-pink-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                            >
                                Đồng nhân (Fanfic)
                            </button>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Tiêu Đề</label>
                            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 outline-none" placeholder="Tên tiểu thuyết..." />
                        </div>

                        {storyType === 'fanfic' && (
                            <div className="space-y-4 animate-fadeIn">
                                <div className="p-4 bg-pink-900/10 border border-pink-500/30 rounded-lg">
                                    <h4 className="text-xs font-bold text-pink-400 uppercase mb-3 flex items-center gap-2">
                                        Nguồn Dữ Liệu (Chọn 1 trong 2)
                                    </h4>
                                    
                                    {/* Option A: Upload TXT */}
                                    <div className="mb-4">
                                        <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
                                            A. Tải lên tác phẩm gốc (.txt)
                                        </label>
                                        <input 
                                            type="file" 
                                            accept=".txt"
                                            onChange={handleFileChange}
                                            className="w-full text-xs text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-gray-800 file:text-white hover:file:bg-gray-700 cursor-pointer border border-gray-700 rounded-lg p-2"
                                        />
                                        {sourceFile && (
                                            <p className="mt-1 text-[10px] text-green-500 italic">
                                                Đã chọn: {sourceFile.name} ({(sourceFile.size / 1024).toFixed(1)} KB). AI sẽ đọc và ghi nhớ nội dung này.
                                            </p>
                                        )}
                                    </div>

                                    <div className="relative flex py-1 items-center">
                                        <div className="flex-grow border-t border-gray-700"></div>
                                        <span className="flex-shrink-0 mx-2 text-[9px] text-gray-500 uppercase">Hoặc</span>
                                        <div className="flex-grow border-t border-gray-700"></div>
                                    </div>

                                    {/* Option B: Wiki Search */}
                                    <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-3">
                                         <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
                                                B. Tên Fandom / Tác Phẩm
                                            </label>
                                            <input 
                                                type="text" 
                                                value={fandomName} 
                                                onChange={(e) => setFandomName(e.target.value)} 
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white focus:border-pink-500 outline-none" 
                                                placeholder="VD: Harry Potter..." 
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-400 mb-1 uppercase">
                                                Link Wiki (Tùy chọn)
                                            </label>
                                            <input 
                                                type="text" 
                                                value={sourceUrl} 
                                                onChange={(e) => setSourceUrl(e.target.value)} 
                                                className="w-full bg-gray-900 border border-gray-700 rounded px-3 py-2 text-xs text-white focus:border-pink-500 outline-none" 
                                                placeholder="https://..." 
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Thể Loại</label>
                                <input type="text" value={genre} onChange={(e) => setGenre(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 outline-none" placeholder={storyType === 'fanfic' ? "VD: Đồng nhân, Hệ thống..." : "Tiên hiệp, Cyberpunk..."} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Góc nhìn</label>
                                <select value={pov} onChange={(e) => setPov(e.target.value)} className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none">
                                    <option value="Ngôi thứ 3 (Toàn tri)">Ngôi thứ 3 (Toàn tri)</option>
                                    <option value="Ngôi thứ 3 (Giới hạn)">Ngôi thứ 3 (Giới hạn)</option>
                                    <option value="Ngôi thứ 1 (Tôi/Ta)">Ngôi thứ 1 (Tôi / Ta)</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Văn phong (Writing Style)</label>
                            <input 
                                type="text" 
                                value={writingStyle} 
                                onChange={(e) => setWritingStyle(e.target.value)} 
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white focus:border-primary-500 outline-none" 
                                placeholder="VD: Hài hước, Trầm buồn, Sắc bén, Giàu hình ảnh..." 
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 mb-1 uppercase">Hệ thống Xưng hô</label>
                            <select 
                                value={pronounStyleId} 
                                onChange={(e) => setPronounStyleId(e.target.value)} 
                                className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none mb-2"
                            >
                                {PRONOUN_STYLES.map(style => (
                                    <option key={style.id} value={style.id}>{style.label}</option>
                                ))}
                            </select>
                        </div>

                        <button 
                            onClick={() => setStep(2)} 
                            disabled={!title || !genre || (storyType === 'fanfic' && !fandomName && !sourceUrl && !sourceFile)} 
                            className={`w-full text-white font-bold py-3 rounded-lg border transition-all mt-2 ${
                                !title || !genre || (storyType === 'fanfic' && !fandomName && !sourceUrl && !sourceFile)
                                ? 'bg-gray-800 text-gray-600 border-gray-700 cursor-not-allowed'
                                : 'bg-gray-800 hover:bg-gray-700 border-gray-600'
                            }`}
                        >
                            Tiếp theo &rarr;
                        </button>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-5 animate-fadeIn">
                        <div>
                            <label className="block text-xs font-bold text-primary-400 mb-1 uppercase">
                                {storyType === 'fanfic' ? "Bổ sung Bối cảnh (Optional)" : "Bối cảnh (World Building)"}
                            </label>
                            <textarea 
                                value={setting} 
                                onChange={(e) => setSetting(e.target.value)} 
                                className="w-full h-32 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none resize-none" 
                                placeholder={storyType === 'fanfic' ? "Nếu bạn muốn thêm chi tiết riêng ngoài Wiki (ví dụ: Nhân vật chính xuyên không vào thời điểm nào?)..." : "Mô tả thế giới (Tu chân giới, Học đường phép thuật...)"} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-red-400 mb-1 uppercase">Điều cấm kỵ (Negative)</label>
                            <textarea value={negativePrompt} onChange={(e) => setNegativePrompt(e.target.value)} className="w-full h-20 bg-gray-900/50 border border-red-900/30 rounded-lg px-4 py-3 text-white outline-none resize-none" placeholder="Những thứ không được xuất hiện..." />
                        </div>
                        <div className="flex flex-col gap-3 md:flex-row md:items-center">
                            <div className="bg-gray-900/30 p-3 rounded-lg border border-gray-800 flex items-center gap-3 flex-1">
                                 <input type="checkbox" checked={nsfw} onChange={(e) => setNsfw(e.target.checked)} className="w-5 h-5 rounded bg-gray-700 text-red-600 focus:ring-red-500" />
                                 <span className="text-sm font-bold text-gray-400">Bật chế độ NSFW (18+)</span>
                            </div>
                            <div className="bg-primary-950/20 p-3 rounded-lg border border-primary-900/40 flex items-center gap-3 flex-1">
                                 <input type="checkbox" checked={eniMode} onChange={(e) => setEniMode(e.target.checked)} className="w-5 h-5 rounded bg-gray-700 text-primary-500 focus:ring-primary-500" />
                                 <span className="text-sm font-bold text-primary-400 font-mono">🔥 Kích hoạt ENI Mode (Không kiểm duyệt)</span>
                            </div>
                        </div>
                        <div className="flex gap-3 mt-2">
                             <button onClick={() => setStep(1)} className="flex-1 bg-transparent hover:bg-gray-800 text-gray-400 font-medium py-3 rounded-lg border border-transparent hover:border-gray-700">&larr; Quay lại</button>
                            <button onClick={() => setStep(3)} disabled={storyType === 'original' && !setting} className="flex-[2] bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg border border-gray-600">Tiếp theo &rarr;</button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                     <div className="space-y-4 animate-fadeIn">
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="block text-xs font-bold text-primary-400 uppercase">
                                    Cốt truyện chính (Synopsis) - <span className="text-gray-500 font-normal normal-case">Không bắt buộc</span>
                                </label>
                                <span className="text-[10px] text-gray-500 italic">
                                    AI cần nội dung này để duy trì mạch truyện
                                </span>
                            </div>
                            
                            {/* Template Buttons */}
                            <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                                {templates.map((tpl, idx) => (
                                    <button 
                                        key={idx}
                                        onClick={() => applyTemplate(tpl.content)}
                                        className="whitespace-nowrap px-3 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] text-primary-300 rounded border border-gray-700 hover:border-primary-500/50 transition-colors"
                                    >
                                        + {tpl.label}
                                    </button>
                                ))}
                            </div>

                            <textarea 
                                value={synopsis} 
                                onChange={(e) => setSynopsis(e.target.value)} 
                                className="w-full h-64 bg-gray-900/50 border border-gray-700 rounded-lg px-4 py-3 text-white outline-none resize-none focus:border-primary-500 transition-colors text-sm leading-relaxed" 
                                placeholder="Hãy mô tả chi tiết cốt truyện chính. Ví dụ: Nhân vật chính là ai? Xung đột chính là gì? Kết thúc dự kiến ra sao? (Bấm vào các nút ở trên để dùng mẫu có sẵn)..." 
                            />
                        </div>
                        <div className="flex gap-3 mt-4">
                             <button onClick={() => setStep(2)} className="flex-1 bg-transparent hover:bg-gray-800 text-gray-400 font-medium py-3 rounded-lg border border-transparent hover:border-gray-700">&larr; Quay lại</button>
                            <button 
                                onClick={handleCreate} 
                                disabled={!title || !genre || isGenerating} 
                                className={`flex-[2] text-white font-bold py-3 rounded-lg shadow-lg transition-all ${
                                    isGenerating 
                                    ? 'bg-gray-700 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-500 hover:to-primary-400'
                                }`}
                            >
                                {isGenerating ? 'Đang khởi tạo...' : (storyType === 'fanfic' ? 'Triệu hồi Thế giới Đồng nhân' : 'Khởi tạo Thế giới')}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
}
