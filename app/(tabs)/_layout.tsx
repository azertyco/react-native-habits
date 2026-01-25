import AntDesign from '@expo/vector-icons/AntDesign';
import Entypo from '@expo/vector-icons/Entypo';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from "expo-router";

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: "#f5f5f5" },
        headerShown: true,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: "#f5f5f5",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarActiveTintColor: "#6200ee",
        tabBarInactiveTintColor: "#626666",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today's Habits",
          tabBarIcon: ({ color, size }) => (
            <MaterialCommunityIcons
              name="calendar-today"
              size={size}
              color={color}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="Streaks"
        options={{
          tabBarLabel: "Streaks",
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="line-chart" size={size} color={color} />
          ),
        }}
      />

       <Tabs.Screen
        name="Addhabit"
        options={{
          tabBarLabel: "Streaks",
          tabBarIcon: ({ color, size }) => (
            <Entypo name="circle-with-plus" size={size} color={color} />
          ),
        }}
      />


    </Tabs>
  );
}
