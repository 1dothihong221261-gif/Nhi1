
import React, { useState } from 'react';
import { useStory } from '../state/StoryContext';
import { CharacterList } from './CharacterList';

interface Props {
    onOpenSettings: () => void;
    isOpen: boolean;    
    onClose: () => void; 
}

export const Sidebar: React.FC<Props> = ({ onOpenSettings, isOpen, onClose }) => {
  const { 
    story, 
    activeChapterId, 
    selectChapter, 
    addChapter, 
    characters, 
    saveProgress, 
    closeStory,
    userInstruction,
    setUserInstruction,
    generateContinue,
    isGenerating,
    generationStatus,
    updateWorldLore,
    updateStorySettings
  } = useStory();
  
  const [tab, setTab] = useState<'chapters' | 'knowledge' | 'world'>('chapters');
  const [loreInput, setLoreInput] = useState('');

  if (!story) return null;

  const handleGenerate = async () => {
      await generateContinue();
      setUserInstruction('');
  };

  const addLoreItem = () => {
      if (!loreInput.trim()) return;
      const currentLore = story.worldLore || [];
      updateWorldLore([...currentLore, loreInput.trim()]);
      setLoreInput('');
  };

  const removeLoreItem = (index: number) => {
      const currentLore = story.worldLore || [];
      const newLore = [...currentLore];
      newLore.splice(index, 1);
      updateWorldLore(newLore);
  };

  const toggleNsfw = () => {
    updateStorySettings({ nsfw: !story.nsfw });
  };

  return (
    <div className={`
        fixed inset-y-0 left-0 z-50 w-80 h-full
        bg-gray-900 border-r border-gray-800 flex flex-col glass-panel shadow-2xl
        transform transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
    `}>
      {/* Header */}
      <div className="p-4 border-b border-gray-800 flex items-center justify-between shrink-0">
         <div className="flex flex-col overflow-hidden mr-2">
            <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-400 to-purple-400 bg-clip-text text-transparent truncate">
                Aetheria
                </h1>
            </div>
            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider mb-1">
                Builder: Sát Vách Lão Vương
            </div>
            <p className="text-xs text-gray-300 mt-1 truncate max-w-[150px] font-medium border-t border-gray-800/50 pt-1" title={story.title}>{story.title}</p>
         </div>
         
         <div className="flex gap-1 shrink-0">
             <button 
                onClick={closeStory} 
                className="p-2 text-gray-500 hover:text-white bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                title="Thoát ra thư viện"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
             </button>
             
             <button 
                onClick={onOpenSettings} 
                className="p-2 text-gray-500 hover:text-primary-400 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                title="Cài đặt truyện"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
             </button>

             <button 
                onClick={onClose} 
                className="md:hidden p-2 text-red-500 hover:text-red-400 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
                title="Đóng Menu"
             >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
             </button>
         </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-800 shrink-0">
        <button onClick={() => setTab('chapters')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${tab === 'chapters' ? 'text-primary-400 border-b-2 border-primary-500' : 'text-gray-500 hover:text-gray-300'}`}>Chương</button>
        <button onClick={() => setTab('world')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${tab === 'world' ? 'text-yellow-400 border-b-2 border-yellow-500' : 'text-gray-500 hover:text-gray-300'}`}>Thế giới</button>
        <button onClick={() => setTab('knowledge')} className={`flex-1 py-3 text-xs font-bold uppercase transition-colors ${tab === 'knowledge' ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500 hover:text-gray-300'}`}>Nhân vật</button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gray-900/50">
        {tab === 'chapters' && (
          <div className="p-2 space-y-1">
            {story.chapters.map(chapter => (
              <button key={chapter.id} onClick={() => { selectChapter(chapter.id); if (window.innerWidth < 768) onClose(); }} className={`w-full text-left px-4 py-3 rounded-md transition-all ${activeChapterId === chapter.id ? 'bg-gray-800 text-white shadow-lg border-l-2 border-primary-500' : 'text-gray-400 hover:bg-gray-800/50 hover:text-gray-200'}`}>
                <div className="font-medium truncate">{chapter.title}</div>
                <div className="text-xs text-gray-600 mt-1 truncate">{chapter.content.slice(0, 40) || "Chương trống..."}...</div>
              </button>
            ))}
            <button onClick={addChapter} className="w-full text-center py-2 mt-2 border border-dashed border-gray-700 rounded text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors text-sm uppercase font-bold">+ Thêm chương mới</button>
          </div>
        )}

        {tab === 'world' && (
            <div className="p-4">
                <div className="mb-4 bg-yellow-900/10 border border-yellow-900/30 p-3 rounded-lg">
                    <h3 className="text-xs font-bold text-yellow-500 uppercase mb-1">Ghim Lore / Thế Giới</h3>
                    <p className="text-[10px] text-gray-400">Các quy tắc, sự kiện hoặc thông tin quan trọng luôn được AI ghi nhớ. (Thay thế cho Trạng thái cũ).</p>
                </div>
                
                <div className="mb-4">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 block">
                        Thêm thông tin Lore
                    </label>
                    <div className="flex gap-1 mb-2">
                        <input 
                            type="text" 
                            value={loreInput}
                            onChange={e => setLoreInput(e.target.value)}
                            onKeyDown={e => {
                                if (e.key === 'Enter') addLoreItem();
                            }}
                            className="flex-1 bg-gray-950 border border-gray-700 rounded px-2 py-1 text-xs text-white focus:border-yellow-500 outline-none placeholder-gray-700"
                            placeholder="VD: Ma thuật cần sinh lực để thi triển..."
                        />
                        <button 
                            onClick={addLoreItem}
                            className="px-2 bg-gray-800 text-gray-400 hover:text-white rounded border border-gray-700 text-xs font-bold uppercase"
                        >
                            Thêm
                        </button>
                    </div>

                    <div className="space-y-1">
                        {(story.worldLore || []).map((item, idx) => (
                            <div key={idx} className="flex justify-between items-start group bg-gray-800/50 rounded p-2 border border-gray-800 hover:border-gray-700">
                                <span className="text-xs text-gray-300 leading-tight">{item}</span>
                                <button 
                                    onClick={() => removeLoreItem(idx)}
                                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 px-1 text-[10px] font-bold uppercase"
                                >
                                    Xóa
                                </button>
                            </div>
                        ))}
                        {(story.worldLore || []).length === 0 && (
                            <div className="text-center text-gray-600 text-xs italic py-4">Chưa có thông tin thế giới.</div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {tab === 'knowledge' && (
            <div className="space-y-2">
                <CharacterList characters={characters} />
            </div>
        )}
      </div>

      {/* Footer (Director Mode) */}
      <div className="hidden md:flex flex-col p-4 border-t border-gray-800 bg-gray-900/50">
            <div className="mb-2 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <label className="text-[10px] font-bold text-primary-400 uppercase tracking-wide">Chỉ đạo AI</label>
                    <button onClick={toggleNsfw} className={`text-[9px] font-black px-1.5 py-0.5 rounded border transition-all ${story.nsfw ? 'bg-red-900/40 text-red-400 border-red-500/50' : 'text-gray-600 border-gray-700 hover:text-gray-400'}`}>18+</button>
                </div>
                <div className="flex items-center gap-1.5">
                    <span className="text-[8px] text-blue-400 font-black uppercase tracking-widest">Reasoning Mode</span>
                </div>
            </div>
            <textarea
                value={userInstruction}
                onChange={(e) => setUserInstruction(e.target.value)}
                disabled={isGenerating}
                placeholder="VD: Cốt truyện rẽ nhánh, nhân vật gặp biến cố..."
                className="w-full bg-black/40 border border-gray-700 rounded p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary-500 resize-none h-20 mb-2 transition-colors custom-scrollbar"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey && !isGenerating) handleGenerate(); }}
            />
            <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-bold text-white shadow transition-all uppercase
                ${isGenerating ? 'bg-gray-800 cursor-not-allowed text-gray-500' : 'bg-gradient-to-r from-primary-600 to-blue-600 hover:shadow-[0_0_15px_rgba(37,99,235,0.3)]'}`}
            >
                {isGenerating ? (generationStatus || 'Đang suy luận...') : 'Viết tiếp (Quality Mode)'}
            </button>
      </div>

      <div className="p-4 pt-2 border-t border-gray-800/50 shrink-0">
        <button onClick={saveProgress} className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-gray-400 text-xs font-medium rounded border border-gray-700 transition-all flex justify-center items-center gap-2 uppercase">Lưu bản thảo</button>
      </div>
    </div>
  );
};