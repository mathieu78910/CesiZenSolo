import { resources } from "@back/cesizen-api";
import { useSyncExternalStore } from "react";
import type { Article } from "./types";

type LikesState = {
  likedBySlug: Record<string, boolean>;
  countsBySlug: Record<string, number>;
};

const listeners = new Set<() => void>();

let state: LikesState = {
  likedBySlug: {},
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

function writeLikeState(slug: string, likedByCurrentUser: boolean, likeCount: number) {
  state = {
    likedBySlug: {
      ...state.likedBySlug,
      [slug]: likedByCurrentUser,
    },
    countsBySlug: {
      ...state.countsBySlug,
      [slug]: likeCount,
    },
  };

  emitChange();
}

export function syncArticleLikes(article: Pick<Article, "slug" | "likeCount" | "likedByCurrentUser">) {
  if (!article.slug) {
    return;
  }

  writeLikeState(article.slug, article.likedByCurrentUser, article.likeCount);
}

export function useArticleLikes(article?: Pick<Article, "slug" | "resourceId">, token?: string) {
  const snapshot = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  if (!article?.slug || !article.resourceId) {
    return {
      liked: false,
      likeCount: 0,
      toggleLike: async () => {},
    };
  }

  return {
    liked: Boolean(snapshot.likedBySlug[article.slug]),
    likeCount: snapshot.countsBySlug[article.slug] ?? 0,
    toggleLike: async () => {
      if (!token) {
        return;
      }

      const response = await resources.toggleResourceLike({
        resourceId: article.resourceId,
        token
      });

      writeLikeState(article.slug, response.resource.likedByCurrentUser, response.resource.likeCount);
    },
  };
}
