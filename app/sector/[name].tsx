import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator 
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import io from "socket.io-client";
import api from "../../utils/api";
import { ArrowLeft, TrendingUp, TrendingDown } from "lucide-react-native";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  dailyChange: number;
}

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.11:5000";

export default function SectorDetail() {
  const { name } = useLocalSearchParams();
  const router = useRouter();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSectorStocks = async () => {
      try {
        const response = await api.get("/stocks");
        // Filter by sector name
        const filtered = response.data.filter((s: Stock) => s.sector === name);
        setStocks(filtered);
      } catch (error) {
        console.error("Failed to fetch sector stocks", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSectorStocks();

    const socket = io(SOCKET_URL);
    socket.on("stock_prices_update", (updatedStocks: Stock[]) => {
      const filtered = updatedStocks.filter((s) => s.sector === name);
      setStocks(filtered);
    });

    return () => {
      socket.disconnect();
    };
  }, [name]);

  const renderItem = ({ item }: { item: Stock }) => {
    const isPositive = item.dailyChange >= 0;
    const changeColor = isPositive ? "#00ff88" : "#ff4444";

    return (
      <TouchableOpacity 
        style={styles.stockCard} 
        onPress={() => router.push(`/stock/${item.symbol}`)}
        activeOpacity={0.7}
      >
        <View style={styles.stockHeader}>
          <Text style={styles.symbol}>{item.symbol}</Text>
          <Text style={styles.stockName}>{item.name}</Text>
        </View>
        <View style={styles.priceContainer}>
          <Text style={styles.price}>₹{Number(item.currentPrice).toFixed(2)}</Text>
          <View style={[styles.changeBadge, { backgroundColor: changeColor + '20' }]}>
            {isPositive ? <TrendingUp size={14} color={changeColor} /> : <TrendingDown size={14} color={changeColor} />}
            <Text style={[styles.change, { color: changeColor }]}>
              {isPositive ? "+" : ""}{Number(item.dailyChange).toFixed(2)}
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <View>
          <Text style={styles.title}>{name}</Text>
          <Text style={styles.subtitle}>10 Companies in this sector</Text>
        </View>
      </View>

      <FlatList
        data={stocks}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
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
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  backBtn: {
    marginRight: 16,
    padding: 8,
    backgroundColor: "#1a1a1a",
    borderRadius: 12,
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  subtitle: {
    color: "#666",
    fontSize: 14,
    fontWeight: "600",
  },
  listContainer: {
    padding: 16,
  },
  stockCard: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#333",
  },
  stockHeader: {
    flex: 1,
  },
  symbol: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  stockName: {
    color: "#888",
    fontSize: 14,
    marginTop: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  price: {
    color: "#fff",
    fontSize: 18,
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
    fontSize: 12,
    fontWeight: "700",
  },
});
