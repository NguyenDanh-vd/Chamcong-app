import React, { useState, useEffect } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, Alert, ScrollView, Platform, 
  KeyboardAvoidingView 
} from "react-native";
import { useRouter } from "expo-router";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import dayjs from "dayjs";

import api from "../../../utils/api";
import { styles } from "../../../src/styles/lam-them-create.styles"; 
import CustomButton from "../../../components/CustomButton"; 

export default function CreateOvertimeScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [date, setDate] = useState(new Date());
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date());
  const [hours, setHours] = useState("");
  const [reason, setReason] = useState("");

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  useEffect(() => {
    if (endTime > startTime) {
      const diffMs = endTime.getTime() - startTime.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);
      setHours(diffHours.toFixed(1));
    } else {
      setHours("0");
    }
  }, [startTime, endTime]);

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) setDate(selectedDate);
  };

  const onStartTimeChange = (event: any, selectedDate?: Date) => {
    setShowStartTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newTime = new Date(startTime);
      newTime.setHours(selectedDate.getHours());
      newTime.setMinutes(selectedDate.getMinutes());
      setStartTime(newTime);
    }
  };

  const onEndTimeChange = (event: any, selectedDate?: Date) => {
    setShowEndTimePicker(Platform.OS === 'ios');
    if (selectedDate) {
      const newTime = new Date(endTime);
      newTime.setHours(selectedDate.getHours());
      newTime.setMinutes(selectedDate.getMinutes());
      setEndTime(newTime);
    }
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập lý do làm thêm.");
      return;
    }

    if (endTime <= startTime) {
      Alert.alert("Lỗi", "Giờ kết thúc phải sau giờ bắt đầu.");
      return;
    }

    setLoading(true);

    try {
      const payload = {
        ngayLT: dayjs(date).format("YYYY-MM-DD"),
        gioBatDau: dayjs(startTime).format("HH:mm"),
        gioKetThuc: dayjs(endTime).format("HH:mm"),
        soGio: parseFloat(hours),
        ghiChu: reason
      };

      await api.post(`/lamthem`, payload);

      Alert.alert("Thành công", "Đã gửi đơn làm thêm!", [
        { text: "OK", onPress: () => router.back() }
      ]);

    } catch (err: any) {
      console.error(err);
      const msg = err?.response?.data?.message || "Có lỗi xảy ra.";
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
        <Text style={styles.headerTitle}>Tạo đơn làm thêm</Text>
        <View style={styles.headerPlaceholder} /> 
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.content}>
          
          {/* Chọn Ngày */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngày làm thêm</Text>
            <TouchableOpacity 
              style={styles.dateInput} 
              onPress={() => setShowDatePicker(true)}
            >
              <Ionicons name="calendar-outline" size={20} color="#4b5563" />
              <Text style={styles.dateText}>
                {dayjs(date).format("DD/MM/YYYY")}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={onDateChange}
              />
            )}
          </View>

          {/* Chọn Giờ (Row) */}
          <View style={styles.row}>
            <View style={[styles.halfInputContainer, styles.mr10]}>
              <Text style={styles.label}>Bắt đầu</Text>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowStartTimePicker(true)}
              >
                 <Text style={styles.dateText}>{dayjs(startTime).format("HH:mm")}</Text>
              </TouchableOpacity>
              {showStartTimePicker && (
                <DateTimePicker
                  value={startTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onStartTimeChange}
                />
              )}
            </View>

            <View style={styles.halfInputContainer}>
              <Text style={styles.label}>Kết thúc</Text>
              <TouchableOpacity 
                style={styles.dateInput} 
                onPress={() => setShowEndTimePicker(true)}
              >
                 <Text style={styles.dateText}>{dayjs(endTime).format("HH:mm")}</Text>
              </TouchableOpacity>
              {showEndTimePicker && (
                <DateTimePicker
                  value={endTime}
                  mode="time"
                  is24Hour={true}
                  display="default"
                  onChange={onEndTimeChange}
                />
              )}
            </View>
          </View>

          {/* Số giờ (Readonly) */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tổng số giờ (Tự động)</Text>
            <View style={[styles.dateInput, styles.readOnlyBg]}>
               <FontAwesome5 name="clock" size={18} color="#6b7280" />
               <Text style={[styles.dateText, styles.readOnlyText]}>{hours} giờ</Text>
            </View>
          </View>

          {/* Lý do */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Lý do làm thêm</Text>
            <TextInput
              style={styles.textArea}
              placeholder="Nhập chi tiết công việc..."
              placeholderTextColor="#9ca3af"
              multiline
              numberOfLines={4}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          {/* Submit Button (Dùng CustomButton) */}
          <CustomButton 
            title="GỬI ĐƠN" 
            onPress={handleSubmit} 
            isLoading={loading}
            style={{ marginTop: 10 }}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}