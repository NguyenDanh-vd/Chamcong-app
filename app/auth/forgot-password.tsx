import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome } from "@expo/vector-icons";
import api from "@/utils/api"; 

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    // 1. Validate đơn giản
    if (!email.trim()) {
      Alert.alert("Thông báo", "Vui lòng nhập địa chỉ email!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Lỗi", "Địa chỉ email không hợp lệ.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      
      Alert.alert(
        "Thành công",
        "Yêu cầu đã được gửi! Vui lòng kiểm tra email để nhận liên kết đặt lại mật khẩu.",
        [
          {
            text: "Quay lại đăng nhập",
            onPress: () => router.back(), 
          },
        ]
      );
      setEmail(""); // Reset form
    } catch (err: any) {
      console.error("Forgot Pass Error:", err);
      Alert.alert(
        "Thất bại",
        err?.response?.data?.message || "Lỗi kết nối đến máy chủ. Vui lòng thử lại."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      {/* Nền Gradient giống trang Login */}
      <LinearGradient
        colors={["#9333ea", "#7c3aed", "#2563eb"]} 
        className="flex-1 justify-center px-6"
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
          showsVerticalScrollIndicator={false}
        >
          {/* Card chứa nội dung */}
          <View className="bg-white rounded-2xl p-8 shadow-2xl">
            
            {/* Tiêu đề */}
            <View className="items-center mb-6">
              <View className="w-16 h-16 bg-blue-100 rounded-full items-center justify-center mb-4">
                <FontAwesome name="lock" size={32} color="#2563eb" />
              </View>
              <Text className="text-2xl font-bold text-gray-800 text-center">
                Quên mật khẩu?
              </Text>
              <Text className="text-gray-500 text-center mt-2 px-2">
                Nhập email của bạn để nhận liên kết đặt lại mật khẩu.
              </Text>
            </View>

            {/* Form nhập liệu */}
            <View className="space-y-4">
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email đã đăng ký
                </Text>
                <View className="flex-row items-center border border-gray-200 rounded-xl bg-white h-12 px-3 focus:border-blue-500">
                  <FontAwesome name="envelope" size={18} color="#9ca3af" />
                  <TextInput
                    className="flex-1 ml-3 text-gray-800 h-full"
                    placeholder="example@email.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={email}
                    onChangeText={setEmail}
                  />
                </View>
              </View>

              {/* Button Gửi */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="rounded-xl overflow-hidden mt-4 shadow-md"
              >
                <LinearGradient
                  colors={["#2563eb", "#9333ea"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3 items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">
                      Gửi liên kết
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            {/* Nút Quay lại */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mt-6 flex-row justify-center items-center"
            >
              <FontAwesome name="arrow-left" size={14} color="#2563eb" />
              <Text className="ml-2 text-blue-600 font-bold">
                Quay lại đăng nhập
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}