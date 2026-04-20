import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import io from "socket.io-client";
import api from "../../utils/api";
import { TrendingUp, TrendingDown, Search, Rocket as RocketIcon } from "lucide-react-native";
import { TextInput, ScrollView } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  dailyChange: number;
}

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.11:5000";

export default function Dashboard() {
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const topRunners = [...stocks]
    .sort((a, b) => b.dailyChange - a.dailyChange)
    .slice(0, 5);

  const filteredStocks = stocks.filter(s => 
    s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.sector.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // 1. Fetch initial stock data
    const fetchStocks = async () => {
      try {
        const response = await api.get("/stocks");
        setStocks(response.data);
      } catch (error) {
        console.error("Failed to fetch initial stocks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStocks();

    // 2. Connect to Socket.IO for live updates
    const socket = io(SOCKET_URL);
    socket.on("connect", () => {
      console.log("Connected to live market data!");
    });

    socket.on("stock_prices_update", (updatedStocks: Stock[]) => {
      setStocks(updatedStocks);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const renderItem = ({ item }: { item: Stock }) => {
    const isPositive = item.dailyChange >= 0;
    const changeColor = isPositive ? "#00ff88" : "#ff4444";

    return (
      <TouchableOpacity 
        style={styles.stockCard} 
        onPress={() => router.push(`/stock/${item.symbol}`)}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
          style={styles.cardGradient}
        />
        <View style={styles.stockHeader}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.name}>{item.name}</Text>
          <View style={[styles.sectorBadge, { borderColor: "#333", borderWidth: 1 }]}>
            <Text style={styles.sectorText}>{item.sector}</Text>
          </View>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{Number(item.currentPrice).toFixed(2)}</Text>
          <View style={[styles.changeBadge, { 
            backgroundColor: changeColor + '15',
            borderColor: changeColor + '40',
            borderWidth: 1,
            shadowColor: changeColor,
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
          }]}>
            {isPositive ? <TrendingUp size={14} color={changeColor} /> : <TrendingDown size={14} color={changeColor} />}
            <Text style={[styles.change, { color: changeColor, textShadowColor: changeColor + '80', textShadowRadius: 8, textShadowOffset: {width: 0, height: 0} }]}>
              {isPositive ? "+" : ""}
              {Number(item.dailyChange).toFixed(2)}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
        <Text style={styles.loadingText}>Initializing Market Connection...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={filteredStocks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <>
            <View style={styles.searchContainer}>
              <Search color="#888" size={18} />
              <TextInput
                style={styles.searchInput}
                placeholder="Search stocks, sectors..."
                placeholderTextColor="#666"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>

            {searchQuery === "" && (
              <View style={styles.topRunnersSection}>
                <View style={styles.sectionHeader}>
                  <RocketIcon color="#00ff88" size={20} />
                  <Text style={styles.sectionTitle}>Top Runners Today</Text>
                </View>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  contentContainerStyle={styles.carouselContainer}
                >
                  {topRunners.map(item => {
                    const isPos = item.dailyChange >= 0;
                    return (
                      <TouchableOpacity 
                        key={item._id}
                        style={styles.runnerCard}
                        onPress={() => router.push(`/stock/${item.symbol}`)}
                      >
                        <LinearGradient
                          colors={[isPos ? "#00ff8820" : "#ff444420", "transparent"]}
                          style={styles.runnerGradient}
                        />
                        <Text style={styles.runnerSymbol}>{item.symbol}</Text>
                        <Text style={[styles.runnerChange, { color: isPos ? "#00ff88" : "#ff4444" }]}>
                          {isPos ? "+" : ""}{item.dailyChange.toFixed(2)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <Text style={styles.marketTitle}>
              {searchQuery ? "Search Results" : "All Assets"}
            </Text>
          </>
        }
      />
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
    alignItems: "center",
  },
  loadingText: {
    color: "#00ff88",
    marginTop: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  listContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#1a1a1a",
  },
  searchInput: {
    flex: 1,
    color: "#fff",
    marginLeft: 12,
    fontSize: 16,
  },
  topRunnersSection: {
    marginBottom: 32,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  carouselContainer: {
    gap: 12,
  },
  runnerCard: {
    backgroundColor: "#1a1a1a",
    padding: 16,
    borderRadius: 16,
    minWidth: 120,
    borderWidth: 1,
    borderColor: "#333",
  },
  runnerSymbol: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4,
  },
  runnerChange: {
    fontSize: 14,
    fontWeight: "800",
  },
  marketTitle: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 16,
    textTransform: "uppercase",
    letterSpacing: 2,
    opacity: 0.5,
  },
  stockCard: {
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  runnerGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  stockHeader: {
    flex: 1,
  },
  symbol: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 1,
  },
  name: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  sectorBadge: {
    backgroundColor: "#333",
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 6,
  },
  sectorText: {
    color: "#aaa",
    fontSize: 10,
    fontWeight: "700",
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
  },
  changeBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 6,
    gap: 4,
  },
  change: {
    fontSize: 14,
    fontWeight: "700",
  },
});
