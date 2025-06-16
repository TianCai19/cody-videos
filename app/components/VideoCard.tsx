import React from 'react';
import { Video } from '../types';
import { Trash2, Edit2 } from 'lucide-react';

interface VideoCardProps {
  video: Video;
  onPlay: (videoId: string) => void;
  onDelete: (videoId: string) => void;
  onEdit: (video: Video) => void;
  isDraggable?: boolean;
}

export const VideoCard: React.FC<VideoCardProps> = ({
  video,
  onPlay,
  onDelete,
  onEdit,
  isDraggable = false,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    if (isDraggable) {
      e.dataTransfer.setData('text/plain', video.id);
      e.currentTarget.classList.add('dragging');
    }
  };

  return (
    <div
      id={`video-${video.id}`}
      className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transform hover:scale-105 transition group"
      draggable={isDraggable}
      onDragStart={handleDragStart}
    >
      <div className="relative">
        <img
          src={video.thumbnail}
          alt={`${video.title} 缩略图`}
          className="w-full h-48 object-cover cursor-pointer"
          onClick={() => onPlay(video.id)}
        />
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={() => onEdit(video)}
            className="bg-blue-600/70 hover:bg-blue-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit2 className="w-5 h-5 text-white" />
          </button>
          {(video.isUserAdded || !video.isUserAdded) && (
            <button
              onClick={() => onDelete(video.id)}
              className="bg-red-600/70 hover:bg-red-600 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 className="w-5 h-5 text-white" />
            </button>
          )}
        </div>
      </div>
      <div className="p-4 cursor-pointer" onClick={() => onPlay(video.id)}>
        <h3 className="text-xl font-semibold text-gray-50 mb-2 truncate">
          {video.title}
        </h3>
        <p
          className="text-gray-400 text-sm mb-3 h-10 overflow-hidden"
          style={{
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
          }}
        >
          {video.description}
        </p>
      </div>
    </div>
  );
}; 