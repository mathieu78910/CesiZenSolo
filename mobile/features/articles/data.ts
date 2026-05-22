import { resources } from "@back/cesizen-api";
import type { Article, ArticleCategory, ArticleResource } from "./types";

export const ARTICLE_TABS: { key: ArticleCategory; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "stress", label: "Stress" },
  { key: "sleep", label: "Sommeil" },
  { key: "focus", label: "Concentration" },
  { key: "recovery", label: "Recuperation" },
];

const CATEGORY_ALIASES: Record<ArticleCategory, string[]> = {
  all: [],
  stress: ["stress"],
  sleep: ["sleep", "sommeil"],
  focus: ["focus", "concentration"],
  recovery: ["recovery", "recuperation", "récuperation", "repos"]
};

function slugify(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferCategory(categories: string[]): Exclude<ArticleCategory, "all"> {
  const normalized = categories.map((label) => slugify(label));

  for (const category of ["stress", "sleep", "focus", "recovery"] as const) {
    if (CATEGORY_ALIASES[category].some((alias) => normalized.includes(alias))) {
      return category;
    }
  }

  return "stress";
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildExcerpt(content: string, title: string) {
  const firstParagraph = stripHtml(content) || title;
  return firstParagraph.length > 140 ? `${firstParagraph.slice(0, 137).trim()}...` : firstParagraph;
}

function estimateReadingTimeMinutes(content: string) {
  const wordCount = stripHtml(content).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(wordCount / 180));
}

export function mapResourceToArticle(resource: ArticleResource, featured = false): Article {
  const categoryLabels = (resource.categories || []).map((category) => category.label);

  return {
    resourceId: resource.resourceId,
    slug: `${slugify(resource.title)}-${resource.resourceId}`,
    title: resource.title,
    category: inferCategory(categoryLabels),
    excerpt: buildExcerpt(resource.content, resource.title),
    htmlContent: resource.content,
    readingTimeMinutes: estimateReadingTimeMinutes(resource.content),
    publishedAt: new Date().toISOString(),
    author: "Equipe CesiZen",
    likeCount: resource.likeCount ?? 0,
    saveCount: resource.saveCount ?? 0,
    likedByCurrentUser: Boolean(resource.likedByCurrentUser),
    savedByCurrentUser: Boolean(resource.savedByCurrentUser),
    featured
  };
}

export async function fetchArticles(token?: string) {
  const response = token
    ? await resources.listAppResources({
        limit: 100,
        resourceType: "ARTICLE",
        token
      })
    : await resources.listPublicResources({
        limit: 100,
        resourceType: "ARTICLE"
      });

  const articles = (response.resources || []).map((resource: ArticleResource, index: number) =>
    mapResourceToArticle(resource, index === 0)
  );

  return articles;
}

export function getArticlesByCategory(articles: Article[], category: ArticleCategory): Article[] {
  if (category === "all") {
    return articles;
  }

  return articles.filter((article) => article.category === category);
}

export function getArticleBySlug(articles: Article[], slug: string): Article | undefined {
  return articles.find((article) => article.slug === slug);
}
