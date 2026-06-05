

import React, { useState } from 'react';
import { useStory } from '../state/StoryContext';

export const Editor: React.FC = () => {
  const { 
    story, 
    activeChapterId, 
    updateChapterContent, 
    isGenerating,
    generationStatus,
    updateStorySettings,
    generateRewrite
  } = useStory();

  const [isEditMode, setIsEditMode] = useState(true);
  const [showAiEdit, setShowAiEdit] = useState(false);
  const [rewriteInstruction, setRewriteInstruction] = useState('');
  
  const activeChapter = story?.chapters.find(c => c.id === activeChapterId);

  if (!activeChapter) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-gray-950">
            <p>Chọn một chương từ thanh bên để bắt đầu viết.</p>
        </div>
    );
  }

  const toggleNsfw = () => {
    if (story) {
        updateStorySettings({ nsfw: !story.nsfw });
    }
  };

  const handleRewrite = async () => {
      if (!rewriteInstruction.trim()) return;
      setShowAiEdit(false);
      await generateRewrite(rewriteInstruction);
      setRewriteInstruction('');
  };

  return (
    <div className="flex-1 overflow-y-auto relative bg-gray-950 scroll-smooth">
      
      {/* --- FLOATING TOOLBAR --- */}
      <div className="sticky top-4 right-4 z-40 flex justify-end px-4 md:px-8 pointer-events-none">
          <div className="pointer-events-auto flex items-center gap-2 bg-gray-900/90 backdrop-blur border border-gray-700 rounded-lg p-1.5 shadow-xl transition-all relative">
             
             {/* NSFW Toggle shortcut */}
             <button 
                onClick={toggleNsfw}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black rounded transition-all border ${
                    story?.nsfw 
                    ? 'bg-red-900/40 text-red-400 border-red-500/50 shadow-[0_0_10px_rgba(239,68,68,0.2)]' 
                    : 'bg-gray-800/50 text-gray-600 border-transparent hover:text-gray-400'
                }`}
                title={story?.nsfw ? "Chế độ NSFW đang BẬT" : "Bật chế độ NSFW"}
             >
                18+
             </button>

             <div className="w-px h-4 bg-gray-700 mx-0.5"></div>

             {/* AI Edit Trigger */}
             <button
                onClick={() => setShowAiEdit(!showAiEdit)}
                disabled={isGenerating}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all border ${
                    showAiEdit
                    ? 'bg-purple-900/30 text-purple-400 border-purple-500/50'
                    : 'bg-gray-800/50 text-purple-400/80 border-transparent hover:text-purple-300'
                }`}
             >
                <span className="text-[10px]">✨</span> Sửa bằng AI
             </button>

             {/* AI Edit Popover */}
             {showAiEdit && (
                 <div className="absolute top-full right-0 mt-2 w-72 bg-gray-900 border border-gray-700 rounded-lg shadow-2xl p-3 z-50 animate-fadeIn">
                     <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Bạn muốn sửa gì?</label>
                     <textarea 
                        value={rewriteInstruction}
                        onChange={(e) => setRewriteInstruction(e.target.value)}
                        className="w-full h-24 bg-black/40 border border-gray-600 rounded p-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 mb-2 resize-none"
                        placeholder="VD: Viết lại đoạn này văn vẻ hơn, thêm miêu tả nội tâm..."
                        autoFocus
                     />
                     <div className="flex justify-end gap-2">
                         <button 
                            onClick={() => setShowAiEdit(false)}
                            className="text-xs text-gray-500 hover:text-white px-2 py-1"
                         >
                             Hủy
                         </button>
                         <button 
                            onClick={handleRewrite}
                            className="text-xs bg-purple-600 hover:bg-purple-500 text-white font-bold px-3 py-1 rounded shadow"
                         >
                             Thực hiện
                         </button>
                     </div>
                 </div>
             )}

             <div className="w-px h-4 bg-gray-700 mx-0.5"></div>

             {/* Mode Toggle */}
             <button 
                onClick={() => setIsEditMode(!isEditMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded transition-all border ${
                    isEditMode 
                    ? 'bg-primary-900/20 text-primary-400 border-primary-900/50 shadow-inner' 
                    : 'text-gray-400 hover:text-white hover:bg-gray-800 border-transparent'
                }`}
             >
                {isEditMode ? (
                    <span>Sửa thủ công</span>
                ) : (
                    <span>Chế độ Đọc</span>
                )}
             </button>
          </div>
      </div>

      <div className="max-w-3xl mx-auto py-10 px-4 md:py-16 md:px-8 min-h-screen">
        {/* Title Input */}
        {isEditMode ? (
            <input 
                type="text" 
                value={activeChapter.title} 
                onChange={(e) => {
                    // Direct title editing is not yet fully linked in this version
                }} 
                className="w-full bg-transparent text-3xl md:text-4xl font-serif font-bold text-gray-100 mb-8 focus:outline-none border-b border-transparent focus:border-gray-800 transition-colors mt-4 md:mt-0"
                placeholder="Tiêu đề chương"
            />
        ) : (
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-white mb-8 mt-4 md:mt-0 pb-1 border-b border-transparent">
                {activeChapter.title}
            </h1>
        )}
        
        {/* Content Area */}
        <div className="grid relative text-base md:text-lg leading-relaxed font-serif pb-32">
            
            <div 
                className={`col-start-1 row-start-1 whitespace-pre-wrap p-0 border-none m-0 w-full overflow-hidden break-words
                ${isEditMode 
                    ? 'invisible pointer-events-none' // Ghost mode
                    : 'visible text-gray-300'         // Read mode
                }`}
            >
                {activeChapter.content + '\u200b'}
            </div>

            <textarea
                value={activeChapter.content}
                onChange={(e) => updateChapterContent(activeChapter.id, e.target.value)}
                placeholder="Bắt đầu viết kiệt tác của bạn..."
                className={`col-start-1 row-start-1 w-full h-full bg-transparent text-gray-300 focus:outline-none resize-none overflow-hidden placeholder-gray-700 transition-opacity p-0 border-none m-0 break-words
                ${isGenerating ? 'opacity-80' : 'opacity-100'}
                ${!isEditMode ? 'hidden' : 'block'} 
                `}
                spellCheck={false}
                readOnly={isGenerating || !isEditMode} 
            />
            
            {isGenerating && (
                <div className="absolute bottom-0 left-0 w-full h-6 bg-gradient-to-t from-gray-950 to-transparent pointer-events-none z-10" />
            )}
        </div>
        
        {isGenerating && (
          <div className="fixed bottom-24 md:bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900/90 backdrop-blur border border-primary-500/30 text-primary-400 px-6 py-2 rounded-full shadow-2xl flex items-center gap-3 z-50 animate-bounce-slight">
            <span className="text-sm font-medium tracking-wide">{generationStatus || 'AI đang viết...'}</span>
          </div>
        )}
      </div>
    </div>
  );
};