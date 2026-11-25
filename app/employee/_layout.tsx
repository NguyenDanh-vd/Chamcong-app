import { Stack } from "expo-router";

export default function EmployeeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Đăng ký khuôn mặt */}
      <Stack.Screen name="register/index" />

      {/* Làm thêm - Tạo đơn */}
      <Stack.Screen
        name="lam-them/create"
        options={{ presentation: "modal" }}
      />

      {/* Nghỉ phép - Tạo đơn */}
      <Stack.Screen
        name="nghi-phep/create"
        options={{ presentation: "modal" }}
      />
    </Stack>
  );
}