import { useFocusEffect, useRouter } from "expo-router";
import { LogOut } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import io from "socket.io-client";
import api from "../../utils/api";
import { storage } from "../../utils/storage";

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.11:5000";

interface PortfolioItem {
  stockSymbol: string;
  shares: number;
}

interface UserProfile {
  _id: string;
  username: string;
  cash: number;
  xp?: number;
  level?: number;
  portfolio: PortfolioItem[];
}

interface Stock {
  symbol: string;
  currentPrice: number;
}

export default function Portfolio() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [livePrices, setLivePrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const handleLogout = async () => {
    await storage.removeItem("userId");
    await storage.removeItem("userToken");
    router.replace("/");
  };

  useFocusEffect(
    useCallback(() => {
      const fetchProfile = async () => {
        try {
          const userId = await storage.getItem("userId");
          if (!userId) return;
          const res = await api.get(`/auth/profile/${userId}`);
          setProfile(res.data);
        } catch (error) {
          console.error("Failed to fetch profile", error);
        } finally {
          setLoading(false);
        }
      };
      fetchProfile();
    }, [])
  );

  useEffect(() => {
    // Connect to live market to calculate active portfolio value
    const fetchInitialPrices = async () => {
        try {
            const res = await api.get("/stocks");
            const priceMap: Record<string, number> = {};
            res.data.forEach((s: Stock) => {
                priceMap[s.symbol] = s.currentPrice;
            });
            setLivePrices(priceMap);
        } catch (error) {
            console.error("Failed to fetch initial prices");
        }
    };
    fetchInitialPrices();

    const socket = io(SOCKET_URL);
    socket.on("stock_prices_update", (updatedStocks: Stock[]) => {
      const priceMap: Record<string, number> = {};
      updatedStocks.forEach((s) => {
        priceMap[s.symbol] = s.currentPrice;
      });
      setLivePrices(priceMap);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  // Calculate real-time Net Worth
  let portfolioValue = 0;
  profile?.portfolio.forEach((item) => {
    const currentPrice = livePrices[item.stockSymbol] || 0;
    portfolioValue += item.shares * currentPrice;
  });
  
  const buyingPower = profile?.cash || 0;
  const netWorth = buyingPower + portfolioValue;

  const level = profile?.level || 1;
  const xp = profile?.xp || 0;
  const progressPercent = Math.min((xp % 100), 100) + "%";

  let tag = "Beginner 🐥";
  if (netWorth >= 100000) tag = "Wall Street Whale 🐳";
  else if (netWorth >= 50000) tag = "Pro Trader 📈";
  else if (netWorth >= 25000) tag = "Market Maker 🦅";
  else if (netWorth >= 15000) tag = "Rising Star ⭐";

  const renderItem = ({ item }: { item: PortfolioItem }) => {
    const currentPrice = livePrices[item.stockSymbol] || 0;
    const positionValue = item.shares * currentPrice;

    return (
      <View style={styles.portfolioCard}>
        <View>
          <Text style={styles.symbol}>{item.stockSymbol}</Text>
          <Text style={styles.pricePerShare}>₹{currentPrice.toFixed(2)} per share</Text>
        </View>
        <View style={styles.rightInfo}>
          <Text style={styles.positionValue}>₹{positionValue.toFixed(2)}</Text>
          <View style={styles.sharesBadge}>
            <Text style={styles.sharesText}>{item.shares} Shares</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.balanceHeader}>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.7}>
          <LogOut color="#ff4444" size={20} />
        </TouchableOpacity>

        <Text style={styles.netWorthLabel}>Total Net Worth</Text>
        <Text style={styles.netWorthValue}>₹{netWorth.toFixed(2)}</Text>
        
        <View style={styles.tagContainer}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>

        <View style={styles.buyingPowerContainer}>
          <Text style={styles.buyingPowerLabel}>Buying Power: </Text>
          <Text style={styles.buyingPowerValue}>₹{buyingPower.toFixed(2)}</Text>
        </View>

        <View style={styles.levelContainer}>
          <View style={styles.levelInfo}>
            <Text style={styles.levelText}>Tier {level}</Text>
            <Text style={styles.xpText}>{xp % 100}/100 XP</Text>
          </View>
          <View style={styles.progressBar}>
            <LinearGradient
              colors={["#00ff88", "#00d1ff"]}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={[styles.progressFill, { width: progressPercent }]}
            />
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Your Positions</Text>

      {profile?.portfolio.length === 0 ? (
        <Text style={styles.emptyText}>You don't own any stocks yet.</Text>
      ) : (
        <FlatList
          data={profile?.portfolio}
          keyExtractor={(item) => item.stockSymbol}
          renderItem={renderItem}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d0d0d",
  },
  centerContainer: {
    flex: 1,
    backgroundColor: "#0d0d0d",
    justifyContent: "center",
  },
  balanceHeader: {
    padding: 30,
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
    backgroundColor: "#111",
    position: "relative",
  },
  logoutBtn: {
    position: "absolute",
    top: 24,
    right: 20,
    padding: 10,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  netWorthLabel: {
    color: "#888",
    fontSize: 16,
    marginBottom: 8,
  },
  netWorthValue: {
    color: "#fff",
    fontSize: 48,
    fontWeight: "900",
  },
  tagContainer: {
    backgroundColor: "#FFD70020",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#FFD700",
  },
  tagText: {
    color: "#FFD700",
    fontWeight: "800",
    fontSize: 12,
  },
  levelContainer: {
    width: "100%",
    marginTop: 24,
  },
  levelInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  levelText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  xpText: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "700",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "rgba(255,255,255,0.05)",
    borderRadius: 3,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    shadowColor: "#00ff88",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
  },
  buyingPowerContainer: {
    flexDirection: "row",
    marginTop: 16,
    backgroundColor: "rgba(0,255,136,0.1)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,255,136,0.2)",
  },
  buyingPowerLabel: {
    color: "#00ff88",
    opacity: 0.7,
    fontSize: 12,
  },
  buyingPowerValue: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "900",
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  listContainer: {
    paddingHorizontal: 20,
  },
  portfolioCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
  },
  symbol: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 1,
  },
  pricePerShare: {
    color: "#666",
    fontSize: 13,
    marginTop: 4,
  },
  rightInfo: {
    alignItems: "flex-end",
  },
  positionValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
  },
  sharesBadge: {
    backgroundColor: "#333",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sharesText: {
    color: "#00ff88",
    fontSize: 12,
    fontWeight: "700",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
