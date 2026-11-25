import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter, Link } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { CameraView, useCameraPermissions } from "expo-camera";
import { FontAwesome5, Ionicons, MaterialIcons } from "@expo/vector-icons";

import api from "../../utils/api";
import CustomButton from "../../components/CustomButton";
import { styles } from "../../src/styles/login.styles";

export default function LoginScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);

  const [email, setEmail] = useState("");
  const [matKhau, setMatKhau] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [faceLoading, setFaceLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [permission, requestPermission] = useCameraPermissions();
  const MAX_FACE_RETRIES = 4;

  const [time, setTime] = useState(new Date());
  const [formMessage, setFormMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleFaceLogin = useCallback(async () => {
    if (!cameraRef.current || faceLoading) return;

    setFaceLoading(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.75,
        base64: true,
        skipProcessing: true,
      });

      if (!photo?.base64) {
        throw new Error("Khong chup duoc anh");
      }

      const payload = { imageBase64: `data:image/jpeg;base64,${photo.base64}` };
      const res = await api.post("/auth/login-face-mobile", payload);
      const token = res?.data?.access_token;

      if (!token) {
        throw new Error("Khong nhan duoc token");
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("remember_login", "1");
      setFormMessage({ type: "success", text: "Xac thuc khuon mat thanh cong." });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Khuon mat khong khop.";
      setFormMessage({ type: "error", text: msg });
      setRetryCount((prev) => prev + 1);
    } finally {
      setFaceLoading(false);
    }
  }, [faceLoading, router]);

  useEffect(() => {
    if (!showCamera || !cameraReady || faceLoading || retryCount >= MAX_FACE_RETRIES) return;

    const delay = retryCount === 0 ? 1000 : 2200;
    const timer = setTimeout(() => {
      if (!faceLoading) {
        handleFaceLogin();
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [showCamera, cameraReady, faceLoading, retryCount, handleFaceLogin]);

  const handleLogin = async () => {
    if (loading) return;

    const emailValue = email.trim();
    const passwordValue = matKhau.trim();

    if (!emailValue || !passwordValue) {
      setFormMessage({ type: "error", text: "Vui long nhap day du email/ma nhan vien va mat khau." });
      return;
    }

    setLoading(true);
    setFormMessage(null);

    try {
      const res = await api.post("/auth/login", { email: emailValue, matKhau: passwordValue });
      const token = res?.data?.access_token;

      if (!token) {
        throw new Error("Khong nhan duoc token");
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("remember_login", remember ? "1" : "0");

      setFormMessage({ type: "success", text: "Dang nhap thanh cong. Dang vao he thong..." });
      router.replace("/(tabs)/home");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Sai email hoac mat khau.";
      setFormMessage({ type: "error", text: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFaceID = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== "granted") {
        Alert.alert("Thong bao", "Ban can cap quyen camera de dang nhap khuon mat.");
        return;
      }
    }

    setCameraReady(false);
    setRetryCount(0);
    setShowCamera(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <StatusBar style="light" />
      <LinearGradient colors={["#c7f0ff", "#d8f2ff", "#dbeafe"]} style={styles.background} />

      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          <LinearGradient colors={["#0e7490", "#0284c7", "#0891b2"]} style={styles.brandPanel}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>IT</Text>
            </View>
            <Text style={styles.brandTitle}>Nen tang quan tri nhan su IT-GLOBAL</Text>
            <Text style={styles.brandDesc}>Bao mat dang nhap bang tai khoan hoac xac thuc khuon mat.</Text>
          </LinearGradient>

          <View style={styles.formSection}>
            <Text style={styles.title}>Dang nhap he thong</Text>
            <Text style={styles.subtitle}>Vui long nhap thong tin de tiep tuc lam viec</Text>

            {formMessage ? (
              <View style={formMessage.type === "error" ? styles.errorBox : styles.successBox}>
                <Text style={formMessage.type === "error" ? styles.errorText : styles.successText}>{formMessage.text}</Text>
              </View>
            ) : null}

            {!showCamera ? (
              <>
                <View style={styles.inputGroup}>
                  <FontAwesome5 name="user" size={16} color="#0284c7" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Email hoac ma nhan vien"
                    placeholderTextColor="#94a3b8"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <FontAwesome5 name="lock" size={16} color="#0284c7" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="Mat khau"
                    placeholderTextColor="#94a3b8"
                    value={matKhau}
                    onChangeText={setMatKhau}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword((prev) => !prev)}>
                    <Ionicons name={showPassword ? "eye-off" : "eye"} size={18} color="#94a3b8" />
                  </TouchableOpacity>
                </View>

                <View style={styles.optionsRow}>
                  <TouchableOpacity style={styles.rememberMe} onPress={() => setRemember((prev) => !prev)}>
                    <MaterialIcons
                      name={remember ? "check-box" : "check-box-outline-blank"}
                      size={18}
                      color="#0284c7"
                    />
                    <Text style={styles.optionText}> Ghi nho dang nhap</Text>
                  </TouchableOpacity>

                  <Link href="/auth/forgot-password" asChild>
                    <TouchableOpacity>
                      <Text style={styles.forgotText}>Quen mat khau?</Text>
                    </TouchableOpacity>
                  </Link>
                </View>

                <CustomButton title="Dang nhap" onPress={handleLogin} isLoading={loading} style={{ marginTop: 8 }} />
              </>
            ) : (
              <View style={styles.cameraContainer}>
                <View style={styles.cameraBox}>
                  <CameraView
                    style={styles.cameraPreview}
                    facing="front"
                    ref={cameraRef}
                    onCameraReady={() => setCameraReady(true)}
                  />

                  <TouchableOpacity style={styles.closeCamBtn} onPress={() => setShowCamera(false)}>
                    <Ionicons name="close" size={20} color="#ffffff" />
                  </TouchableOpacity>

                  {!cameraReady ? (
                    <View style={styles.cameraOverlay}>
                      <ActivityIndicator size="small" color="#ffffff" />
                      <Text style={styles.camText}>Dang khoi dong camera...</Text>
                    </View>
                  ) : null}

                  {faceLoading ? (
                    <View style={styles.cameraOverlay}>
                      <ActivityIndicator size="large" color="#ffffff" />
                      <Text style={styles.camText}>Dang xac thuc khuon mat...</Text>
                    </View>
                  ) : null}
                </View>

                <Text style={styles.faceScanLabel}>
                  {retryCount >= MAX_FACE_RETRIES
                    ? "Chua nhan dien duoc khuon mat"
                    : "Dang quet khuon mat..."}
                </Text>
                {retryCount >= MAX_FACE_RETRIES && !faceLoading ? (
                  <CustomButton
                    title="Quet lai khuon mat"
                    onPress={() => {
                      setRetryCount(0);
                      handleFaceLogin();
                    }}
                    style={{ marginTop: 10, paddingHorizontal: 20 }}
                  />
                ) : null}
              </View>
            )}

            {!showCamera ? (
              <View style={styles.faceIdContainer}>
                <TouchableOpacity style={styles.faceIdBtn} onPress={handleToggleFaceID}>
                  <View style={styles.faceIconBox}>
                    <FontAwesome5 name="smile" size={26} color="#0284c7" />
                  </View>
                </TouchableOpacity>
                <Text style={styles.faceIdText}>Dang nhap bang khuon mat</Text>
              </View>
            ) : null}

            {!showCamera ? (
              <View style={styles.timeContainer}>
                <Text style={styles.timeLabel}>Thoi gian hien tai</Text>
                <View style={styles.timeBadge}>
                  <Text style={styles.timeText}>
                    {time.toLocaleTimeString("vi-VN", { hour12: false })} - {time.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}
                  </Text>
                </View>
              </View>
            ) : null}

            <View style={styles.footer}>
              <Text style={styles.footerText}>Nhan vien moi? </Text>
              <Link href="/auth/register" asChild>
                <TouchableOpacity>
                  <Text style={styles.registerText}>Dang ky</Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
