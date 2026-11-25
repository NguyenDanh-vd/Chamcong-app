import React, { useState } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, 
  ActivityIndicator, KeyboardAvoidingView 
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from "@expo/vector-icons";
import dayjs from "dayjs";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from "jwt-decode";

import api from "../../../utils/api";
import { styles } from "../../../src/styles/create.styles";

export default function CreateLeaveScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [reason, setReason] = useState("");
  const MAX_REASON_LENGTH = 300;

  // Picker Visibility State
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // --- Handlers cho DatePicker ---
  const onStartChange = (event: any, selectedDate?: Date) => {
    setShowStartPicker(Platform.OS === 'ios');
    if (selectedDate) setStartDate(selectedDate);
  };

  const onEndChange = (event: any, selectedDate?: Date) => {
    setShowEndPicker(Platform.OS === 'ios');
    if (selectedDate) setEndDate(selectedDate);
  };

  // --- Submit Handler ---
  const handleSubmit = async () => {
    // 1. Validate
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do nghỉ phép.");
      return;
    }

    if (reason.length > MAX_REASON_LENGTH) {
      Alert.alert("Lỗi", `Lý do không được quá ${MAX_REASON_LENGTH} ký tự.`);
      return;
    }

    // So sánh ngày (chỉ lấy phần ngày, bỏ qua giờ phút để chính xác)
    const sDate = dayjs(startDate).startOf('day');
    const eDate = dayjs(endDate).startOf('day');

    if (eDate.isBefore(sDate)) {
      Alert.alert("Lỗi", "Ngày kết thúc không thể trước ngày bắt đầu.");
      return;
    }

    setLoading(true);

    try {
      // 2. Lấy User ID từ Token
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        Alert.alert("Lỗi", "Không tìm thấy thông tin đăng nhập.");
        router.replace("/auth/login");
        return;
      }
      const decoded: any = jwtDecode(token);
      const maNV = decoded.maNV;

      // 3. Gọi API
      // Endpoint: POST /nghiphep/{maNV}
      await api.post(`/nghiphep/${maNV}`, {
        ngayBatDau: dayjs(startDate).format("YYYY-MM-DD"),
        ngayKetThuc: dayjs(endDate).format("YYYY-MM-DD"),
        lyDo: reason
      });

      // 4. Thành công
      Alert.alert("Thành công", "Gửi đơn nghỉ phép thành công!", [
        { text: "OK", onPress: () => router.back() } // Quay lại danh sách
      ]);

    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Có lỗi xảy ra khi gửi đơn.";
      Alert.alert("Thất bại", msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#1f2937" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tạo đơn nghỉ phép</Text>
        <View style={styles.headerPlaceholder} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Ngày bắt đầu */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày bắt đầu</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowStartPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4b5563" />
              <Text style={styles.dateText}>
                {dayjs(startDate).format("DD/MM/YYYY")}
              </Text>
            </TouchableOpacity>
            {showStartPicker && (
              <DateTimePicker
                value={startDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onStartChange}
              />
            )}
          </View>

          {/* Ngày kết thúc */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày kết thúc</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowEndPicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4b5563" />
              <Text style={styles.dateText}>
                {dayjs(endDate).format("DD/MM/YYYY")}
              </Text>
            </TouchableOpacity>
            {showEndPicker && (
              <DateTimePicker
                value={endDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={startDate} // Không cho chọn ngày nhỏ hơn ngày bắt đầu
                onChange={onEndChange}
              />
            )}
          </View>

          {/* Lý do */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lý do nghỉ</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Nhập lý do nghỉ phép..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              maxLength={MAX_REASON_LENGTH}
              value={reason}
              onChangeText={setReason}
            />
            <Text style={styles.charCount}>
              {reason.length}/{MAX_REASON_LENGTH}
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity 
            style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
               <ActivityIndicator color="white" />
            ) : (
               <Text style={styles.submitText}>GỬI ĐƠN</Text>
            )}
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}