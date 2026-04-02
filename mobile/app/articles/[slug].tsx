import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Animated, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import RenderHtml from "react-native-render-html";
import { fetchArticles, getArticleBySlug } from "../../features/articles/data";
import type { Article } from "../../features/articles/types";
import { syncArticleLikes, useArticleLikes } from "../../features/articles/useArticleLikes";
import { syncSavedArticle, useSavedArticle } from "../../features/articles/useSavedArticles";
import { useAuth } from "../../features/auth/AuthProvider";

const LONG_DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(date: string): string {
  return LONG_DATE_FORMATTER.format(new Date(date));
}

function formatCompactLikeCount(count: number): string {
  if (count >= 1000000) {
    return `${(count / 1000000).toFixed(1).replace(".0", "")} M`;
  }

  if (count >= 1000) {
    return `${(count / 1000).toFixed(1).replace(".0", "")} k`;
  }

  return String(count);
}

export default function ArticleDetailsScreen() {
  const router = useRouter();
  const { session } = useAuth();
  const { width } = useWindowDimensions();
  const params = useLocalSearchParams<{ slug?: string }>();
  const [article, setArticle] = useState<Article | undefined>();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { liked, likeCount, toggleLike } = useArticleLikes(article, session?.accessToken);
  const { saved, saveCount, toggleSaved } = useSavedArticle(article, session?.accessToken);

  useEffect(() => {
    let cancelled = false;

    const loadArticle = async () => {
      if (!params.slug) {
        setArticle(undefined);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setErrorMessage(null);
        const articles = await fetchArticles(session?.accessToken);
        const nextArticle = getArticleBySlug(articles, params.slug);
        if (cancelled) {
          return;
        }

        if (nextArticle) {
          syncArticleLikes(nextArticle);
          syncSavedArticle(nextArticle);
        }
        setArticle(nextArticle);
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error instanceof Error ? error.message : "Impossible de charger l'article.");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadArticle();

    return () => {
      cancelled = true;
    };
  }, [params.slug, session?.accessToken]);

  const requireAccount = () => {
    router.push("/(auth)/login");
  };

  if (isLoading) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <ActivityIndicator color="#2F241B" />
          <Text style={styles.emptyText}>Chargement de l'article...</Text>
        </View>
      </>
    );
  }

  if (!article || errorMessage) {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Article introuvable</Text>
          <Text style={styles.emptyText}>
            {errorMessage || "Le contenu demande n'existe pas ou n'est pas encore synchronise."}
          </Text>
          <Pressable style={styles.backButton} onPress={() => router.replace("/(tabs)/articles")}>
            <Text style={styles.backButtonText}>Retour aux articles</Text>
          </Pressable>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView style={styles.screen} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Pressable style={styles.backLink} onPress={() => router.back()}>
          <Text style={styles.backLinkText}>Retour</Text>
        </Pressable>

        <View style={styles.heroCard}>
          <View style={styles.heroBadgeRow}>
            <Text style={styles.category}>{article.category.toUpperCase()}</Text>
            <View style={styles.metaPill}>
              <MaterialIcons name="schedule" size={14} color="#6A5747" />
              <Text style={styles.metaPillText}>{article.readingTimeMinutes} min</Text>
            </View>
          </View>
          <Text style={styles.title}>{article.title}</Text>
          <Text style={styles.meta}>
            {formatDate(article.publishedAt)} · {article.author}
          </Text>
          <Text style={styles.excerpt}>{article.excerpt}</Text>
          <View style={styles.actionsRow}>
            <View style={styles.actionsMeta}>
              <View style={styles.likeMeta}>
                <MaterialIcons name="favorite" size={15} color="#E53935" />
                <Text style={styles.likeCount}>
                  <Text style={styles.likeCountStrong}>{formatCompactLikeCount(likeCount)}</Text> J'aime
                </Text>
              </View>
              {!session?.accessToken ? <Text style={styles.authHint}>Connexion requise pour liker ou enregistrer</Text> : null}
            </View>
            <View style={styles.actionsGroup}>
              <SaveButton saved={saved} onPress={session?.accessToken ? toggleSaved : requireAccount} />
              <LikeButton liked={liked} onPress={session?.accessToken ? toggleLike : requireAccount} />
            </View>
          </View>
        </View>

        <View style={styles.bodyShell}>
          <View style={styles.bodyHeader}>
            <View>
              <Text style={styles.bodyEyebrow}>Lecture</Text>
              <Text style={styles.bodyTitle}>Contenu de la ressource</Text>
            </View>
            <View style={styles.bodyCountPill}>
              <MaterialIcons name="bookmark-border" size={15} color="#6A5747" />
              <Text style={styles.bodyCountText}>{saveCount} enregistrements</Text>
            </View>
          </View>
          <View style={styles.bodyDivider} />
        </View>

        <View style={styles.body}>
          <RenderHtml
            contentWidth={width - 40}
            source={{ html: article.htmlContent }}
            baseStyle={styles.paragraph}
            tagsStyles={{
              p: styles.htmlParagraph,
              ul: styles.htmlList,
              ol: styles.htmlList,
              li: styles.htmlListItem,
              h2: styles.htmlHeading,
              h3: styles.htmlHeadingSmall,
              h4: styles.htmlHeadingTiny,
              strong: styles.htmlStrong,
              a: styles.htmlLink,
              blockquote: styles.htmlBlockquote,
              code: styles.htmlInlineCode,
              pre: styles.htmlPre,
            }}
          />
        </View>
      </ScrollView>
    </>
  );
}

