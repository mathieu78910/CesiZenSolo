import Feather from "@expo/vector-icons/Feather";
import Ionicons from "@expo/vector-icons/Ionicons";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#111111",
        tabBarInactiveTintColor: "#8A8177",
        tabBarStyle: {
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: "#FFF9F2",
          borderTopColor: "#E7DDD2",
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="articles"
        options={{
          title: "Articles",
          tabBarLabel: "Articles",
          tabBarIcon: ({ color, size }) => <Ionicons name="newspaper-outline" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="breathing"
        options={{
          title: "Respiration",
          tabBarLabel: "Respiration",
          tabBarIcon: ({ color, size }) => <Feather name="activity" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profil",
          tabBarLabel: "Profil",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person-outline" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
