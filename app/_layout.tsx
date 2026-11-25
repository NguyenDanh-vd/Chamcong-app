import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        
        {/* 1. Màn hình điều hướng ban đầu (Check token) */}
        <Stack.Screen name="index" />

        {/* 2. Nhóm Auth (Login, Register...) */}
        <Stack.Screen name="auth" />

        {/* 3. Nhóm Tabs (Home, History, Profile...) */}
        <Stack.Screen name="(tabs)" />

        {/* 4. Nhóm Employee (Các chức năng con) */}
        <Stack.Screen 
          name="employee" 
          options={{ 
            headerShown: false 
          }} 
        />
      </Stack>
    </>
  );
}