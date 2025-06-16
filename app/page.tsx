'use client';

import React, { useState, useEffect } from 'react';
import { VideoCard } from './components/VideoCard';
import { CategoryCard } from './components/CategoryCard';
import { DeleteModal } from './components/DeleteModal';
import { EditModal } from './components/EditModal';
import { Video, Category, PreviousView } from './types';

const initialCategories: Category[] = [
  { id: 'mindset', name: '心智成长', emoji: '🧠' },
  { id: 'learning', name: '高效学习', emoji: '📚' },
];

const initialVideos: Video[] = [
  {
    id: 'v1',
    categoryId: 'mindset',
    title: 'MIT 6.S184: Flow Matching and Diffusion Models',
    description: 'Generative AI with SDEs, Lecture 01.',
    duration: '1:24:30',
    thumbnail: 'https://placehold.co/600x338/2d3748/cbd5e0?text=Flow+Matching',
    videoUrl: 'https://www.youtube.com/embed/GCoP2w-Cqtg',
    type: 'embed',
    isUserAdded: false,
  },
];

const EMOJI_POOL = ['💡', '🚀', '⭐', '🎯', '🔧', '🔬', '🎨', '🎵', '📈', '🌍'];

const STORAGE_KEY_VIDEOS = 'myGrowthVideoLibrary_videos_v2';
const STORAGE_KEY_CATEGORIES = 'myGrowthVideoLibrary_categories_v2';

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [currentView, setCurrentView] = useState('main-overview');
  const [previousView, setPreviousView] = useState<PreviousView>({
    name: 'main-overview',
    param: null,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null);
  const [currentPlayingVideo, setCurrentPlayingVideo] = useState<Video | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [videoToEdit, setVideoToEdit] = useState<Video | null>(null);

  useEffect(() => {
    loadDataFromStorage();
  }, []);

  const loadDataFromStorage = () => {
    const savedCategories = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    const savedVideos = localStorage.getItem(STORAGE_KEY_VIDEOS);

    setCategories(savedCategories ? JSON.parse(savedCategories) : initialCategories);
    setVideos(savedVideos ? JSON.parse(savedVideos) : initialVideos);

    if (!savedCategories || !savedVideos) {
      saveAllDataToStorage(initialCategories, initialVideos);
    }
  };

  const saveAllDataToStorage = (cats: Category[], vids: Video[]) => {
    localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(cats));
    localStorage.setItem(STORAGE_KEY_VIDEOS, JSON.stringify(vids));
  };

  const handleAddVideo = () => {
    const inputEl = document.getElementById('video-input') as HTMLTextAreaElement;
    const titleEl = document.getElementById('video-title-input') as HTMLInputElement;
    const descEl = document.getElementById('video-description-input') as HTMLTextAreaElement;
    const messageEl = document.getElementById('add-video-message');

    const inputVal = inputEl.value.trim();
    const customTitle = titleEl.value.trim();

    if (!inputVal) {
      if (messageEl) messageEl.textContent = '请输入链接或嵌入代码。';
      return;
    }

    let videoUrl = '';
    let videoType: 'embed' | 'link' = 'link';
    let autoTitle = '';

    const iframeMatch = inputVal.match(/<iframe[^>]+src="([^"]+)"/);
    const titleMatch = inputVal.match(/title="([^"]+)"/);

    console.log('Input value:', inputVal);
    console.log('Iframe match:', iframeMatch);
    console.log('Title match:', titleMatch);

    if (titleMatch && titleMatch[1]) {
      autoTitle = titleMatch[1];
    }

    if (iframeMatch && iframeMatch[1]) {
      videoUrl = iframeMatch[1];
      videoType = 'embed';
    } else {
      try {
        new URL(inputVal);
        videoUrl = inputVal;
        videoType = 'link';
      } catch (e) {
        if (messageEl) messageEl.textContent = '无效的链接或嵌入代码。';
        return;
      }
    }

    console.log('Video URL:', videoUrl);
    console.log('Video type:', videoType);
    console.log('Auto title:', autoTitle);

    const finalTitle = customTitle || autoTitle || '我的自定义视频';
    const newVideo: Video = {
      id: 'user-v-' + Date.now(),
      categoryId: 'user-added',
      title: finalTitle,
      description: descEl.value.trim() || '自定义视频描述。',
      duration: '未知',
      thumbnail: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(finalTitle)}&backgroundColor=5a67d8&textColor=ffffff&size=600&width=600&height=338`,
      videoUrl,
      type: videoType,
      isUserAdded: true,
    };

    console.log('New video:', newVideo);

    const newVideos = [...videos, newVideo];
    setVideos(newVideos);
    saveAllDataToStorage(categories, newVideos);

    inputEl.value = '';
    titleEl.value = '';
    descEl.value = '';

    if (messageEl) {
      messageEl.textContent = '视频已成功添加！';
      setTimeout(() => {
        if (messageEl) messageEl.textContent = '';
      }, 3000);
    }

    setCurrentView('main-overview');
  };

  const handleAddCategory = () => {
    const inputEl = document.getElementById('new-category-name') as HTMLInputElement;
    const name = inputEl.value.trim();
    if (!name) return;

    const newCategory: Category = {
      id: 'cat-' + Date.now(),
      name,
      emoji: EMOJI_POOL[Math.floor(Math.random() * EMOJI_POOL.length)],
    };

    const newCategories = [...categories, newCategory];
    setCategories(newCategories);
    saveAllDataToStorage(newCategories, videos);
    inputEl.value = '';
  };

  const handleDeleteVideo = (videoId: string) => {
    setVideoToDelete(videoId);
    setDeleteModalOpen(true);
  };

  const confirmDeleteVideo = () => {
    if (!videoToDelete) return;

    const newVideos = videos.filter((v) => v.id !== videoToDelete);
    setVideos(newVideos);
    saveAllDataToStorage(categories, newVideos);
    setDeleteModalOpen(false);
    setVideoToDelete(null);

    if (currentView === 'category-detail') {
      showCategoryDetail(previousView.param);
    } else {
      showMainOverview();
    }
  };

  const showMainOverview = () => {
    setCurrentView('main-overview');
    if (searchTerm) {
      performSearch(searchTerm);
    }
  };

  const showCategoryDetail = (categoryId: string | null) => {
    if (!categoryId) return;
    setPreviousView({ name: currentView, param: categoryId });
    setCurrentView('category-detail');
  };

  const showVideoPlay = (videoId: string) => {
    const video = videos.find((v) => v.id === videoId);
    if (video) {
      setCurrentPlayingVideo(video);
      setPreviousView({
        name: currentView,
        param: currentView === 'category-detail' ? video.categoryId : null,
      });
      setCurrentView('video-play');
    }
  };

  const performSearch = (term: string) => {
    setSearchTerm(term);
    const results = videos.filter(
      (v) =>
        v.title.toLowerCase().includes(term.toLowerCase()) ||
        v.description.toLowerCase().includes(term.toLowerCase())
    );
    // Update UI to show search results
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add('drop-zone-highlight');
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove('drop-zone-highlight');
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drop-zone-highlight');
    document.querySelector('.dragging')?.classList.remove('dragging');

    const videoId = e.dataTransfer.getData('text/plain');
    const categoryId = e.currentTarget.getAttribute('data-category-id');
    const video = videos.find((v) => v.id === videoId);

    if (video && categoryId) {
      const newVideos = videos.map((v) =>
        v.id === videoId ? { ...v, categoryId, isUserAdded: false } : v
      );
      setVideos(newVideos);
      saveAllDataToStorage(categories, newVideos);
    }
  };

  const handleEditVideo = (video: Video) => {
    setVideoToEdit(video);
    setEditModalOpen(true);
  };

  const handleSaveEdit = (title: string, description: string) => {
    if (!videoToEdit) return;

    const newVideos = videos.map((v) =>
      v.id === videoToEdit.id
        ? {
            ...v,
            title,
            description,
            thumbnail: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(title)}&backgroundColor=5a67d8&textColor=ffffff&size=600&width=600&height=338`,
          }
        : v
    );

    setVideos(newVideos);
    saveAllDataToStorage(categories, newVideos);
    setVideoToEdit(null);
  };

  const handleExportData = () => {
    const data = {
      categories,
      videos,
      version: '1.0',
      exportDate: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `my-growth-video-library-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data.categories && data.videos) {
          setCategories(data.categories);
          setVideos(data.videos);
          saveAllDataToStorage(data.categories, data.videos);
          alert('数据导入成功！');
        } else {
          alert('无效的数据格式！');
        }
      } catch (error) {
        alert('导入失败：无效的 JSON 文件！');
      }
    };
    reader.readAsText(file);
    // 重置 input 值，这样同一个文件可以重复导入
    event.target.value = '';
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-900 text-gray-100">
      <header className="bg-gray-800 p-4 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between">
          <h1
            className="text-3xl font-bold text-teal-400 mb-2 md:mb-0 cursor-pointer"
            onClick={showMainOverview}
          >
            🌱 我的成长视频库
          </h1>
          <nav className="flex flex-wrap justify-center gap-4 text-lg">
            <a
              href="#"
              className="text-gray-300 hover:text-teal-300 transition"
              onClick={showMainOverview}
            >
              主页
            </a>
            <div className="flex gap-2">
              <button
                onClick={handleExportData}
                className="text-gray-300 hover:text-teal-300 transition flex items-center gap-1"
              >
                <span>导出数据</span>
              </button>
              <label className="text-gray-300 hover:text-teal-300 transition flex items-center gap-1 cursor-pointer">
                <span>导入数据</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-8">
        {currentView === 'main-overview' && (
          <section>
            <div className="mb-8 p-4 bg-gray-800 rounded-xl shadow-md">
              <input
                type="text"
                id="search-input"
                placeholder="搜索我的所有视频..."
                className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 transition"
                value={searchTerm}
                onChange={(e) => performSearch(e.target.value)}
              />
            </div>

            <section className="mb-10 p-6 bg-gray-800 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-50 mb-6 border-b-2 border-teal-500 pb-2">
                添加新视频
              </h2>
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="video-input"
                    className="block text-gray-300 text-lg font-medium mb-2"
                  >
                    视频链接 (URL) 或 YouTube嵌入代码
                  </label>
                  <textarea
                    id="video-input"
                    rows={4}
                    className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="例如: https://... 或 <iframe src='...' title='自动提取的标题'></iframe>"
                  />
                </div>
                <div>
                  <label
                    htmlFor="video-title-input"
                    className="block text-gray-300 text-lg font-medium mb-2"
                  >
                    视频标题 (可选, 若留空则会从嵌入代码中自动提取)
                  </label>
                  <input
                    type="text"
                    id="video-title-input"
                    className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="输入视频标题"
                  />
                </div>
                <div>
                  <label
                    htmlFor="video-description-input"
                    className="block text-gray-300 text-lg font-medium mb-2"
                  >
                    视频描述 (可选)
                  </label>
                  <textarea
                    id="video-description-input"
                    rows={2}
                    className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="输入视频的简要描述"
                  />
                </div>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition w-full"
                  onClick={handleAddVideo}
                >
                  添加到我的视频库
                </button>
                <p id="add-video-message" className="text-center text-sm mt-2" />
              </div>
            </section>

            <section className="mb-10 p-6 bg-gray-800 rounded-xl shadow-lg">
              <h2 className="text-3xl font-bold text-gray-50 mb-6 border-b-2 border-teal-500 pb-2">
                我的分类
              </h2>
              <div className="flex gap-4">
                <input
                  type="text"
                  id="new-category-name"
                  className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="输入新分类名称..."
                />
                <button
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-lg shadow-md transition"
                  onClick={handleAddCategory}
                >
                  创建分类
                </button>
              </div>
            </section>

            <section className="mb-10">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {categories.map((category) => (
                  <CategoryCard
                    key={category.id}
                    category={category}
                    onClick={showCategoryDetail}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                  />
                ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-50 mb-6 border-b-2 border-teal-500 pb-2">
                精选推荐
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos
                  .filter((v) => !v.isUserAdded)
                  .map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={showVideoPlay}
                      onDelete={handleDeleteVideo}
                      onEdit={handleEditVideo}
                    />
                  ))}
              </div>
            </section>

            <section className="mb-10">
              <h2 className="text-3xl font-bold text-gray-50 mb-6 border-b-2 border-teal-500 pb-2">
                待分类视频
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {videos
                  .filter((v) => v.isUserAdded)
                  .map((video) => (
                    <VideoCard
                      key={video.id}
                      video={video}
                      onPlay={showVideoPlay}
                      onDelete={handleDeleteVideo}
                      onEdit={handleEditVideo}
                      isDraggable={true}
                    />
                  ))}
              </div>
            </section>
          </section>
        )}

        {currentView === 'category-detail' && (
          <section>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-6"
              onClick={showMainOverview}
            >
              ← 返回主页
            </button>
            <h2 className="text-3xl font-bold text-gray-50 mb-6 border-b-2 border-teal-500 pb-2">
              {categories.find((c) => c.id === previousView.param)?.name || '未知分类'}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {videos
                .filter((v) => v.categoryId === previousView.param)
                .map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onPlay={showVideoPlay}
                    onDelete={handleDeleteVideo}
                    onEdit={handleEditVideo}
                  />
                ))}
            </div>
          </section>
        )}

        {currentView === 'video-play' && currentPlayingVideo && (
          <section>
            <button
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded-lg mb-6"
              onClick={() =>
                previousView.name === 'category-detail'
                  ? showCategoryDetail(previousView.param)
                  : showMainOverview()
              }
            >
              ← 返回
            </button>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="relative w-full pt-[56.25%] mb-6">
                <iframe
                  src={currentPlayingVideo.videoUrl}
                  className="absolute inset-0 w-full h-full rounded-lg"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
              <h2 className="text-4xl font-bold text-teal-400 mb-4">
                {currentPlayingVideo.title}
              </h2>
              <p className="text-gray-300 text-lg leading-relaxed">
                {currentPlayingVideo.description}
              </p>
              <div className="flex justify-between items-center text-gray-400 text-sm mt-4">
                <span>时长: {currentPlayingVideo.duration}</span>
                <span>
                  分类:{' '}
                  {categories.find((c) => c.id === currentPlayingVideo.categoryId)?.name || '未知'}
                </span>
              </div>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-gray-800 p-6 mt-8 text-center text-gray-400 text-sm rounded-t-xl shadow-inner">
        <p>&copy; 2025 我的成长视频库. All rights reserved.</p>
      </footer>

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={confirmDeleteVideo}
      />

      <EditModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setVideoToEdit(null);
        }}
        onSave={handleSaveEdit}
        initialTitle={videoToEdit?.title || ''}
        initialDescription={videoToEdit?.description || ''}
      />
    </div>
  );
} 