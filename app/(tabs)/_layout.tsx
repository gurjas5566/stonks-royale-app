import { Tabs } from "expo-router";
import { LineChart, Briefcase, History, Trophy, LayoutGrid } from "lucide-react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: "#0d0d0d", borderBottomWidth: 0 },
        headerTintColor: "#fff",
        tabBarStyle: {
          backgroundColor: "#1a1a1a",
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: "#00ff88",
        tabBarInactiveTintColor: "#888",
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Market",
          tabBarIcon: ({ color, size }) => <LineChart color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="industries"
        options={{
          title: "Sectors",
          tabBarIcon: ({ color, size }) => <LayoutGrid color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="portfolio"
        options={{
          title: "Portfolio",
          tabBarIcon: ({ color, size }) => <Briefcase color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Rankings",
          tabBarIcon: ({ color, size }) => <Trophy color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
