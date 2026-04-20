import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Bike,
  Cpu,
  Gamepad2,
  PawPrint,
  Pizza,
  Puzzle,
  Rocket,
  Shirt,
  Wand2,
  Zap
} from "lucide-react-native";
import React from "react";
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const sectors = [
  { name: "Food & Snacks", icon: Pizza, color: "#FF6B6B" },
  { name: "Entertainment", icon: Gamepad2, color: "#4D96FF" },
  { name: "Technology", icon: Cpu, color: "#6BCB77" },
  { name: "Apparel", icon: Shirt, color: "#FFD93D" },
  { name: "Space Travel", icon: Rocket, color: "#AC70FF" },
  { name: "Companions", icon: PawPrint, color: "#FF9F45" },
  { name: "Toys", icon: Puzzle, color: "#4ECDC4" },
  { name: "Transportation", icon: Bike, color: "#F7D060" },
  { name: "Clean Energy", icon: Zap, color: "#00D1FF" },
  { name: "Magic & Spells", icon: Wand2, color: "#FF00E5" }
];

export default function Industries() {
  const router = useRouter();

  const renderItem = ({ item }: { item: typeof sectors[0] }) => (
    <TouchableOpacity 
      style={styles.card} 
      onPress={() => router.push(`/sector/${item.name}`)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={[item.color + '40', item.color + '10']}
        style={styles.cardGradient}
      />
      <View style={[styles.iconContainer, { backgroundColor: item.color + '20' }]}>
        <item.icon color={item.color} size={32} />
      </View>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.countText}>10 STOCKS</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Market Sectors</Text>
        <Text style={styles.subtitle}>Browse companies by category</Text>
      </View>
      <FlatList
        data={sectors}
        keyExtractor={(item) => item.name}
        renderItem={renderItem}
        numColumns={2}
        columnWrapperStyle={styles.row}
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    color: "#fff",
    fontSize: 28,
    fontWeight: "900",
  },
  subtitle: {
    color: "#888",
    fontSize: 16,
    marginTop: 4,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  row: {
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    padding: 24,
    borderRadius: 32,
    marginBottom: 16,
    alignItems: "center",
    overflow: "hidden",
    position: "relative",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.05)",
  },
  cardGradient: {
    ...StyleSheet.absoluteFillObject,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.1)",
  },
  name: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  countText: {
    color: "#fff",
    fontSize: 10,
    marginTop: 6,
    fontWeight: "800",
    opacity: 0.4,
    letterSpacing: 1,
  },
});
