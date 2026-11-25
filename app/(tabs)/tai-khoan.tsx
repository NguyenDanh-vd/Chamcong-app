import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Camera,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Moon,
  Phone,
  ScanFace,
  Settings,
  Shield,
  Sun,
  User,
  UserCog,
  X,
} from "lucide-react-native";

import api from "../../utils/api";
import { styles } from "../../src/styles/tai-khoan.styles";

interface UserInfo {
  id: number;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  role: string;
  avatarUrl?: string;
  cccd?: string;
  diaChi?: string;
}

export default function ProfileScreen() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const [editingProfile, setEditingProfile] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempPhone, setTempPhone] = useState("");
  const [tempCCCD, setTempCCCD] = useState("");
  const [tempDiaChi, setTempDiaChi] = useState("");

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [expandPassword, setExpandPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const defaultAvatar = "https://via.placeholder.com/150?text=Avatar";

  const resetTempData = (data: UserInfo) => {
    setTempEmail(data.email || "");
    setTempPhone(data.soDienThoai || "");
    setTempCCCD(data.cccd || "");
    setTempDiaChi(data.diaChi || "");
  };

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/nhanvien/profile");
      setUserInfo(res.data);
      resetTempData(res.data);
    } catch (err: any) {
      if (err?.response?.status === 401) {
        await AsyncStorage.removeItem("token");
        router.replace("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem("token");
    router.replace("/auth/login");
  };

  const uploadAvatar = async (asset: ImagePicker.ImagePickerAsset) => {
    if (!userInfo) return;

    setLoadingProfile(true);
    setMessage(null);
    try {
      const formData = new FormData();
      formData.append("maNV", String(userInfo.id));
      formData.append(
        "avatar",
        {
          uri: asset.uri,
          name: "avatar.jpg",
          type: "image/jpeg",
        } as any
      );

      const res = await api.post(`/nhanvien/${userInfo.id}/avatar`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const nextAvatar = res?.data?.avatarUrl || res?.data?.avatar;
      setUserInfo((prev) => (prev ? { ...prev, avatarUrl: `${nextAvatar}?t=${Date.now()}` } : prev));
      setMessage({ type: "success", text: "Doi anh dai dien thanh cong." });
      setShowSettingsModal(false);
    } catch {
      setMessage({ type: "error", text: "Khong the cap nhat anh dai dien." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        setMessage({ type: "error", text: "Ban can cap quyen de chon anh." });
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.6,
          });

      if (!result.canceled && result.assets?.[0]) {
        uploadAvatar(result.assets[0]);
      }
    } catch {
      setMessage({ type: "error", text: "Khong mo duoc bo chon anh." });
    }
  };

  const handleSaveChanges = async () => {
    if (!userInfo) return;

    setLoadingProfile(true);
    setMessage(null);

    try {
      const payload = {
        email: tempEmail.trim() || userInfo.email,
        soDienThoai: tempPhone.trim() || undefined,
        cccd: tempCCCD.trim() || undefined,
        diaChi: tempDiaChi.trim() || undefined,
      };

      await api.patch("/nhanvien/profile", payload);
      setUserInfo((prev) => (prev ? { ...prev, ...payload } : prev));
      setEditingProfile(false);
      setMessage({ type: "success", text: "Cap nhat thong tin thanh cong." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Cap nhat that bai." });
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      setMessage({ type: "error", text: "Nhap day du mat khau hien tai va mat khau moi." });
      return;
    }

    if (!userInfo?.id) return;

    setLoadingPassword(true);
    setMessage(null);

    try {
      await api.put(`/nhanvien/${userInfo.id}/password`, {
        oldPassword,
        newPassword,
      });

      setOldPassword("");
      setNewPassword("");
      setExpandPassword(false);
      setMessage({ type: "success", text: "Doi mat khau thanh cong." });
    } catch (err: any) {
      setMessage({ type: "error", text: err?.response?.data?.message || "Doi mat khau that bai." });
    } finally {
      setLoadingPassword(false);
    }
  };

  const formatRole = (role?: string) => {
    const roleMap: Record<string, string> = {
      nhanvien: "Nhan vien",
      nhansu: "Nhan su",
      quantrivien: "Quan tri vien",
    };
    return roleMap[role?.toLowerCase?.() || ""] || role || "Nhan vien";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  if (!userInfo) {
    return null;
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#0f4f9d", "#0ea5e9"]} style={styles.headerGradient}>
        <TouchableOpacity style={styles.settingsBtn} onPress={() => setShowSettingsModal(true)}>
          <Settings size={20} color="#ffffff" />
        </TouchableOpacity>

        <View style={styles.avatarContainer}>
          <Image source={{ uri: userInfo.avatarUrl || defaultAvatar }} style={styles.avatarImage} />
        </View>
        <Text style={styles.nameText}>{userInfo.hoTen}</Text>
        <Text style={styles.roleText}>{formatRole(userInfo.role)}</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {message ? (
          <View style={message.type === "success" ? styles.messageSuccess : styles.messageError}>
            <Text style={message.type === "success" ? styles.messageSuccessText : styles.messageErrorText}>{message.text}</Text>
          </View>
        ) : null}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleWrap}>
              <User size={17} color="#0284c7" />
              <Text style={styles.cardTitle}>Thong tin ca nhan</Text>
            </View>

            {!editingProfile ? (
              <TouchableOpacity onPress={() => setEditingProfile(true)}>
                <Text style={styles.editBtnText}>Chinh sua</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Mail size={16} color="#64748b" /></View>
            {editingProfile ? (
              <TextInput value={tempEmail} onChangeText={setTempEmail} style={styles.inputField} placeholder="Email" />
            ) : (
              <Text style={styles.infoText}>{userInfo.email || "--"}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Phone size={16} color="#16a34a" /></View>
            {editingProfile ? (
              <TextInput value={tempPhone} onChangeText={setTempPhone} style={styles.inputField} placeholder="So dien thoai" />
            ) : (
              <Text style={styles.infoText}>{userInfo.soDienThoai || "Chua cap nhat"}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><Shield size={16} color="#ea580c" /></View>
            {editingProfile ? (
              <TextInput value={tempCCCD} onChangeText={setTempCCCD} style={styles.inputField} placeholder="CCCD" />
            ) : (
              <Text style={styles.infoText}>{userInfo.cccd || "Chua cap nhat"}</Text>
            )}
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}><MapPin size={16} color="#dc2626" /></View>
            {editingProfile ? (
              <TextInput value={tempDiaChi} onChangeText={setTempDiaChi} style={styles.inputField} placeholder="Dia chi" />
            ) : (
              <Text style={styles.infoText}>{userInfo.diaChi || "Chua cap nhat"}</Text>
            )}
          </View>

          {editingProfile ? (
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveChanges} disabled={loadingProfile}>
                {loadingProfile ? <ActivityIndicator color="#ffffff" size="small" /> : <Text style={styles.btnText}>Luu thay doi</Text>}
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => {
                  setEditingProfile(false);
                  resetTempData(userInfo);
                }}
              >
                <Text style={styles.btnText}>Huy</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <LogOut size={18} color="#dc2626" />
          <Text style={styles.logoutText}>Dang xuat</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal visible={showSettingsModal} transparent animationType="slide" onRequestClose={() => setShowSettingsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Cai dat va bao mat</Text>
              <TouchableOpacity onPress={() => setShowSettingsModal(false)}>
                <X size={22} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBox}>
                    {theme === "dark" ? <Moon size={18} color="#9333ea" /> : <Sun size={18} color="#f97316" />}
                  </View>
                  <View>
                    <Text style={styles.settingText}>Giao dien</Text>
                    <Text style={styles.settingSub}>{theme === "dark" ? "Che do toi" : "Che do sang"}</Text>
                  </View>
                </View>
                <TouchableOpacity onPress={() => setTheme((prev) => (prev === "light" ? "dark" : "light"))}>
                  <Text style={styles.settingAction}>{theme === "dark" ? "Tat" : "Bat"}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <Text style={styles.sectionLabel}>Anh dai dien</Text>
              <View style={styles.avatarOptions}>
                <TouchableOpacity style={styles.avatarOptionBtn} onPress={() => pickImage(false)}>
                  <ImageIcon size={22} color="#0284c7" />
                  <Text style={styles.avatarOptionText}>Thu vien</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.avatarOptionBtn, styles.avatarOptionBtnGreen]} onPress={() => pickImage(true)}>
                  <Camera size={22} color="#16a34a" />
                  <Text style={styles.avatarOptionTextGreen}>Chup anh</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  setShowSettingsModal(false);
                  setEditingProfile(true);
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBoxBlue}>
                    <UserCog size={18} color="#4f46e5" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Sua thong tin</Text>
                    <Text style={styles.settingSub}>Email, SDT, CCCD, dia chi</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => {
                  setShowSettingsModal(false);
                  router.push("/employee/register" as any);
                }}
              >
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBoxBlue}>
                    <ScanFace size={18} color="#0284c7" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Cai dat Face ID</Text>
                    <Text style={styles.settingSub}>Dang ky hoac cap nhat khuon mat</Text>
                  </View>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={() => setExpandPassword((prev) => !prev)}>
                <View style={styles.settingLeft}>
                  <View style={styles.settingIconBoxRed}>
                    <Lock size={18} color="#dc2626" />
                  </View>
                  <View>
                    <Text style={styles.settingText}>Doi mat khau</Text>
                    <Text style={styles.settingSub}>Bao mat tai khoan</Text>
                  </View>
                </View>
              </TouchableOpacity>

              {expandPassword ? (
                <View style={styles.passwordForm}>
                  <View style={styles.passInputContainer}>
                    <TextInput
                      style={styles.passInput}
                      placeholder="Mat khau hien tai"
                      secureTextEntry={!showOld}
                      value={oldPassword}
                      onChangeText={setOldPassword}
                    />
                    <TouchableOpacity onPress={() => setShowOld((prev) => !prev)}>
                      {showOld ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </TouchableOpacity>
                  </View>

                  <View style={styles.passInputContainer}>
                    <TextInput
                      style={styles.passInput}
                      placeholder="Mat khau moi"
                      secureTextEntry={!showNew}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity onPress={() => setShowNew((prev) => !prev)}>
                      {showNew ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity style={styles.updatePassBtn} onPress={handleChangePassword} disabled={loadingPassword}>
                    {loadingPassword ? (
                      <ActivityIndicator color="#ffffff" size="small" />
                    ) : (
                      <Text style={styles.updatePassBtnText}>Cap nhat ngay</Text>
                    )}
                  </TouchableOpacity>
                </View>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
