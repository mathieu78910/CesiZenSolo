export type ArticleCategory = "all" | "stress" | "sleep" | "focus" | "recovery";

export type ArticleResource = {
  resourceId: number;
  title: string;
  content: string;
  resourceType: string;
  likeCount: number;
  saveCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  categories: Array<{
    categoryId: number;
    label: string;
  }>;
};

export type Article = {
  resourceId: number;
  slug: string;
  title: string;
  category: Exclude<ArticleCategory, "all">;
  excerpt: string;
  htmlContent: string;
  readingTimeMinutes: number;
  publishedAt: string;
  author: string;
  likeCount: number;
  saveCount: number;
  likedByCurrentUser: boolean;
  savedByCurrentUser: boolean;
  featured?: boolean;
};
