
import React, { useRef, useState } from 'react';
import { useStory } from '../state/StoryContext';

export const StoryLibrary: React.FC<{ onCreateNew: () => void }> = ({ onCreateNew }) => {
    const { storiesList, openStory, deleteStory, exportStory, importStory } = useStory();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            importStory(e.target.files[0]);
        }
        e.target.value = '';
    };

    const handleDeleteClick = (id: string) => {
        setDeletingId(id);
    };

    const handleConfirmDelete = async (id: string) => {
        try {
            await deleteStory(id);
        } catch (error) {
            console.error("Failed to delete story:", error);
        } finally {
            setDeletingId(null);
        }
    };

    const handleExportTxt = (id: string) => {
        const story = storiesList.find(s => s.id === id);
        if (!story) return;

        let content = `${story.title.toUpperCase()}\n`;
        content += `Thể loại: ${story.genre}\n`;
        if (story.synopsis) content += `\n[TÓM TẮT]\n${story.synopsis}\n`;
        content += `\n====================================\n\n`;

        const sortedChapters = [...story.chapters].sort((a, b) => a.order - b.order);

        sortedChapters.forEach(ch => {
            content += `${ch.title.toUpperCase()}\n`;
            content += `------------------------------------\n`;
            content += `${ch.content}\n\n`;
            content += `====================================\n\n`;
        });

        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        const safeTitle = story.title.replace(/[^a-zA-Z0-9\u00C0-\u024F\u1E00-\u1EFF ]/g, '_').trim(); 
        link.download = `${safeTitle}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="min-h-screen bg-gray-950 p-8 font-sans">
             <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
                    <div>
                        <div className="flex flex-col gap-2 mb-4">
                            <h1 className="text-5xl font-serif font-bold bg-gradient-to-r from-primary-400 via-blue-500 to-purple-600 bg-clip-text text-transparent animate-fadeIn drop-shadow-sm leading-tight">
                                Aetheria
                            </h1>
                            <div className="flex items-center gap-3 animate-fadeIn">
                                <span className="text-[11px] text-gray-400 font-bold uppercase tracking-widest bg-gray-900 border border-gray-800 px-2 py-1 rounded shadow-sm">
                                    Builder: Sát Vách Lão Vương
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-gray-400 font-medium">Quản lý các thế giới và tác phẩm của bạn.</p>
                            <a 
                                href="https://discord.gg/MMqwg7Dny4" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 text-[#5865F2] hover:bg-[#5865F2] hover:text-white transition-all text-sm font-bold shadow-lg shadow-[#5865F2]/5"
                            >
                                Discord
                            </a>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept=".json,application/json" 
                            onChange={handleImport} 
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1 border border-gray-700 uppercase text-xs"
                        >
                            NHẬP (IMPORT)
                        </button>
                        <button 
                            onClick={onCreateNew}
                            className="bg-gradient-to-r from-primary-600 to-purple-600 hover:from-primary-500 hover:to-purple-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg flex items-center gap-2 transition-transform hover:-translate-y-1 border border-white/10 uppercase text-xs"
                        >
                            + TẠO TRUYỆN MỚI
                        </button>
                    </div>
                </div>

                {storiesList.length === 0 ? (
                    <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800 border-dashed">
                        <h3 className="text-xl text-gray-400 font-medium mb-2">Chưa có truyện nào</h3>
                        <p className="text-gray-600 mb-6">Hãy bắt đầu hành trình sáng tạo ngay hôm nay.</p>
                        <button onClick={onCreateNew} className="text-primary-400 hover:text-primary-300 font-bold uppercase text-sm">Bắt đầu ngay &rarr;</button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {storiesList.map(story => (
                            <div key={story.id} className="group relative bg-gray-900 border border-gray-800 rounded-xl overflow-hidden hover:border-primary-500/50 transition-all hover:shadow-2xl hover:shadow-primary-900/10 flex flex-col h-[280px]">
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                
                                <div className="p-6 flex-1 flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <span className="text-xs font-bold text-primary-400 px-2 py-1 bg-primary-900/20 rounded border border-primary-900/50 uppercase tracking-wider">
                                            {story.genre}
                                        </span>
                                        {story.nsfw && <span className="text-[10px] text-red-500 border border-red-900/50 px-1 rounded">18+</span>}
                                    </div>
                                    
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-2 font-serif group-hover:text-primary-400 transition-colors">
                                        {story.title}
                                    </h3>
                                    
                                    <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1">
                                        {story.synopsis}
                                    </p>
                                    
                                    <div className="flex items-center gap-4 text-xs text-gray-600 mt-auto pt-4 border-t border-gray-800 font-mono">
                                        <div>
                                            {story.chapters.length} CHƯƠNG
                                        </div>
                                        <div>
                                            {new Date(story.chapters[0]?.lastUpdated || story.createdAt).toLocaleDateString('vi-VN')}
                                        </div>
                                    </div>
                                </div>
                                
                                {deletingId === story.id ? (
                                    <div className="flex bg-red-900/20 border-t border-red-900/50">
                                        <button 
                                            onClick={() => handleConfirmDelete(story.id)}
                                            className="flex-1 py-3 text-sm font-bold text-red-400 hover:text-red-300 hover:bg-red-900/20 transition-colors animate-pulse uppercase"
                                        >
                                            XÁC NHẬN?
                                        </button>
                                        <div className="w-px bg-red-900/50"></div>
                                        <button 
                                            onClick={() => setDeletingId(null)}
                                            className="px-6 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors uppercase"
                                        >
                                            HỦY
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex bg-gray-950/50 border-t border-gray-800">
                                        <button 
                                            onClick={() => openStory(story.id)}
                                            className="flex-1 py-3 text-sm font-bold text-gray-300 hover:text-white hover:bg-gray-800 transition-colors uppercase"
                                        >
                                            MỞ TRUYỆN
                                        </button>
                                        
                                        <div className="w-px bg-gray-800"></div>
                                        
                                        <button 
                                            onClick={() => handleExportTxt(story.id)}
                                            className="px-3 py-3 text-sm font-bold text-gray-500 hover:text-blue-400 hover:bg-gray-800 transition-colors flex items-center justify-center uppercase"
                                            title="Xuất file văn bản (TXT)"
                                        >
                                            TXT
                                        </button>

                                        <div className="w-px bg-gray-800"></div>
                                        
                                        <button 
                                            onClick={() => exportStory(story.id)}
                                            className="px-3 py-3 text-sm font-bold text-gray-500 hover:text-green-400 hover:bg-gray-800 transition-colors flex items-center justify-center uppercase"
                                            title="Xuất file Backup (JSON)"
                                        >
                                            JSON
                                        </button>
                                        
                                        <div className="w-px bg-gray-800"></div>
                                        
                                        <button 
                                            onClick={() => handleDeleteClick(story.id)}
                                            className="px-5 py-3 text-sm font-bold text-red-500/70 hover:text-red-400 hover:bg-red-900/10 transition-colors uppercase"
                                            title="Xóa truyện"
                                        >
                                            XÓA
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
             </div>
        </div>
    );
};