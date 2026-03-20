import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, StyleSheet, Pressable,
  ActivityIndicator, RefreshControl, Platform, StatusBar
} from "react-native";
import { router } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { Colors } from "@/constants/colors";

function MarketCard({ market }: { market: any }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.marketCard, pressed && { opacity: 0.85 }]}
      onPress={() => router.push({ pathname: "/bet", params: { marketId: market.id, marketName: market.name } })}
    >
      <LinearGradient
        colors={[Colors.surface, Colors.cardBg]}
        style={styles.marketCardInner}
      >
        <View style={styles.marketTop}>
          <View style={styles.marketNameRow}>
            {market.isLive && (
              <View style={styles.liveBadge}>
                <View style={styles.liveDot} />
                <Text style={styles.liveText}>LIVE</Text>
              </View>
            )}
            <Text style={styles.marketName}>{market.name}</Text>
          </View>
          <Ionicons name="chevron-forward" size={16} color={Colors.gold} />
        </View>
        <View style={styles.marketBottom}>
          <View>
            <Text style={styles.marketLabel}>Result Time</Text>
            <Text style={styles.marketTime}>{market.resultTime}</Text>
          </View>
          <View style={{ alignItems: "flex-end" }}>
            <Text style={styles.marketLabel}>Latest Result</Text>
            <Text style={styles.marketResult}>
              {market.latestResult || "---"}
            </Text>
          </View>
        </View>
      </LinearGradient>
    </Pressable>
  );
}

function ResultCard({ result }: { result: any }) {
  return (
    <View style={styles.resultCard}>
      <Text style={styles.resultMarket}>{result.marketName}</Text>
      <View style={styles.resultNumberBg}>
        <Text style={styles.resultNumber}>{result.resultNumber}</Text>
      </View>
      <Text style={styles.resultDate}>{result.gameDate}</Text>
    </View>
  );
}

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { user, refreshUser } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  const { data: marketsData, refetch: refetchMarkets } = useQuery({
    queryKey: ["markets"],
    queryFn: api.markets.list,
    refetchInterval: 30000,
  });

  const { data: resultsData, refetch: refetchResults } = useQuery({
    queryKey: ["results"],
    queryFn: api.results.latest,
    refetchInterval: 30000,
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([refetchMarkets(), refetchResults(), refreshUser()]);
    setRefreshing(false);
  };

  const markets = marketsData?.markets || [];
  const results = (resultsData?.results || []).slice(0, 10);
  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: Colors.darkBg }]}>
      <StatusBar barStyle="light-content" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.gold} />}
      >
        {/* Header */}
        <LinearGradient
          colors={[Colors.crimson, Colors.darkBg]}
          style={[styles.headerGradient, { paddingTop: topPad + 16 }]}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.greeting}>Jai Hind!</Text>
              <Text style={styles.userName}>{user?.name || "Player"}</Text>
            </View>
            <Pressable
              style={styles.balanceChip}
              onPress={() => router.push("/(tabs)/wallet")}
            >
              <Ionicons name="wallet" size={14} color={Colors.gold} />
              <Text style={styles.balanceText}>₹{parseFloat(user?.walletBalance || "0").toFixed(2)}</Text>
            </Pressable>
          </View>

          <View style={styles.bannerCard}>
            <LinearGradient
              colors={[Colors.crimson, "#5D0000"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.bannerInner}
            >
              <View>
                <Text style={styles.bannerTitle}>Jodi Game</Text>
                <Text style={styles.bannerSub}>₹10 bet = ₹900 win</Text>
              </View>
              <View style={styles.bannerRight}>
                <Ionicons name="diamond" size={36} color={Colors.gold} />
              </View>
            </LinearGradient>
          </View>
        </LinearGradient>

        {/* Latest Results */}
        {results.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Latest Results</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.resultsRow}>
              {results.map(r => <ResultCard key={r.id} result={r} />)}
            </ScrollView>
          </View>
        )}

        {/* Markets */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Markets</Text>
          {markets.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>No markets available</Text>
            </View>
          ) : (
            markets.map(m => <MarketCard key={m.id} market={m} />)
          )}
        </View>

        <View style={{ height: Platform.OS === "web" ? 100 : insets.bottom + 80 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerGradient: { paddingHorizontal: 20, paddingBottom: 24 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  greeting: { fontFamily: "Inter_400Regular", fontSize: 13, color: Colors.textSecondary },
  userName: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  balanceChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    backgroundColor: "rgba(0,0,0,0.3)",
    borderWidth: 1, borderColor: Colors.gold,
    paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20,
  },
  balanceText: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.gold },
  bannerCard: { borderRadius: 16, overflow: "hidden" },
  bannerInner: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 20, borderRadius: 16, borderWidth: 1, borderColor: "rgba(212,160,23,0.3)",
  },
  bannerTitle: { fontFamily: "Inter_700Bold", fontSize: 22, color: Colors.textPrimary },
  bannerSub: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.gold, marginTop: 4 },
  bannerRight: {},
  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionTitle: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.textPrimary, marginBottom: 14 },
  resultsRow: { gap: 10, paddingBottom: 4 },
  resultCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12, padding: 12,
    alignItems: "center", minWidth: 90,
    borderWidth: 1, borderColor: Colors.border,
  },
  resultMarket: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted, marginBottom: 6, textAlign: "center" },
  resultNumberBg: {
    backgroundColor: Colors.crimson, borderRadius: 8,
    paddingHorizontal: 12, paddingVertical: 6, marginBottom: 6,
  },
  resultNumber: { fontFamily: "Inter_700Bold", fontSize: 18, color: Colors.gold },
  resultDate: { fontFamily: "Inter_400Regular", fontSize: 10, color: Colors.textMuted },
  marketCard: { marginBottom: 12, borderRadius: 16, overflow: "hidden" },
  marketCardInner: {
    borderRadius: 16, padding: 16,
    borderWidth: 1, borderColor: Colors.border,
  },
  marketTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  marketNameRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  liveBadge: {
    flexDirection: "row", alignItems: "center", gap: 4,
    backgroundColor: "rgba(231,76,60,0.2)",
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10,
  },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: Colors.error },
  liveText: { fontFamily: "Inter_700Bold", fontSize: 10, color: Colors.error },
  marketName: { fontFamily: "Inter_600SemiBold", fontSize: 16, color: Colors.textPrimary },
  marketBottom: { flexDirection: "row", justifyContent: "space-between" },
  marketLabel: { fontFamily: "Inter_400Regular", fontSize: 11, color: Colors.textMuted },
  marketTime: { fontFamily: "Inter_600SemiBold", fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  marketResult: { fontFamily: "Inter_700Bold", fontSize: 20, color: Colors.gold, marginTop: 2 },
  emptyState: { alignItems: "center", paddingVertical: 40, gap: 12 },
  emptyText: { fontFamily: "Inter_400Regular", fontSize: 14, color: Colors.textMuted },
});
