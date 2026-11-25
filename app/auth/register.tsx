import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  Modal,
  ActivityIndicator,
} from "react-native";
import { useRouter, Link } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { FontAwesome, Ionicons, MaterialIcons } from "@expo/vector-icons";
import api from '../../utils/api'; 

export default function RegisterScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    matKhau: "",
    soDienThoai: "",
    cccd: "",
    diaChi: "",
    gioiTinh: "",
    tuoi: "",
    maPB: "",
    ngayBatDau: new Date(),
  });

  const [avatar, setAvatar] = useState<ImagePicker.ImagePickerAsset | null>(null);
  
  // UI Controls State
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [showGenderModal, setShowGenderModal] = useState(false);

  // 1. Load danh sách phòng ban
  useEffect(() => {
    api.get("/phongban")
      .then((res) => setDepartments(res.data))
      .catch(() => Alert.alert("Lỗi", "Không thể tải danh sách phòng ban"));
  }, []);

  // 2. Xử lý chọn ảnh (Camera hoặc Thư viện)
  const handlePickImage = async () => {
    Alert.alert("Chọn ảnh đại diện", "Bạn muốn lấy ảnh từ đâu?", [
      {
        text: "Chụp ảnh",
        onPress: async () => {
          const perm = await ImagePicker.requestCameraPermissionsAsync();
          if (perm.status !== "granted") return Alert.alert("Cần quyền camera");
          
          let result = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) setAvatar(result.assets[0]);
        },
      },
      {
        text: "Thư viện",
        onPress: async () => {
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });
          if (!result.canceled) setAvatar(result.assets[0]);
        },
      },
      { text: "Hủy", style: "cancel" },
    ]);
  };

  // 3. Xử lý Submit
  const handleSubmit = async () => {
    // Validate cơ bản
    if (!formData.hoTen || !formData.email || !formData.matKhau || !formData.maPB) {
      return Alert.alert("Thiếu thông tin", "Vui lòng điền đầy đủ các trường bắt buộc (*)");
    }

    setLoading(true);
    try {
      const data = new FormData();
      data.append("hoTen", formData.hoTen.trim());
      data.append("email", formData.email.trim());
      data.append("matKhau", formData.matKhau);
      if (formData.soDienThoai.trim()) data.append("soDienThoai", formData.soDienThoai.trim());
      if (formData.gioiTinh) data.append("gioiTinh", formData.gioiTinh);
      if (formData.tuoi.trim()) data.append("tuoi", formData.tuoi.trim());
      if (formData.diaChi.trim()) data.append("diaChi", formData.diaChi.trim());
      if (formData.cccd.trim()) data.append("cccd", formData.cccd.trim());
      if (formData.maPB) data.append("maPB", String(formData.maPB));
      
      // Format ngày: YYYY-MM-DD
      const dateStr = formData.ngayBatDau.toISOString().split('T')[0];
      data.append("ngayBatDau", dateStr);

      if (avatar) {
        // React Native FormData cần object có uri, type, name
        const fileType = avatar.uri.split('.').pop();
        data.append("avatar", {
          uri: avatar.uri,
          name: `avatar.${fileType}`,
          type: `image/${fileType === 'jpg' ? 'jpeg' : fileType}`,
        } as any);
      }

      await api.post("auth/register", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      Alert.alert("Thành công", "Đăng ký nhân viên thành công!", [
        { text: "Đăng nhập ngay", onPress: () => router.replace("/auth/login") }
      ]);

    } catch (err: any) {
      console.error(err);
      Alert.alert("Thất bại", err.response?.data?.message || "Đăng ký thất bại");
    } finally {
      setLoading(false);
    }
  };

  // Helper cập nhật state
  const handleChange = (key: string, value: string) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1">
      <LinearGradient colors={["#9333ea", "#7c3aed", "#2563eb"]} className="flex-1">
        <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
          
          <View className="bg-white/95 rounded-3xl p-6 shadow-xl mt-10">
            <Text className="text-2xl font-bold text-center text-gray-800 mb-6">Đăng Ký Nhân Viên</Text>

            {/* Avatar Upload */}
            <View className="items-center mb-6">
              <TouchableOpacity onPress={handlePickImage}>
                <View className="w-28 h-28 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 justify-center items-center overflow-hidden">
                  {avatar ? (
                    <Image source={{ uri: avatar.uri }} className="w-full h-full" />
                  ) : (
                    <FontAwesome name="camera" size={32} color="#9ca3af" />
                  )}
                </View>
              </TouchableOpacity>
              <Text className="text-blue-600 text-sm mt-2 font-medium">Chạm để tải ảnh</Text>
            </View>

            {/* Form Fields */}
            <View className="space-y-4">
              {/* Họ tên & Tuổi */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 text-xs font-bold">Họ tên *</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="Nguyễn Văn A"
                    value={formData.hoTen}
                    onChangeText={(t) => handleChange("hoTen", t)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 text-xs font-bold">Tuổi *</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="18+"
                    keyboardType="numeric"
                    value={formData.tuoi}
                    onChangeText={(t) => handleChange("tuoi", t)}
                  />
                </View>
              </View>

              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Email *</Text>
                 <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="email@company.com"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={formData.email}
                    onChangeText={(t) => handleChange("email", t)}
                  />
              </View>

              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Mật khẩu *</Text>
                 <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="••••••"
                    secureTextEntry
                    value={formData.matKhau}
                    onChangeText={(t) => handleChange("matKhau", t)}
                  />
              </View>

              {/* Phone & CCCD */}
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 text-xs font-bold">SĐT *</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="09..."
                    keyboardType="phone-pad"
                    value={formData.soDienThoai}
                    onChangeText={(t) => handleChange("soDienThoai", t)}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 mb-1 text-xs font-bold">CCCD *</Text>
                  <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5"
                    placeholder="12 số"
                    keyboardType="numeric"
                    value={formData.cccd}
                    onChangeText={(t) => handleChange("cccd", t)}
                  />
                </View>
              </View>

              {/* Gender Select */}
              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Giới tính</Text>
                 <TouchableOpacity 
                    onPress={() => setShowGenderModal(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-row justify-between items-center"
                 >
                    <Text className={formData.gioiTinh ? "text-gray-800" : "text-gray-400"}>
                      {formData.gioiTinh || "Chọn giới tính"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="gray" />
                 </TouchableOpacity>
              </View>

              {/* Department Select */}
              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Phòng ban *</Text>
                 <TouchableOpacity 
                    onPress={() => setShowDeptModal(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-row justify-between items-center"
                 >
                    <Text className={formData.maPB ? "text-gray-800" : "text-gray-400"}>
                      {departments.find(d => String(d.maPB) === String(formData.maPB))?.tenPhong || "Chọn phòng ban"}
                    </Text>
                    <Ionicons name="chevron-down" size={16} color="gray" />
                 </TouchableOpacity>
              </View>

              {/* Date Picker */}
              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Ngày bắt đầu</Text>
                 <TouchableOpacity 
                    onPress={() => setShowDatePicker(true)}
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 flex-row items-center"
                 >
                    <MaterialIcons name="date-range" size={20} color="gray" style={{marginRight: 8}}/>
                    <Text className="text-gray-800">
                      {formData.ngayBatDau.toLocaleDateString("vi-VN")}
                    </Text>
                 </TouchableOpacity>
                 {showDatePicker && (
                   <DateTimePicker
                     value={formData.ngayBatDau}
                     mode="date"
                     display="default"
                     onChange={(event, selectedDate) => {
                       setShowDatePicker(false);
                       if (selectedDate) setFormData(prev => ({ ...prev, ngayBatDau: selectedDate }));
                     }}
                   />
                 )}
              </View>

              {/* Address */}
              <View>
                 <Text className="text-gray-700 mb-1 text-xs font-bold">Địa chỉ</Text>
                 <TextInput 
                    className="bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 h-20"
                    placeholder="Nhập địa chỉ..."
                    multiline
                    value={formData.diaChi}
                    onChangeText={(t) => handleChange("diaChi", t)}
                    textAlignVertical="top"
                  />
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit}
                disabled={loading}
                className="rounded-xl overflow-hidden mt-4 shadow-md"
              >
                <LinearGradient
                  colors={["#2563eb", "#c026d3"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-4 items-center justify-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold text-lg">Đăng ký ngay</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              {/* Link Login: Dùng /auth/login là ĐÚNG nếu file đã ở app/auth/login.tsx */}
              <View className="flex-row justify-center mt-2 mb-6">
                <Text className="text-gray-500 text-sm">Đã có tài khoản? </Text>
                <Link href="/auth/login" asChild>
                  <TouchableOpacity>
                    <Text className="text-blue-600 font-bold text-sm">Đăng nhập</Text>
                  </TouchableOpacity>
                </Link>
              </View>
            </View>
          </View>

          {/* --- MODAL: Chọn Giới tính --- */}
          <Modal visible={showGenderModal} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl p-6">
                <Text className="text-lg font-bold mb-4 text-center">Chọn giới tính</Text>
                {["Nam", "Nữ", "Khác"].map((item) => (
                  <TouchableOpacity 
                    key={item} 
                    className="py-4 border-b border-gray-100"
                    onPress={() => {
                      handleChange("gioiTinh", item);
                      setShowGenderModal(false);
                    }}
                  >
                    <Text className="text-center text-gray-700 text-base">{item}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity onPress={() => setShowGenderModal(false)} className="mt-4">
                  <Text className="text-center text-red-500 font-bold">Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* --- MODAL: Chọn Phòng ban --- */}
          <Modal visible={showDeptModal} transparent animationType="slide">
            <View className="flex-1 justify-end bg-black/50">
              <View className="bg-white rounded-t-3xl p-6 max-h-[60%]">
                <Text className="text-lg font-bold mb-4 text-center">Chọn phòng ban</Text>
                <ScrollView>
                  {departments.map((dept) => (
                    <TouchableOpacity 
                      key={dept.maPB} 
                      className="py-4 border-b border-gray-100"
                      onPress={() => {
                        handleChange("maPB", String(dept.maPB));
                        setShowDeptModal(false);
                      }}
                    >
                      <Text className="text-center text-gray-700 text-base">{dept.tenPhong}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
                <TouchableOpacity onPress={() => setShowDeptModal(false)} className="mt-4 pt-2">
                  <Text className="text-center text-red-500 font-bold">Đóng</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}