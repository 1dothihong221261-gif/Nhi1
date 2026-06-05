
import React, { useState, useEffect } from 'react';
import { useStory } from '../state/StoryContext';
import { PRONOUN_STYLES, compilePronounStyle } from '../constants';

export const StorySettingsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { story, updateStorySettings } = useStory();
    const [formData, setFormData] = useState({
        title: '', genre: '', writingStyle: '', pov: '', pronounStyle: '', setting: '', negativePrompt: '', nsfw: false, eniMode: false
    });
    
    const [pronounStyleId, setPronounStyleId] = useState<string>('custom');

    useEffect(() => {
        if (story && isOpen) {
            setFormData({
                title: story.title,
                genre: story.genre,
                writingStyle: story.writingStyle || '',
                pov: story.pov,
                pronounStyle: story.pronounStyle,
                setting: story.setting,
                negativePrompt: story.negativePrompt,
                nsfw: story.nsfw || false,
                eniMode: story.eniMode || false
            });

            const matchedStyle = PRONOUN_STYLES.find(s => {
                if (s.id === 'custom') return false;
                return compilePronounStyle(s.label, s.config) === story.pronounStyle;
            });

            if (matchedStyle) {
                setPronounStyleId(matchedStyle.id);
            } else {
                setPronounStyleId('custom');
            }
        }
    }, [story, isOpen]);

    const handlePronounIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = e.target.value;
        setPronounStyleId(id);
        
        if (id !== 'custom') {
            const style = PRONOUN_STYLES.find(s => s.id === id);
            if (style && style.config) {
                const compiledPrompt = compilePronounStyle(style.label, style.config);
                setFormData(prev => ({ ...prev, pronounStyle: compiledPrompt }));
            }
        } else {
            // If switching to custom, clear if it was a preset, otherwise keep existing custom text
            const isCurrentlyPreset = PRONOUN_STYLES.some(s => {
                 return s.id !== 'custom' && compilePronounStyle(s.label, s.config) === formData.pronounStyle;
            });
            if (isCurrentlyPreset) {
                setFormData(prev => ({ ...prev, pronounStyle: '' }));
            }
        }
    };

    if (!isOpen || !story) return null;

    const handleSave = async () => {
        await updateStorySettings(formData);
        onClose();
    };

    const currentStyleDef = PRONOUN_STYLES.find(s => s.id === pronounStyleId);
    // When displaying preset text, we generate it on the fly
    const displayPresetText = currentStyleDef && currentStyleDef.id !== 'custom' 
        ? compilePronounStyle(currentStyleDef.label, currentStyleDef.config)
        : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
            <div className="bg-gray-900 border border-gray-700 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-white">Cài đặt Truyện</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">&times;</button>
                </div>
                <div className="p-6 space-y-4 overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-1">Tiêu đề</label>
                            <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-1">Thể loại</label>
                            <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={formData.genre} onChange={e => setFormData({...formData, genre: e.target.value})} />
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">Văn phong (Writing Style)</label>
                        <input className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={formData.writingStyle} onChange={e => setFormData({...formData, writingStyle: e.target.value})} placeholder="VD: Hài hước, Trầm buồn, Sắc bén..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-xs text-gray-500 uppercase mb-1">Góc nhìn</label>
                            <select className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" value={formData.pov} onChange={e => setFormData({...formData, pov: e.target.value})}>
                                <option value="Ngôi thứ 3 (Toàn tri)">Ngôi thứ 3 (Toàn tri)</option>
                                <option value="Ngôi thứ 3 (Giới hạn)">Ngôi thứ 3 (Giới hạn)</option>
                                <option value="Ngôi thứ 1 (Tôi/Ta)">Ngôi thứ 1 (Tôi / Ta)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 uppercase mb-1">Kiểu Xưng hô</label>
                            <select 
                                className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white mb-2" 
                                value={pronounStyleId} 
                                onChange={handlePronounIdChange}
                            >
                                {PRONOUN_STYLES.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    {/* Pronoun Detail/Edit Area */}
                    <div className="bg-gray-800/50 p-3 rounded border border-gray-700">
                        <label className="block text-xs text-primary-400 uppercase mb-1 font-bold">
                            {pronounStyleId === 'custom' ? 'Quy tắc xưng hô (Tùy chỉnh):' : 'Nội dung Prompt gửi cho AI:'}
                        </label>
                        {pronounStyleId === 'custom' ? (
                             <textarea 
                                className="w-full h-40 bg-gray-900 border border-gray-600 rounded p-2 text-white text-sm focus:outline-none focus:border-primary-500 animate-fadeIn custom-scrollbar" 
                                placeholder="Nhập quy tắc xưng hô riêng của bạn..."
                                value={formData.pronounStyle} 
                                onChange={e => setFormData({...formData, pronounStyle: e.target.value})} 
                            />
                        ) : (
                            <pre className="text-[11px] text-gray-300 whitespace-pre-wrap p-2 bg-gray-900/50 rounded h-40 overflow-y-auto custom-scrollbar border border-gray-800">
                                {displayPresetText}
                            </pre>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 uppercase mb-1">Thiết lập thế giới</label>
                        <textarea className="w-full h-24 bg-gray-800 border border-gray-700 rounded p-2 text-white resize-none" value={formData.setting} onChange={e => setFormData({...formData, setting: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs text-red-400 uppercase mb-1">Điều cấm kỵ (Negative)</label>
                        <textarea className="w-full h-16 bg-gray-800 border border-red-900/40 rounded p-2 text-white resize-none" value={formData.negativePrompt} onChange={e => setFormData({...formData, negativePrompt: e.target.value})} />
                    </div>
                    <div className="flex items-center gap-3">
                         <input type="checkbox" id="nsfw-setting" checked={formData.nsfw} onChange={e => setFormData({...formData, nsfw: e.target.checked})} className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-red-600 focus:ring-red-500" />
                         <label htmlFor="nsfw-setting" className="text-sm font-medium text-gray-300">Bật chế độ NSFW (18+)</label>
                    </div>
                    <div className="flex items-center gap-3 bg-primary-950/20 border border-primary-900/30 p-2.5 rounded-lg">
                         <input type="checkbox" id="eni-setting" checked={formData.eniMode} onChange={e => setFormData({...formData, eniMode: e.target.checked})} className="w-4 h-4 rounded bg-gray-800 border-gray-600 text-primary-500 focus:ring-primary-500" />
                         <label htmlFor="eni-setting" className="text-sm font-bold text-primary-400 font-mono">🔥 Kích hoạt ENI Mode (Cực mạnh, Không kiểm duyệt)</label>
                    </div>
                </div>
                <div className="p-4 border-t border-gray-800 flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 text-gray-400 hover:text-white">Hủy</button>
                    <button onClick={handleSave} className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded font-bold shadow-lg">Lưu thay đổi</button>
                </div>
            </div>
        </div>
    );
}