type LikeButtonProps = {
  liked: boolean;
  onPress: () => void;
};

type SaveButtonProps = {
  saved: boolean;
  onPress: () => void;
};

function SaveButton({ saved, onPress }: SaveButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const slide = useRef(new Animated.Value(0)).current;

  const handlePress = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.08,
          useNativeDriver: true,
          speed: 20,
          bounciness: 9,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 7,
        }),
      ]),
      Animated.sequence([
        Animated.timing(slide, {
          toValue: 1,
          duration: 170,
          useNativeDriver: true,
        }),
        Animated.timing(slide, {
          toValue: 0,
          duration: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    onPress();
  };

  return (
    <Pressable onPress={handlePress} style={[styles.saveButton, saved && styles.saveButtonActive]}>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.saveShine,
          {
            transform: [
              {
                translateX: slide.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-54, 54],
                }),
              },
              { rotate: "18deg" },
            ],
            opacity: slide.interpolate({
              inputRange: [0, 0.15, 1],
              outputRange: [0, 0.3, 0],
            }),
          },
        ]}
      />
      <Animated.View style={[styles.saveButtonContent, { transform: [{ scale }] }]}>
        <MaterialIcons name={saved ? "bookmark" : "bookmark-border"} size={20} color={saved ? "#FFF8F2" : "#2F241B"} />
        <Text style={[styles.saveButtonText, saved && styles.saveButtonTextActive]}>
          {saved ? "Enregistre" : "Enregistrer"}
        </Text>
      </Animated.View>
    </Pressable>
  );
}

