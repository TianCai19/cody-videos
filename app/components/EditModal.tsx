import React, { useState } from 'react';

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (title: string, description: string) => void;
  initialTitle: string;
  initialDescription: string;
}

export const EditModal: React.FC<EditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTitle,
  initialDescription,
}) => {
  const [title, setTitle] = useState(initialTitle);
  const [description, setDescription] = useState(initialDescription);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSave = () => {
    onSave(title, description);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-800 p-8 rounded-xl shadow-2xl text-center w-full max-w-lg">
        <h3 className="text-2xl font-bold text-white mb-4">编辑视频信息</h3>
        <div className="space-y-4 text-left">
          <div>
            <label htmlFor="edit-title" className="block text-gray-300 text-lg font-medium mb-2">
              视频标题
            </label>
            <input
              type="text"
              id="edit-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
          <div>
            <label htmlFor="edit-description" className="block text-gray-300 text-lg font-medium mb-2">
              视频描述
            </label>
            <textarea
              id="edit-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full p-3 rounded-lg bg-gray-700 text-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-6 rounded-lg"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-2 px-6 rounded-lg"
          >
            保存
          </button>
        </div>
      </div>
    </div>
  );
}; 