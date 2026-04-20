import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "expo-router";
import { Trophy } from "lucide-react-native";
import api from "../../utils/api";
import { LinearGradient } from "expo-linear-gradient";

interface LeaderboardUser {
  _id: string;
  username: string;
  level: number;
  netWorth: number;
  tag: string;
}

export default function Leaderboard() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get("/users/leaderboard");
      setUsers(res.data);
    } catch (error) {
      console.error("Failed to fetch leaderboard", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLeaderboard();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLeaderboard();
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#FFD700" />
      </View>
    );
  }

  const renderItem = ({ item, index }: { item: LeaderboardUser; index: number }) => {
    let rankColor = "#333";
    let icon = null;
    if (index === 0) {
      rankColor = "#FFD700"; // Gold
      icon = "🥇";
    } else if (index === 1) {
      rankColor = "#C0C0C0"; // Silver
      icon = "🥈";
    } else if (index === 2) {
      rankColor = "#CD7F32"; // Bronze
      icon = "🥉";
    }

    return (
      <View style={[styles.card, index < 3 && { borderColor: rankColor, borderWidth: 1.5, shadowColor: rankColor, shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: {width: 0, height: 0} }]}>
        <LinearGradient
          colors={index < 3 ? [rankColor + '20', "transparent"] : ["rgba(255,255,255,0.05)", "transparent"]}
          style={styles.cardGradient}
        />
        <View style={styles.rankContainer}>
          <Text style={[styles.rankText, { color: index < 3 ? rankColor : "#888" }]}>
            {icon ? icon : `#${index + 1}`}
          </Text>
        </View>
        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>{item.username}</Text>
            <View style={[styles.levelBadge, { borderColor: "#00ff8840", borderWidth: 1 }]}>
              <Text style={styles.levelText}>Tier {item.level}</Text>
            </View>
          </View>
          <Text style={styles.tagText}>{item.tag}</Text>
        </View>
        <View style={styles.netWorthContainer}>
          <Text style={styles.netWorthText}>₹{(item.netWorth / 1000).toFixed(1)}k</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Trophy color="#FFD700" size={32} />
        <Text style={styles.title}>Global Rankings</Text>
      </View>
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#FFD700" />
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
  },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    alignItems: "center",
    backgroundColor: "#111",
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a1a",
  },
  title: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
    letterSpacing: 1,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.03)",
    padding: 20,
    borderRadius: 24,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
    position: "relative",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  rankContainer: {
    width: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  rankText: {
    fontSize: 20,
    fontWeight: "900",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  username: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    marginRight: 8,
  },
  levelBadge: {
    backgroundColor: "#00ff8820",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  levelText: {
    color: "#00ff88",
    fontSize: 10,
    fontWeight: "900",
  },
  tagText: {
    color: "#aaa",
    fontSize: 12,
  },
  netWorthContainer: {
    alignItems: "flex-end",
  },
  netWorthText: {
    color: "#FFD700",
    fontSize: 18,
    fontWeight: "800",
  },
});
