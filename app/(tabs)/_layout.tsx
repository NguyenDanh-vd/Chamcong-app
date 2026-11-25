import { Tabs } from "expo-router";
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
        headerShown: false, 
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: { 
            height: Platform.OS === 'ios' ? 90 : 65,
            paddingBottom: Platform.OS === 'ios' ? 25 : 10,
            paddingTop: 10
        },
        tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '600',
            marginTop: 2
        }
    }}>
      {/* 1. TRANG CHỦ */}
      <Tabs.Screen 
        name="home" 
        options={{ 
            title: "Trang chủ", 
            tabBarIcon: ({color}) => <Ionicons name="home" size={24} color={color} /> 
        }} 
      />

      {/* 2. LỊCH SỬ */}
      <Tabs.Screen 
        name="lich-su" 
        options={{ 
            title: "Lịch sử", 
            tabBarIcon: ({color}) => <FontAwesome5 name="history" size={20} color={color} /> 
        }} 
      />

      {/* 3. NGHỈ PHÉP (Mới) */}
      <Tabs.Screen 
        name="nghi-phep" 
        options={{ 
            title: "Nghỉ phép", 
            tabBarIcon: ({color}) => <MaterialCommunityIcons name="calendar-account" size={24} color={color} /> 
        }} 
      />

      {/* 4. LÀM THÊM (Mới) */}
      <Tabs.Screen 
        name="lam-them" 
        options={{ 
            title: "Làm thêm", 
            tabBarIcon: ({color}) => <MaterialCommunityIcons name="briefcase-clock" size={24} color={color} /> 
        }} 
      />

      {/* 5. TÀI KHOẢN */}
      <Tabs.Screen 
        name="tai-khoan" 
        options={{ 
            title: "Tài khoản", 
            tabBarIcon: ({color}) => <FontAwesome5 name="user" size={20} color={color} /> 
        }} 
      />
    </Tabs>
  );
}