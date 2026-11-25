import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function Index() {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          // Nếu có token -> Vào thẳng Home
          router.replace("/(tabs)/home");
        } else {
          // Chưa có token -> Vào Login
          router.replace("/auth/login");
        }
      } catch {
        router.replace("/auth/login");
      } finally {
        setIsChecking(false);
      }
    };

    checkLogin();
  }, [router]);

  if (isChecking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return null;
}
