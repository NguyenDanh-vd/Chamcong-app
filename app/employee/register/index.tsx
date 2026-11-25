import React, { useState, useRef, useEffect } from 'react';
import { 
  View, Text, TouchableOpacity, Alert, ActivityIndicator, Animated, Easing 
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jwtDecode } from 'jwt-decode';

import api from '../../../utils/api';
import { styles } from '../../../src/styles/register-face.styles';

const POSE_STEPS = [
  { key: 'center', instruction: 'Hãy nhìn thẳng vào camera và giữ khuôn mặt ở giữa khung hình.' },
  { key: 'left', instruction: 'Hãy xoay nhẹ đầu sang bên trái khoảng 20-30 độ.' },
  { key: 'right', instruction: 'Hãy xoay nhẹ đầu sang bên phải khoảng 20-30 độ.' },
];

export default function RegisterFaceScreen() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  
  // State
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraActive, setCameraActive] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [hasFace, setHasFace] = useState(false);
  const [maNV, setMaNV] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<string[]>([]);

  // Animation quét
  const scanAnim = useRef(new Animated.Value(0)).current;

  // 1. Check trạng thái đã đăng ký chưa
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("token");
        if (token) {
          const decoded: any = jwtDecode(token);
          setMaNV(decoded.maNV);
          const res = await api.get(`/facedata/check/${decoded.maNV}`);
          if (res.data?.hasFace) {
            setHasFace(true);
            Alert.alert("Thông báo", "Bạn đã có dữ liệu khuôn mặt. Thao tác này sẽ ghi đè dữ liệu cũ.");
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    checkStatus();
  }, []);

  // 2. Animation Effect
  useEffect(() => {
    if (cameraActive && !processing) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(scanAnim, {
            toValue: 300, // Chiều cao vùng camera
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(scanAnim, {
            toValue: 0,
            duration: 2000,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      scanAnim.setValue(0);
    }
  }, [cameraActive, processing, scanAnim]);

  // 3. Bật Camera
  const startCamera = async () => {
    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert("Lỗi", "Cần cấp quyền Camera để đăng ký khuôn mặt.");
        return;
      }
    }
    setCameraActive(true);
    setCurrentStep(0);
    setCapturedImages([]);
  };

  // 4. Chụp & Gửi Server
  const handleCapture = async () => {
    if (processing) return;
    setProcessing(true);

    try {
      if (cameraRef.current) {
        // Chụp ảnh
        const photo = await cameraRef.current.takePictureAsync({ 
          quality: 0.75, 
          base64: true,
          skipProcessing: true 
        });

        if (!photo?.base64) throw new Error("Lỗi chụp ảnh");

        const base64Image = `data:image/jpeg;base64,${photo.base64}`;
        const newImages = [...capturedImages, base64Image];
        setCapturedImages(newImages);

        if (currentStep < POSE_STEPS.length - 1) {
          setCurrentStep(currentStep + 1);
        } else {
          // Đã chụp đủ, gửi server
          await api.post("/facedata/register-mobile", {
            maNV: maNV,
            imagesBase64: newImages
          });

          Alert.alert("Thành công", "Đăng ký khuôn mặt thành công!", [
            { text: "OK", onPress: () => router.replace("/(tabs)/home") }
          ]);
          setCameraActive(false);
        }
      }
    } catch (err: any) {
      console.error(err);
      const msg = err.response?.data?.message || "Không tìm thấy khuôn mặt hoặc lỗi server.";
      Alert.alert("Thất bại", msg);
      setCurrentStep(0);
      setCapturedImages([]);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>
          {hasFace ? "Cập nhật khuôn mặt" : "Đăng ký khuôn mặt"}
        </Text>
        <Text style={styles.subtitle}>
          {cameraActive ? POSE_STEPS[currentStep].instruction : "Giữ thiết bị ngang tầm mắt và đảm bảo đủ ánh sáng."}
        </Text>
        <Text style={{ fontSize: 12, color: '#6b7280', textAlign: 'center', marginBottom: 10 }}>
          Bước {currentStep + 1} / {POSE_STEPS.length}
        </Text>

        <View style={[styles.cameraContainer, cameraActive && { borderColor: '#3b82f6' }]}>
          {cameraActive ? (
            <CameraView 
              ref={cameraRef}
              style={styles.camera}
              facing="front"
            >
              {!processing && (
                <Animated.View 
                  style={[
                    styles.scanLine, 
                    { transform: [{ translateY: scanAnim }] }
                  ]} 
                />
              )}
              {processing && (
                <View style={styles.cameraOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={{color:'white', marginTop:10, fontWeight:'bold'}}>Đang xử lý...</Text>
                </View>
              )}
            </CameraView>
          ) : (
            <View style={styles.placeholder}>
              <Ionicons name="person-circle-outline" size={100} color="#d1d5db" />
              <TouchableOpacity style={styles.startBtn} onPress={startCamera}>
                <Text style={{color:'white', fontWeight:'bold'}}>Bắt đầu</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {cameraActive && (
          <View style={styles.btnContainer}>
            <TouchableOpacity 
              style={[styles.captureBtn, processing && { opacity: 0.7 }]}
              onPress={handleCapture}
              disabled={processing}
            >
              <Text style={styles.btnText}>
                {processing ? "ĐANG XỬ LÝ..." : currentStep < POSE_STEPS.length - 1 ? "CHỤP & TIẾP TỤC" : "CHỤP & LƯU"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.cancelBtn}
              onPress={() => router.back()}
              disabled={processing}
            >
              <Text style={styles.cancelText}>Hủy bỏ</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </View>
  );
}
