import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator, ScrollView, KeyboardAvoidingView, Platform } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { storage } from "../../utils/storage";
import io from "socket.io-client";
import api from "../../utils/api";
import { ArrowLeft } from "lucide-react-native";
import { LineChart } from "react-native-chart-kit";
import { Dimensions } from "react-native";
import { Svg, Rect, Text as SvgText, G } from "react-native-svg";
import { LinearGradient } from "expo-linear-gradient";

interface Stock {
  _id: string;
  symbol: string;
  name: string;
  sector: string;
  currentPrice: number;
  dailyChange: number;
  priceHistory: number[];
}

const SOCKET_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.1.11:5000";

export default function TradeStock() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const [stock, setStock] = useState<Stock | null>(null);
  const [sharesStr, setSharesStr] = useState("");
  const [loading, setLoading] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, value: 0, visible: false });

  useEffect(() => {
    const fetchInitial = async () => {
        try {
          const res = await api.get("/stocks");
          const found = res.data.find((s: Stock) => s.symbol === symbol);
          if (found) setStock(found);
        } catch (e) {
          console.error(e);
        }
    };
    fetchInitial();

    const socket = io(SOCKET_URL);
    socket.on("stock_prices_update", (updatedStocks: Stock[]) => {
      const found = updatedStocks.find((s) => s.symbol === symbol);
      if (found) setStock(found);
    });

    return () => {
      socket.disconnect();
    };
  }, [symbol]);

  const handleTrade = async (type: "buy" | "sell") => {
    const shares = parseInt(sharesStr, 10);
    if (isNaN(shares) || shares <= 0) {
      Alert.alert("Invalid input", "Please enter a valid number of shares.");
      return;
    }

    setLoading(true);
    try {
      const userId = await storage.getItem("userId");
      const endpoint = type === "buy" ? "/trade/buy" : "/trade/sell";
      
      await api.post(endpoint, {
        userId,
        stockSymbol: symbol,
        shares,
      });

      Alert.alert("Success", `Successfully ${type === "buy" ? "bought" : "sold"} ${shares} shares of ${symbol}.`);
      setSharesStr("");
    } catch (error: any) {
      const msg = error.response?.data?.message || `Failed to ${type} stock.`;
      Alert.alert("Trade Error", msg);
    } finally {
      setLoading(false);
    }
  };

  if (!stock) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const isPositive = stock.dailyChange >= 0;
  const changeColor = isPositive ? "#00ff88" : "#ff4444";

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <ArrowLeft color="#fff" size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{stock.symbol}</Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            <Text style={styles.name}>{stock.name}</Text>
            <View style={styles.sectorBadge}>
              <Text style={styles.sectorText}>{stock.sector}</Text>
            </View>
            <Text style={styles.price}>₹{Number(stock.currentPrice).toFixed(2)}</Text>
            <Text style={[styles.change, { color: changeColor }]}>
              {isPositive ? "+" : ""}{Number(stock.dailyChange).toFixed(2)} Today
            </Text>

            <View style={styles.chartContainer}>
              <LineChart
                data={{
                  labels: [], 
                  datasets: [
                    {
                      data: stock.priceHistory && stock.priceHistory.length > 0 
                        ? stock.priceHistory 
                        : [stock.currentPrice, stock.currentPrice],
                      color: (opacity = 1) => changeColor, 
                      strokeWidth: 3,
                    },
                  ],
                }}
                width={Dimensions.get("window").width + 20} 
                height={220}
                withDots={false}
                withInnerLines={false}
                withOuterLines={false}
                withHorizontalLabels={false}
                withVerticalLabels={false}
                chartConfig={{
                  backgroundColor: "transparent",
                  backgroundGradientFrom: "transparent",
                  backgroundGradientTo: "transparent",
                  fillShadowGradient: changeColor,
                  fillShadowGradientOpacity: 0.2,
                  color: (opacity = 1) => changeColor,
                  borderWidth: 0,
                }}
                bezier
                style={styles.chart}
                onDataPointClick={(data) => {
                  setTooltipPos({
                    x: data.x,
                    y: data.y,
                    value: data.value,
                    visible: true,
                  });
                }}
                decorator={() => {
                  return tooltipPos.visible ? (
                    <G>
                      <Rect
                        x={tooltipPos.x - 30}
                        y={tooltipPos.y - 40}
                        width="60"
                        height="30"
                        fill="#1a1a1a"
                        rx={8}
                        stroke={changeColor}
                        strokeWidth={1}
                      />
                      <SvgText
                        x={tooltipPos.x}
                        y={tooltipPos.y - 20}
                        fill="#fff"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        ₹{tooltipPos.value.toFixed(1)}
                      </SvgText>
                    </G>
                  ) : null;
                }}
              />
            </View>

            <View style={styles.tradeCard}>
              <LinearGradient
                colors={["rgba(255,255,255,0.05)", "rgba(255,255,255,0.01)"]}
                style={styles.cardGradient}
              />
              <Text style={styles.label}>Quantity to Trade</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#888"
                keyboardType="numeric"
                value={sharesStr}
                onChangeText={setSharesStr}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity 
                  style={[styles.buyBtn, loading && { opacity: 0.5 }]} 
                  onPress={() => handleTrade("buy")}
                  disabled={loading}
                >
                  <Text style={styles.btnText}>BUY</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.sellBtn, loading && { opacity: 0.5 }]} 
                  onPress={() => handleTrade("sell")}
                  disabled={loading}
                >
                  <Text style={styles.btnText}>SELL</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#1a1a1a",
  },
  backBtn: {
    padding: 8,
  },
  headerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
  },
  scrollContainer: {
    paddingBottom: 40,
  },
  content: {
    padding: 24,
    alignItems: "center",
  },
  name: {
    color: "#888",
    fontSize: 18,
    marginBottom: 8,
  },
  sectorBadge: {
    backgroundColor: "#333",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectorText: {
    color: "#aaa",
    fontSize: 12,
    fontWeight: "700",
  },
  price: {
    color: "#fff",
    fontSize: 54,
    fontWeight: "900",
    marginBottom: 8,
  },
  change: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  chartContainer: {
    marginBottom: 30,
    alignItems: "center",
  },
  chart: {
    marginLeft: -20,
    marginTop: 10,
  },
  tradeCard: {
    width: "100%",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 30,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  label: {
    color: "#aaa",
    marginBottom: 12,
    fontSize: 14,
  },
  input: {
    backgroundColor: "#0d0d0d",
    color: "#fff",
    fontSize: 32,
    fontWeight: "800",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 16,
  },
  buyBtn: {
    flex: 1,
    backgroundColor: "#00ff88",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  sellBtn: {
    flex: 1,
    backgroundColor: "#ff4444",
    padding: 18,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "900",
  },
});
