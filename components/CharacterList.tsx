import React, { useState } from 'react';
import { Character } from '../types';
import { useStory } from '../state/StoryContext';

interface Props {
  characters: Character[];
}

export const CharacterList: React.FC<Props> = ({ characters }) => {
  const { story, updateStorySettings } = useStory();
  const [selectedChar, setSelectedChar] = useState<Character | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'psych' | 'stats' | 'intimate'>('info');
  const [isEditing, setIsEditing] = useState(false);
  const [editedChar, setEditedChar] = useState<Character | null>(null);

  if (characters.length === 0) {
    return <div className="text-gray-500 italic text-sm p-4">Chưa tìm thấy nhân vật nào. Hãy viết thêm và dùng chức năng "Quét thực thể" để AI phân tích.</div>;
  }

  // Safe checks for new schema vs old schema characters
  const getSafeAppearance = (char: Character) => {
      if (typeof char.appearance === 'string') return { general: char.appearance, face: '', body: '', hair: '', clothing: '' };
      return char.appearance || { general: "Chưa có thông tin", face: '', body: '', hair: '', clothing: '' };
  };

  return (
    <>
      <div className="space-y-4 p-4 pb-20">
        {characters.map(char => (
          <div 
            key={char.id} 
            onClick={() => {
              setSelectedChar(char);
              setEditedChar({ ...char });
              setIsEditing(false);
              setDetailTab('info');
            }}
            className="group relative bg-gray-850 border border-gray-700 rounded-lg p-3 hover:border-primary-500 transition-all cursor-pointer hover:shadow-lg hover:shadow-primary-900/10 hover:-translate-y-0.5"
            title="Nhấn để xem chi tiết Profile"
          >
            {/* FIXED HEADER: Name takes priority, Role is constrained */}
            <div className="flex items-start justify-between gap-2 mb-2">
              <h4 className="font-bold text-sm text-gray-200 group-hover:text-primary-400 transition-colors line-clamp-2 leading-tight">
                  {char.name}
              </h4>
              <span 
                className="shrink-0 max-w-[45%] truncate text-[10px] px-1.5 py-0.5 rounded-full bg-gray-900 text-gray-400 border border-gray-800 group-hover:border-primary-500/50 group-hover:text-primary-400 transition-colors mt-0.5"
                title={char.role}
              >
                {char.role}
              </span>
            </div>
            
            <p className="text-xs text-gray-400 line-clamp-2 mb-3 h-8 leading-relaxed">
                {char.core_personality ? `[${char.core_personality}] ` : ''}{char.description}
            </p>
            
            {char.status && (
                <div className="mb-2 text-[10px] text-yellow-500 bg-yellow-900/10 px-2 py-1 rounded border border-yellow-900/30 truncate">
                    Trạng thái: {char.status}
                </div>
            )}
            
            <div className="flex flex-wrap gap-1 mb-1 overflow-hidden h-5">
              {char.traits.slice(0, 3).map((trait, i) => (
                <span key={i} className="text-[10px] bg-gray-800 text-gray-500 px-1.5 py-0.5 rounded border border-gray-800 whitespace-nowrap">
                  {trait}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* CHARACTER DETAIL MODAL */}
      {selectedChar && editedChar && (
        <div 
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn"
            onClick={() => {
              setSelectedChar(null);
              setIsEditing(false);
              setEditedChar(null);
            }}
        >
            <div 
                className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl overflow-hidden relative"
                onClick={e => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-800 flex justify-between items-start bg-gray-850/50">
                    <div className="pr-16 flex-1">
                        {isEditing ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    className="text-lg font-serif font-bold text-white bg-gray-950 border border-gray-800 rounded px-2 py-1 w-full focus:border-primary-500 focus:outline-none"
                                    value={editedChar.name || ''}
                                    placeholder="Tên nhân vật"
                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, name: e.target.value }) : null)}
                                />
                                <input
                                    type="text"
                                    className="text-xs text-primary-400 bg-gray-950 border border-gray-800 rounded px-2 py-1 w-full focus:border-primary-500 focus:outline-none"
                                    value={editedChar.role || ''}
                                    placeholder="Vai trò của nhân vật"
                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, role: e.target.value }) : null)}
                                />
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-wrap items-center gap-2 mb-1">
                                    <h3 className="text-xl md:text-2xl font-serif font-bold text-white leading-tight">{selectedChar.name}</h3>
                                </div>
                                <span className="inline-block text-xs font-bold px-2 py-1 rounded bg-primary-900/30 text-primary-400 border border-primary-900/50 uppercase tracking-wider mt-1">
                                    {selectedChar.role}
                                </span>
                            </>
                        )}
                    </div>
                    <div className="flex items-center gap-2 absolute top-4 right-4">
                        <button
                            onClick={() => {
                                if (isEditing) {
                                    // Đồng bộ hóa cấu trúc Intimate Profile trước khi lưu để đảm bảo cả bộ thuộc tính cũ và mới đều có dữ liệu thống nhất
                                    let finalChar = { ...editedChar };
                                    if (finalChar.intimate_profile) {
                                        const ip = finalChar.intimate_profile;
                                        finalChar.intimate_profile = {
                                            ...ip,
                                            sexual_response: ip.reaction_intimate || (ip as any).sexual_response || "",
                                            reaction_intimate: ip.reaction_intimate || (ip as any).sexual_response || "",
                                            
                                            libido: ip.libido_level || (ip as any).libido || "",
                                            libido_level: ip.libido_level || (ip as any).libido || "",
                                            
                                            sexual_initiative: ip.assertiveness_level || (ip as any).sexual_initiative || "",
                                            assertiveness_level: ip.assertiveness_level || (ip as any).sexual_initiative || "",
                                            
                                            kinks: ip.quirks || (ip as any).kinks || "",
                                            quirks: ip.quirks || (ip as any).kinks || "",
                                            
                                            bedroom_personality: ip.intimate_personality || (ip as any).bedroom_personality || "",
                                            intimate_personality: ip.intimate_personality || (ip as any).bedroom_personality || ""
                                        };
                                    }
                                    const updatedCharacters = characters.map(c => c.id === finalChar.id ? finalChar : c);
                                    updateStorySettings({ characters: updatedCharacters });
                                    setSelectedChar(finalChar);
                                    setEditedChar(finalChar);
                                    setIsEditing(false);
                                } else {
                                    setEditedChar({ ...selectedChar });
                                    setIsEditing(true);
                                }
                            }}
                            className="p-1 px-3 text-[10px] font-bold uppercase rounded bg-primary-900/50 hover:bg-primary-800 text-primary-200 border border-primary-700/50 transition-colors"
                        >
                            {isEditing ? 'LƯU' : 'SỦA'}
                        </button>
                        {isEditing && (
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditedChar({ ...selectedChar });
                                }}
                                className="p-1 px-2 text-[10px] font-bold uppercase rounded bg-gray-800 hover:bg-gray-700 text-gray-300 border border-gray-700 transition-colors"
                            >
                                HỦY
                            </button>
                        )}
                        <button 
                            onClick={() => {
                                setSelectedChar(null);
                                setIsEditing(false);
                                setEditedChar(null);
                            }}
                            className="p-1 px-2 text-gray-500 hover:text-white hover:bg-gray-800 rounded transition-colors text-[10px] font-bold uppercase cursor-pointer"
                        >
                            ĐÓNG
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-800 bg-gray-800/30">
                    <button onClick={() => setDetailTab('info')} className={`flex-1 py-3 text-xs font-bold uppercase ${detailTab === 'info' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-white'}`}>Hồ Sơ</button>
                    <button onClick={() => setDetailTab('psych')} className={`flex-1 py-3 text-xs font-bold uppercase ${detailTab === 'psych' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-white'}`}>Tâm Lý</button>
                    <button onClick={() => setDetailTab('stats')} className={`flex-1 py-3 text-xs font-bold uppercase ${detailTab === 'stats' ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-white'}`}>Trạng thái</button>
                    {story?.nsfw && (
                        <button onClick={() => setDetailTab('intimate')} className={`flex-1 py-3 text-xs font-bold uppercase ${detailTab === 'intimate' ? 'text-pink-450 border-b-2 border-pink-500 font-bold' : 'text-gray-500 hover:text-white'}`}>🔞 Thầm Kín</button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 flex-1">
                    
                    {detailTab === 'info' && (
                        <div className="space-y-4 animate-fadeIn">
                             {/* Description */}
                             <div className="space-y-1">
                                 <label className="block text-[10px] font-bold text-gray-550 uppercase tracking-widest">Tiểu sử / Mô tả</label>
                                 {isEditing ? (
                                     <textarea
                                         className="w-full text-sm text-gray-300 bg-gray-950 border border-gray-800 rounded p-2 focus:outline-none focus:border-primary-500"
                                         rows={4}
                                         value={editedChar.description || ''}
                                         onChange={e => setEditedChar(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                                     />
                                 ) : (
                                     <div className="text-sm text-gray-300 leading-7 whitespace-pre-wrap">
                                        {selectedChar.description}
                                    </div>
                                 )}
                             </div>

                            {/* Appearance Box */}
                            <div className="bg-gray-950/50 p-4 rounded-lg border border-gray-800 space-y-3">
                                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2 border-b border-gray-800 pb-1">
                                    Ngoại hình
                                </label>
                                {isEditing ? (
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Ngoại hình tổng quát</span>
                                            <input
                                                type="text"
                                                className="w-full bg-gray-950 border border-gray-850 text-gray-300 rounded p-1.5 text-xs focus:outline-none focus:border-primary-500"
                                                value={editedChar.appearance?.general || ''}
                                                onChange={e => setEditedChar(prev => prev ? ({ ...prev, appearance: { ...prev.appearance, general: e.target.value } }) : null)}
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <div>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Khuôn mặt</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-850 text-gray-300 rounded p-1.5 text-xs focus:outline-none"
                                                    value={editedChar.appearance?.face || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, appearance: { ...prev.appearance, face: e.target.value } }) : null)}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Tóc</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-850 text-gray-300 rounded p-1.5 text-xs focus:outline-none"
                                                    value={editedChar.appearance?.hair || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, appearance: { ...prev.appearance, hair: e.target.value } }) : null)}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Thể dáng</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-850 text-gray-300 rounded p-1.5 text-xs focus:outline-none"
                                                    value={editedChar.appearance?.body || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, appearance: { ...prev.appearance, body: e.target.value } }) : null)}
                                                />
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase">Phục trang</span>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-850 text-gray-300 rounded p-1.5 text-xs focus:outline-none"
                                                    value={editedChar.appearance?.clothing || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({ ...prev, appearance: { ...prev.appearance, clothing: e.target.value } }) : null)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    (() => {
                                        const app = getSafeAppearance(selectedChar);
                                        return (
                                            <>
                                                <p className="text-sm text-gray-300 italic">{app.general}</p>
                                                {app.face && <div className="flex gap-2 text-xs"><span className="text-gray-500 w-16 shrink-0">Khuôn mặt:</span> <span className="text-gray-300">{app.face}</span></div>}
                                                {app.hair && <div className="flex gap-2 text-xs"><span className="text-gray-500 w-16 shrink-0">Tóc:</span> <span className="text-gray-300">{app.hair}</span></div>}
                                                {app.body && <div className="flex gap-2 text-xs"><span className="text-gray-500 w-16 shrink-0">Dáng:</span> <span className="text-gray-300">{app.body}</span></div>}
                                                {app.clothing && <div className="flex gap-2 text-xs"><span className="text-gray-500 w-16 shrink-0">Phục trang:</span> <span className="text-gray-300">{app.clothing}</span></div>}
                                                {app.body_impression && <div className="flex gap-2 text-xs"><span className="text-pink-500 w-16 shrink-0">Lôi cuốn:</span> <span className="text-pink-300 italic">{app.body_impression}</span></div>}
                                            </>
                                        );
                                    })()
                                )}
                            </div>
                            
                            {isEditing ? (
                                <div>
                                    <span className="text-[10px] text-gray-500 font-bold uppercase">Câu thoại mẫu (Voice Sample)</span>
                                    <input
                                        type="text"
                                        className="w-full bg-gray-950 border border-gray-800 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                        value={editedChar.voiceSample || ''}
                                        onChange={e => setEditedChar(prev => prev ? ({ ...prev, voiceSample: e.target.value }) : null)}
                                    />
                                </div>
                            ) : (
                                selectedChar.voiceSample && (
                                    <div className="bg-gray-800/30 p-3 rounded border border-gray-700 italic text-gray-400 text-xs">
                                        <span className="text-gray-500 not-italic font-bold mr-2">Voice:</span> 
                                        "{selectedChar.voiceSample}"
                                    </div>
                                )
                            )}
                        </div>
                    )}

                    {detailTab === 'psych' && (
                        <div className="animate-fadeIn space-y-4">
                            <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20 mb-4">
                                <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Tính cách cốt lõi</h4>
                                {isEditing ? (
                                    <textarea
                                        className="w-full text-sm text-gray-300 bg-gray-950 border border-gray-850 rounded p-2 focus:outline-none"
                                        rows={3}
                                        value={editedChar.core_personality || ''}
                                        onChange={e => setEditedChar(prev => prev ? ({ ...prev, core_personality: e.target.value }) : null)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300 leading-relaxed">{selectedChar.core_personality || "Chưa xác định"}</p>
                                )}
                            </div>
                            
                            <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20 mb-4">
                                <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Tag cá tính</h4>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            className="w-full text-xs text-gray-350 bg-gray-950 border border-gray-850 rounded p-2 focus:outline-none"
                                            placeholder="Phân tách bằng dấu phẩy, ví dụ: Lạnh lùng, Kiêu ngạo, Độc tài"
                                            value={(editedChar.traits || []).join(', ')}
                                            onChange={e => setEditedChar(prev => prev ? ({ ...prev, traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }) : null)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {(selectedChar.traits || []).map((t, i) => (
                                            <span key={i} className="text-xs bg-purple-950/20 text-purple-400 px-2 py-0.5 rounded border border-purple-900/30">
                                                {t}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="bg-purple-900/10 p-4 rounded-lg border border-purple-500/20 mb-4">
                                <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Đặc điểm tính cách bổ sung</h4>
                                {isEditing ? (
                                    <div>
                                        <input
                                            type="text"
                                            className="w-full text-xs text-gray-350 bg-gray-950 border border-gray-850 rounded p-2 focus:outline-none"
                                            placeholder="Nhập các đặc điểm tính cách bổ sung, cách nhau bởi dấu phẩy"
                                            value={(editedChar.personality_traits || []).join(', ')}
                                            onChange={e => setEditedChar(prev => prev ? ({ ...prev, personality_traits: e.target.value.split(',').map(s => s.trim()).filter(Boolean) }) : null)}
                                        />
                                    </div>
                                ) : (
                                    <div className="flex flex-wrap gap-1">
                                        {(selectedChar.personality_traits || []).map((pt, i) => (
                                            <span key={i} className="text-xs bg-purple-950/40 text-purple-300 px-2 py-0.5 rounded border border-purple-900/30">
                                                {pt}
                                            </span>
                                        ))}
                                        {(!selectedChar.personality_traits || selectedChar.personality_traits.length === 0) && (
                                            <span className="text-xs text-gray-500 italic">Chưa có thông tin</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {detailTab === 'stats' && (
                         <div className="animate-fadeIn space-y-4">
                             {/* Short Status from Extractor */}
                             <div className="bg-yellow-900/10 p-4 rounded-lg border border-yellow-900/30 mb-4">
                                <h4 className="text-xs font-bold text-yellow-500 uppercase mb-2">Trạng thái hiện tại</h4>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full text-sm text-gray-300 bg-gray-950 border border-gray-850 rounded p-2 focus:outline-none focus:border-yellow-500"
                                        value={editedChar.status || ''}
                                        onChange={e => setEditedChar(prev => prev ? ({ ...prev, status: e.target.value }) : null)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300">{selectedChar.status || "Bình thường"}</p>
                                )}
                             </div>

                             {/* Emotional State */}
                             <div className="bg-yellow-900/10 p-4 rounded-lg border border-yellow-900/30 mb-4">
                                <h4 className="text-xs font-bold text-yellow-500 uppercase mb-2">Trạng thái cảm xúc</h4>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        className="w-full text-sm text-gray-300 bg-gray-950 border border-gray-850 rounded p-2 focus:outline-none focus:border-yellow-500"
                                        placeholder="Nhập trạng thái cảm xúc, ví dụ: Phấn khích, Buồn bã, Hoảng loạn..."
                                        value={editedChar.emotional_state || ''}
                                        onChange={e => setEditedChar(prev => prev ? ({ ...prev, emotional_state: e.target.value }) : null)}
                                    />
                                ) : (
                                    <p className="text-sm text-gray-300">{selectedChar.emotional_state || "Chưa xác định"}</p>
                                )}
                             </div>
                             
                             <div className="text-center text-gray-600 text-[10px] italic py-4">
                                 Ma trận cảm xúc được AI sử dụng ngầm để điều hướng hội thoại và mô phỏng phản ứng.
                             </div>
                         </div>
                    )}

                    {detailTab === 'intimate' && story?.nsfw && (
                        <div className="space-y-4 animate-fadeIn">
                            {isEditing ? (
                                <div className="space-y-4">
                                    <div className="bg-pink-900/10 p-4 rounded-lg border border-pink-500/20 space-y-3">
                                        <h4 className="text-xs font-bold text-pink-400 uppercase mb-1 flex items-center gap-1.5">
                                            <span>🔞</span> HỒ SƠ THẦM KÍN (INTIMATE PROFILE)
                                        </h4>
                                        <p className="text-[11px] text-pink-300/60 leading-normal mb-3">
                                            Vui lòng điền các chi tiết thầm kín dưới đây. AI viết chương truyện 18+ sẽ tuân thủ nghiêm ngặt theo các cấu hình này.
                                        </p>

                                        <div className="space-y-3">
                                            <div>
                                                <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Gợi cảm ngoại hình (Body Impression)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                    placeholder="Mô tả làn da, vòng ngực, vòng eo hông hay các điểm đặc thù quyến rũ..."
                                                    value={editedChar.appearance?.body_impression || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({
                                                        ...prev,
                                                        appearance: { ...prev.appearance, body_impression: e.target.value }
                                                    }) : null)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Phản ứng nhạy cảm khi làm tình</label>
                                                <textarea
                                                    className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                    rows={2}
                                                    placeholder="Ướt át rên rỉ, khép nép nhút nhát, nhạy cảm rung bần bật, vặn vẹo thân thể..."
                                                    value={editedChar.intimate_profile?.reaction_intimate || (editedChar.intimate_profile as any)?.sexual_response || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({
                                                        ...prev,
                                                        intimate_profile: { ...(prev.intimate_profile || {}), reaction_intimate: e.target.value }
                                                    }) : null)}
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-2">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Mức ham muốn (Libido)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                        placeholder="Dồi dào mãnh liệt, thầm kín thâm sâu, lạnh lùng lãnh cảm..."
                                                        value={editedChar.intimate_profile?.libido_level || (editedChar.intimate_profile as any)?.libido || ''}
                                                        onChange={e => setEditedChar(prev => prev ? ({
                                                            ...prev,
                                                            intimate_profile: { ...(prev.intimate_profile || {}), libido_level: e.target.value }
                                                        }) : null)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Mức độ chủ động (Assertiveness)</label>
                                                    <input
                                                        type="text"
                                                        className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                        placeholder="Chủ động kiểm soát hay cam tâm thụ động phục tùng..."
                                                        value={editedChar.intimate_profile?.assertiveness_level || (editedChar.intimate_profile as any)?.sexual_initiative || ''}
                                                        onChange={e => setEditedChar(prev => prev ? ({
                                                            ...prev,
                                                            intimate_profile: { ...(prev.intimate_profile || {}), assertiveness_level: e.target.value }
                                                        }) : null)}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Thói quen / Xu hướng thầm kín (Quirks)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                    placeholder="Ví dụ: bạo lực nhẹ dâm mỹ, tơ lụa trói buộc, dâm ngôn tục ngữ..."
                                                    value={editedChar.intimate_profile?.quirks || (editedChar.intimate_profile as any)?.kinks || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({
                                                        ...prev,
                                                        intimate_profile: { ...(prev.intimate_profile || {}), quirks: e.target.value }
                                                    }) : null)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Cảm xúc thầm kín</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                    placeholder="Gia tăng gắn kết linh hồn, dục vọng chiếm hữu cao, yếu đuối dựa dẫm..."
                                                    value={editedChar.intimate_profile?.intimate_emotion || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({
                                                        ...prev,
                                                        intimate_profile: { ...(prev.intimate_profile || {}), intimate_emotion: e.target.value }
                                                    }) : null)}
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-[10px] font-bold text-pink-400/80 uppercase tracking-wide mb-1">Tính cách trên giường (Intimate Personality)</label>
                                                <input
                                                    type="text"
                                                    className="w-full bg-gray-950 border border-gray-800 focus:border-pink-500 text-gray-300 rounded p-2 text-xs focus:outline-none"
                                                    placeholder="Nữ vương ngạo kiều, tà mị quỷ quyệt, ôn nhu bá đạo..."
                                                    value={editedChar.intimate_profile?.intimate_personality || (editedChar.intimate_profile as any)?.bedroom_personality || ''}
                                                    onChange={e => setEditedChar(prev => prev ? ({
                                                        ...prev,
                                                        intimate_profile: { ...(prev.intimate_profile || {}), intimate_personality: e.target.value }
                                                    }) : null)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                     <div className="bg-pink-950/20 p-5 rounded-lg border border-pink-900/30 space-y-4 leading-relaxed max-w-full">
                                         <h4 className="text-xs font-bold text-pink-400 uppercase border-b border-pink-900/30 pb-1 pb-1.5 tracking-widest flex items-center gap-1.5 mb-2">
                                             <span>🔞</span> Hồ Sơ Thầm Kín Nhân Vật
                                         </h4>
                                         
                                         <div className="space-y-3.5">
                                             {selectedChar.appearance?.body_impression ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Gợi cảm ngoại hình (Body Impression):</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850 italic">"{selectedChar.appearance.body_impression}"</span>
                                                 </div>
                                             ) : null}

                                             {(selectedChar.intimate_profile?.reaction_intimate || (selectedChar.intimate_profile as any)?.sexual_response) ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Phản ứng thầm kín khi mây mưa:</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        "{selectedChar.intimate_profile?.reaction_intimate || (selectedChar.intimate_profile as any)?.sexual_response}"
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {(selectedChar.intimate_profile?.libido_level || (selectedChar.intimate_profile as any)?.libido) ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Ham muốn nhạy cảm (Libido):</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        {selectedChar.intimate_profile?.libido_level || (selectedChar.intimate_profile as any)?.libido}
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {(selectedChar.intimate_profile?.assertiveness_level || (selectedChar.intimate_profile as any)?.sexual_initiative) ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Chủ động / Thụ động (Assertiveness):</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        {selectedChar.intimate_profile?.assertiveness_level || (selectedChar.intimate_profile as any)?.sexual_initiative}
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {(selectedChar.intimate_profile?.quirks || (selectedChar.intimate_profile as any)?.kinks) ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Sở thích đặc biệt / Thói quen (Quirks):</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        {selectedChar.intimate_profile?.quirks || (selectedChar.intimate_profile as any)?.kinks}
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {selectedChar.intimate_profile?.intimate_emotion ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Mặt cảm xúc tinh thần:</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        {selectedChar.intimate_profile.intimate_emotion}
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {(selectedChar.intimate_profile?.intimate_personality || (selectedChar.intimate_profile as any)?.bedroom_personality) ? (
                                                 <div className="flex flex-col gap-0.5 text-xs">
                                                     <span className="text-pink-400 font-bold">Phong thái trên giường (Intimate Personality):</span>
                                                     <span className="text-gray-300 bg-gray-950/40 p-2 rounded border border-gray-850">
                                                        {selectedChar.intimate_profile?.intimate_personality || (selectedChar.intimate_profile as any)?.bedroom_personality}
                                                     </span>
                                                 </div>
                                             ) : null}

                                             {(!selectedChar.appearance?.body_impression && !selectedChar.intimate_profile) && (
                                                 <div className="text-center text-xs text-gray-500 py-6 italic">
                                                     Hồ sơ thầm kín đang trống. Hãy nhấn nút "SỬA" ở góc bên phải phía trên để bổ sung đầy đủ chi tiết thầm kín, gia tăng trải nghiệm viết truyện của bạn!
                                                 </div>
                                             )}
                                         </div>
                                     </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Footer */}
                <div className="p-4 border-t border-gray-800 bg-gray-850/30">
                    <div className="flex flex-wrap gap-2 justify-center">
                        {isEditing ? (
                            <span className="text-[10px] text-gray-500 font-bold">Đang ở chế độ chỉnh sửa</span>
                        ) : (
                            selectedChar.traits.map((t, i) => (
                                <span key={i} className="text-[10px] px-2 py-1 bg-gray-800 border border-gray-700 rounded text-gray-400">
                                    #{t}
                                </span>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
      )}
    </>
  );
};
