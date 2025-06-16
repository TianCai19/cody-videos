export interface Category {
  id: string;
  name: string;
  emoji: string;
}

export interface Video {
  id: string;
  categoryId: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  videoUrl: string;
  type: 'embed' | 'link';
  isUserAdded: boolean;
}

export interface PreviousView {
  name: string;
  param: string | null;
} 