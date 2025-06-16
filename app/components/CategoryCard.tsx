import React from 'react';
import { Category } from '../types';

interface CategoryCardProps {
  category: Category;
  onClick: (categoryId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({
  category,
  onClick,
  onDragOver,
  onDragLeave,
  onDrop,
}) => {
  return (
    <div
      data-category-id={category.id}
      onClick={() => onClick(category.id)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className="bg-gray-800 p-4 rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-1 transition cursor-pointer text-center"
    >
      <span className="text-4xl mb-2 block">{category.emoji}</span>
      <p className="text-lg font-semibold text-gray-50">{category.name}</p>
    </div>
  );
}; 