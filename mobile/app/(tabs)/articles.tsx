import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { ARTICLE_TABS, fetchArticles, getArticlesByCategory } from "../../features/articles/data";
import type { Article, ArticleCategory } from "../../features/articles/types";
import { syncArticleLikes, useArticleLikes } from "../../features/articles/useArticleLikes";
import { syncSavedArticle } from "../../features/articles/useSavedArticles";
import { useAuth } from "../../features/auth/AuthProvider";

const SHORT_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

function formatDate(date: string): string {
  return SHORT_DATE_FORMATTER.format(new Date(date));
}

export default function ArticlesScreen() {
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState<ArticleCategory>("all");
  const [allArticles, setAllArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadArticles = async () => {
      try {
        setIsLoading(true);
        setErrorMessage(null);
        const nextArticles = await fetchArticles(session?.accessToken);
        if (cancelled) {
          return;
        }

        nextArticles.forEach((article: Article) => {
          syncArticleLikes(article);
          syncSavedArticle(article);
        });
        setAllArticles(nextArticles);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Impossible de charger les articles.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadArticles();

    return () => {
      cancelled = true;
    };
  }, [session?.accessToken]);

  const articles = getArticlesByCategory(allArticles, activeTab);
  const featuredArticle = articles.find((article) => article.featured) ?? articles[0];
  const listArticles = featuredArticle ? articles.filter((article) => article.slug !== featuredArticle.slug) : articles;

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.eyebrow}>Magazine bien-etre</Text>
        <Text style={styles.title}>Articles et news autour du stress</Text>
        <Text style={styles.subtitle}>Contenus synchronises depuis le backend et l'admin web.</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
        {ARTICLE_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveTab(tab.key)}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
          >
            <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {isLoading ? (
        <View style={styles.feedbackCard}>
          <ActivityIndicator color="#2F241B" />
          <Text style={styles.feedbackText}>Chargement des articles...</Text>
        </View>
      ) : null}

      {!isLoading && errorMessage ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackError}>{errorMessage}</Text>
        </View>
      ) : null}

      {!isLoading && !errorMessage && featuredArticle ? (
        <ArticleCard article={featuredArticle} featured />
      ) : null}

      {!isLoading && !errorMessage && !articles.length ? (
        <View style={styles.feedbackCard}>
          <Text style={styles.feedbackText}>Aucun article publie pour le moment.</Text>
        </View>
      ) : null}

      <View style={styles.list}>
        {listArticles.map((article) => (
          <ArticleCard key={article.slug} article={article} />
        ))}
      </View>
    </ScrollView>
  );
}

type ArticleCardProps = {
  article: Article;
  featured?: boolean;
};

function ArticleCard({ article, featured = false }: ArticleCardProps) {
  const { likeCount } = useArticleLikes(article, undefined);

  return (
    <View style={featured ? styles.featuredCard : styles.card}>
      <View style={styles.cardTopRow}>
        {featured ? (
          <Text style={styles.featuredBadge}>A la une</Text>
        ) : (
          <Text style={styles.category}>{article.category.toUpperCase()}</Text>
        )}
        <Text style={styles.likesCount}>{likeCount} likes</Text>
      </View>

      <Link href={`/articles/${article.slug}`} asChild>
        <Pressable style={styles.cardBody}>
          {featured ? <Text style={styles.featuredTitle}>{article.title}</Text> : <Text style={styles.cardTitle}>{article.title}</Text>}
          {featured ? (
            <Text style={styles.featuredExcerpt}>{article.excerpt}</Text>
          ) : (
            <Text style={styles.cardExcerpt}>{article.excerpt}</Text>
          )}
          <Text style={styles.meta}>
            {formatDate(article.publishedAt)} · {article.readingTimeMinutes} min
          </Text>
          {!featured ? <Text style={styles.readMore}>Lire l'article</Text> : null}
        </Pressable>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#F7F3EE",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 28,
    gap: 18,
  },
  hero: {
    gap: 8,
  },
  eyebrow: {
    color: "#9A6B47",
    fontWeight: "800",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#171411",
  },
  subtitle: {
    color: "#675F57",
    lineHeight: 20,
  },
  tabsRow: {
    gap: 10,
    paddingVertical: 4,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#EDE3D8",
  },
  tabActive: {
    backgroundColor: "#111111",
  },
  tabText: {
    color: "#2B2621",
    fontWeight: "700",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  featuredCard: {
    backgroundColor: "#2F241B",
    borderRadius: 24,
    padding: 20,
    gap: 10,
  },
  featuredBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "#F6D9BC",
    color: "#60391A",
    fontSize: 12,
    fontWeight: "800",
  },
  featuredTitle: {
    color: "#FFF8F2",
    fontSize: 22,
    fontWeight: "800",
  },
  featuredExcerpt: {
    color: "#E9DDD0",
    lineHeight: 20,
  },
  list: {
    gap: 14,
  },
  feedbackCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
    alignItems: "center",
  },
  feedbackText: {
    color: "#675F57",
    textAlign: "center",
  },
  feedbackError: {
    color: "#A63D40",
    textAlign: "center",
    fontWeight: "700",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  cardBody: {
    gap: 10,
  },
  category: {
    color: "#9A6B47",
    fontWeight: "800",
    fontSize: 12,
  },
  meta: {
    color: "#8A8177",
    fontSize: 12,
  },
  likesCount: {
    color: "#8A8177",
    fontSize: 12,
    fontWeight: "700",
  },
  cardTitle: {
    color: "#151515",
    fontSize: 18,
    fontWeight: "800",
  },
  cardExcerpt: {
    color: "#675F57",
    lineHeight: 20,
  },
  readMore: {
    color: "#2F241B",
    fontWeight: "800",
  },
});
