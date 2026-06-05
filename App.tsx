
import React, { useState } from 'react';
import { StoryProvider, useStory } from './state/StoryContext';
import { MainWorkspace } from './components/MainWorkspace';
import { CreateWizard } from './components/CreateWizard';
import { StoryLibrary } from './components/StoryLibrary';

const AppContent: React.FC = () => {
    const { story, isStoriesLoaded } = useStory();
    const [viewMode, setViewMode] = useState<'library' | 'create'>('library');

    if (!isStoriesLoaded) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-950">
                <div className="loader-spinner mb-5"></div>
                <div className="text-primary-500 text-sm font-medium tracking-wide animate-pulse">
                    Đang tải dữ liệu Aetheria...
                </div>
            </div>
        );
    }

    if (story) {
        return <MainWorkspace />;
    }

    if (viewMode === 'create') {
        return <CreateWizard onCancel={() => setViewMode('library')} />;
    }

    return <StoryLibrary onCreateNew={() => setViewMode('create')} />;
};

const App: React.FC = () => {
  return (
    <StoryProvider>
      <AppContent />
    </StoryProvider>
  );
};

export default App;
