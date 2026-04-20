import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from "react-native";
import { useFocusEffect } from "expo-router";
import { storage } from "../../utils/storage";
import api from "../../utils/api";

interface Transaction {
  _id: string;
  stockSymbol: string;
  type: "buy" | "sell";
  shares: number;
  price: number;
  timestamp: string;
}

export default function History() {
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      const fetchHistory = async () => {
        try {
          const userId = await storage.getItem("userId");
          if (!userId) return;
          const res = await api.get(`/auth/history/${userId}`);
          setHistory(res.data);
        } catch (error) {
          console.error("Failed to fetch history", error);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#00ff88" />
      </View>
    );
  }

  const renderItem = ({ item }: { item: Transaction }) => {
    const isBuy = item.type === "buy";
    const actionColor = isBuy ? "#00ff88" : "#ff4444";
    const totalValue = (item.price * item.shares).toFixed(2);
    const dateStr = new Date(item.timestamp).toLocaleString();

    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={[styles.typeText, { color: actionColor }]}>
            {item.type.toUpperCase()} {item.stockSymbol}
          </Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        <View style={styles.detailsRow}>
          <Text style={styles.detailText}>{item.shares} shares @ ₹{item.price}</Text>
          <Text style={styles.totalText}>Total: ₹{totalValue}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {history.length === 0 ? (
        <Text style={styles.emptyText}>No trading history yet.</Text>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item._id}
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
  listContainer: {
    padding: 20,
  },
  card: {
    backgroundColor: "#1a1a1a",
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#333",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  typeText: {
    fontSize: 18,
    fontWeight: "900",
  },
  dateText: {
    color: "#666",
    fontSize: 12,
  },
  detailsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailText: {
    color: "#aaa",
    fontSize: 14,
  },
  totalText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  emptyText: {
    color: "#666",
    textAlign: "center",
    marginTop: 40,
    fontSize: 16,
  },
});