function LikeButton({ liked, onPress }: LikeButtonProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const splashScale = useRef(new Animated.Value(0)).current;
  const splashOpacity = useRef(new Animated.Value(0)).current;
  const fillProgress = useRef(new Animated.Value(liked ? 1 : 0)).current;

  useEffect(() => {
    fillProgress.setValue(liked ? 1 : 0);
  }, [fillProgress, liked]);

  const handlePress = () => {
    const nextLiked = !liked;

    fillProgress.stopAnimation();
    splashScale.setValue(0);
    splashOpacity.setValue(0);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(scale, {
          toValue: 1.45,
          useNativeDriver: true,
          speed: 24,
          bounciness: 12,
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          speed: 18,
          bounciness: 8,
        }),
      ]),
      Animated.timing(fillProgress, {
        toValue: nextLiked ? 1 : 0,
        duration: 180,
        useNativeDriver: false,
      }),
      nextLiked
        ? Animated.sequence([
            Animated.parallel([
              Animated.timing(splashOpacity, {
                toValue: 0.95,
                duration: 70,
                useNativeDriver: true,
              }),
              Animated.timing(splashScale, {
                toValue: 1.15,
                duration: 170,
                useNativeDriver: true,
              }),
            ]),
            Animated.timing(splashOpacity, {
              toValue: 0,
              duration: 160,
              useNativeDriver: true,
            }),
          ])
        : Animated.timing(splashOpacity, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
    ]).start(() => {
      splashScale.setValue(0);
      splashOpacity.setValue(0);
    });

    onPress();
  };

  const animatedBackgroundColor = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#F2E7DB", "#E53935"],
  });

  const animatedBorderColor = fillProgress.interpolate({
    inputRange: [0, 1],
    outputRange: ["#E5D7C8", "#E53935"],
  });

  const iconColor = liked ? "#FFFFFF" : "#6E6258";

  return (
    <Pressable onPress={handlePress} hitSlop={10}>
      <Animated.View
        style={[
          styles.likeButton,
          {
            backgroundColor: animatedBackgroundColor,
            borderColor: animatedBorderColor,
          },
        ]}
      >
        <Animated.View
          pointerEvents="none"
          style={[
            styles.likeSplash,
            {
              opacity: splashOpacity,
              transform: [{ scale: splashScale }],
            },
          ]}
        />
        <Animated.View style={{ transform: [{ scale }] }}>
          <MaterialIcons name={liked ? "favorite" : "favorite-border"} size={26} color={iconColor} />
        </Animated.View>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FCF8F3",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 32,
    gap: 24,
  },
  backLink: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#EFE4D8",
  },
  backLinkText: {
    color: "#2F241B",
    fontWeight: "800",
  },
  heroCard: {
    gap: 12,
    padding: 20,
    borderRadius: 28,
    backgroundColor: "#FFF8F1",
    borderWidth: 1,
    borderColor: "#E9DCCF",
    shadowColor: "#8C674B",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  heroBadgeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  category: {
    color: "#7E4F2D",
    fontWeight: "800",
    fontSize: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#F5E1CC",
    borderRadius: 999,
    alignSelf: "flex-start",
    overflow: "hidden",
  },
  metaPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F2E7DB",
  },
  metaPillText: {
    color: "#6A5747",
    fontWeight: "700",
    fontSize: 12,
  },
  title: {
    color: "#171411",
    fontSize: 30,
    fontWeight: "800",
  },
  meta: {
    color: "#8A8177",
  },
  excerpt: {
    color: "#5E5952",
    lineHeight: 22,
    fontSize: 16,
  },
  actionsRow: {
    marginTop: 6,
    gap: 14,
  },
  actionsMeta: {
    gap: 6,
  },
  actionsActions: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  likeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  authHint: {
    color: "#8A6E59",
    fontSize: 12,
    fontWeight: "600",
    lineHeight: 18,
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    width: "100%",
  },
  likeCount: {
    color: "#5E5952",
    fontWeight: "700",
  },
  likeCountStrong: {
    color: "#171411",
    fontWeight: "900",
  },
  saveButton: {
    flex: 1,
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 23,
    backgroundColor: "#F2E7DB",
    overflow: "hidden",
  },
  saveButtonActive: {
    backgroundColor: "#2F241B",
  },
  saveButtonContent: {
    width: "100%",
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  saveShine: {
    position: "absolute",
    top: -10,
    bottom: -10,
    width: 24,
    backgroundColor: "#FFF8F2",
  },
  saveButtonText: {
    color: "#2F241B",
    fontWeight: "800",
  },
  saveButtonTextActive: {
    color: "#FFF8F2",
  },
  likeButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    overflow: "hidden",
  },
  likeSplash: {
    position: "absolute",
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#FF6B6B",
  },
  bodyShell: {
    gap: 12,
  },
  bodyHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
  },
  bodyEyebrow: {
    color: "#9A6B47",
    textTransform: "uppercase",
    letterSpacing: 1.1,
    fontWeight: "800",
    fontSize: 11,
  },
  bodyTitle: {
    color: "#171411",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 3,
  },
  bodyCountPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F2E7DB",
    maxWidth: "100%",
  },
  bodyCountText: {
    color: "#6A5747",
    fontWeight: "700",
    fontSize: 12,
    flexShrink: 1,
  },
  bodyDivider: {
    height: 1,
    backgroundColor: "#EADFD2",
  },
  body: {
    backgroundColor: "#FFFFFF",
    borderRadius: 28,
    paddingHorizontal: 22,
    paddingVertical: 24,
    gap: 16,
    borderWidth: 1,
    borderColor: "#EDE2D7",
    shadowColor: "#5F4633",
    shadowOpacity: 0.06,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  paragraph: {
    color: "#2B2621",
    lineHeight: 24,
    fontSize: 16,
  },
  htmlParagraph: {
    color: "#2B2621",
    lineHeight: 28,
    fontSize: 16,
    marginBottom: 14,
  },
  htmlList: {
    color: "#2B2621",
    marginBottom: 14,
    paddingLeft: 6,
  },
  htmlListItem: {
    color: "#2B2621",
    lineHeight: 25,
    marginBottom: 8,
  },
  htmlHeading: {
    color: "#171411",
    fontSize: 24,
    fontWeight: "800",
    marginTop: 18,
    marginBottom: 10,
  },
  htmlHeadingSmall: {
    color: "#171411",
    fontSize: 18,
    fontWeight: "800",
    marginTop: 14,
    marginBottom: 8,
  },
  htmlHeadingTiny: {
    color: "#171411",
    fontSize: 16,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 6,
  },
  htmlStrong: {
    fontWeight: "800",
    color: "#171411",
  },
  htmlLink: {
    color: "#9A6B47",
    textDecorationLine: "underline",
  },
  htmlBlockquote: {
    marginVertical: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderLeftWidth: 4,
    borderLeftColor: "#D89A66",
    backgroundColor: "#FBF3EA",
    color: "#5C4A3D",
    fontStyle: "italic",
  },
  htmlInlineCode: {
    backgroundColor: "#F4EADF",
    color: "#6C3E1E",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  htmlPre: {
    backgroundColor: "#1F1A16",
    color: "#FFF6EE",
    padding: 14,
    borderRadius: 14,
    overflow: "hidden",
    marginVertical: 14,
  },
  emptyState: {
    flex: 1,
    backgroundColor: "#FCF8F3",
    paddingHorizontal: 20,
    alignItems: "flex-start",
    justifyContent: "center",
    gap: 12,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#171411",
  },
  emptyText: {
    color: "#5E5952",
    lineHeight: 20,
  },
  backButton: {
    backgroundColor: "#111111",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
});
