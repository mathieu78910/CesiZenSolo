import { resources } from "@back/cesizen-api";
import { useSyncExternalStore } from "react";
import type { Article } from "./types";

type SavedArticlesState = {
  savedBySlug: Record<string, boolean>;
  countsBySlug: Record<string, number>;
};

const listeners = new Set<() => void>();

let state: SavedArticlesState = {
  savedBySlug: {},
  countsBySlug: {},
};

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emitChange() {
  listeners.forEach((listener) => listener());
}

function getSnapshot() {
  return state;
}

function writeSaveState(slug: string, savedByCurrentUser: boolean, saveCount: number) {
  state = {
    savedBySlug: {
      ...state.savedBySlug,
      [slug]: savedByCurrentUser,
    },
    countsBySlug: {
      ...state.countsBySlug,
      [slug]: saveCount,
    },
  };

  emitChange();
}

export function syncSavedArticle(article: Pick<Article, "slug" | "savedByCurrentUser" | "saveCount">) {
  if (!article.slug) {
    return;
  }

  writeSaveState(article.slug, article.savedByCurrentUser, article.saveCount);
}

export function useSavedArticle(article?: Pick<Article, "slug" | "resourceId">, token?: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (!article?.slug || !article.resourceId) {
    return {
      saved: false,
      toggleSaved: async () => {},
    };
  }

  return {
    saved: Boolean(snapshot.savedBySlug[article.slug]),
    saveCount: snapshot.countsBySlug[article.slug] ?? 0,
    toggleSaved: async () => {
      if (!token) {
        return;
      }

      const response = await resources.toggleResourceSave({
        resourceId: article.resourceId,
        token
      });

      writeSaveState(article.slug, response.resource.savedByCurrentUser, response.resource.saveCount);
    },
  };
}
