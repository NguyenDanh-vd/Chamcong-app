import React, { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { LinearGradient } from "expo-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { useRouter } from "expo-router";
import { AlertCircle, Briefcase, Camera, CameraOff, History, MessageCircle, Play, User } from "lucide-react-native";

import api from "../../utils/api";
import { styles } from "../../src/styles/home.styles";

interface AttendanceRecord {
  gioVao?: string;
  gioRa?: string;
}

interface CaLamViec {
  maCa: number;
  tenCa: string;
  gioBatDau: string;
  gioKetThuc: string;
}

interface UserToken {
  maNV: number;
  hoTen: string;
  role: string;
}

const formatTime = (dateString?: string) => {
  if (!dateString) return "--:--";
  if (dateString.length <= 8 && dateString.includes(":")) {
    return dateString.slice(0, 5);
  }
  const d = new Date(dateString);
  if (isNaN(d.getTime())) return "--:--";
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
};

export default function EmployeeHome() {
  const router = useRouter();
  const cameraRef = useRef<CameraView>(null);
  const [camPermission, requestCamPermission] = useCameraPermissions();

  const [user, setUser] = useState<UserToken | null>(null);
  const [attendanceRecord, setAttendanceRecord] = useState<AttendanceRecord>({});
  const [caLamViec, setCaLamViec] = useState<CaLamViec | null>(null);

  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(new Date());
  const [isProcessing, setIsProcessing] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [autoScan, setAutoScan] = useState(true);

  const [scanStatus, setScanStatus] = useState("");
  const [scanError, setScanError] = useState(false);

  const attendanceRef = useRef<AttendanceRecord>({});
  const autoScanRef = useRef(true);

  useEffect(() => {
    attendanceRef.current = attendanceRecord;
  }, [attendanceRecord]);

  useEffect(() => {
    autoScanRef.current = autoScan;
  }, [autoScan]);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const decoded: UserToken = jwtDecode(token);

      const [resProfile, resShift, resToday] = await Promise.all([
        api.get("/nhanvien/profile").catch(() => ({ data: null })),
        api.get("/calamviec/current-shift"),
        api.get(`/chamcong/today/${decoded.maNV}`),
      ]);

      setUser({
        maNV: decoded.maNV,
        hoTen: resProfile?.data?.hoTen || decoded.hoTen || "Nhan vien",
        role: decoded.role,
      });
      setCaLamViec(resShift.data || null);
      setAttendanceRecord(resToday.data || {});

      if (resToday.data?.gioVao && resToday.data?.gioRa) {
        setAutoScan(false);
        setScanError(false);
        setScanStatus("Ban da hoan thanh cham cong hom nay.");
      }
    } catch (err: any) {
      console.error("Loi tai du lieu cham cong:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    requestCamPermission();
    fetchData();
  }, [fetchData, requestCamPermission]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    const scanFace = async () => {
      if (!camPermission?.granted || !cameraReady || !user?.maNV || isProcessing || !autoScanRef.current) return;
      if (!cameraRef.current) return;

      const record = attendanceRef.current;
      if (record.gioVao && record.gioRa) return;

      setIsProcessing(true);
      setScanError(false);
      setScanStatus("Dang nhan dien khuon mat...");

      try {
        const photo = await cameraRef.current.takePictureAsync({
          quality: 0.75,
          base64: true,
          skipProcessing: true,
        });

        if (!photo?.base64) throw new Error("Khong chup duoc anh");

        const payload = {
          maNV: user.maNV,
          imageBase64: `data:image/jpeg;base64,${photo.base64}`,
          maCa: caLamViec?.maCa,
        };

        const res = await api.post("/facedata/point-mobile", payload);

        if (res.data?.type === "ignored") {
          setScanStatus(res.data?.message || "Vui long doi 1 phut truoc khi Check-out.");
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 60 * 1000);
          return;
        }

        setScanError(false);
        setScanStatus(`Thanh cong: ${res.data?.message || "Cham cong thanh cong"}`);

        await fetchData();

        if (res.data?.type === "checkin" || (attendanceRef.current.gioVao && !attendanceRef.current.gioRa)) {
          setAutoScan(false);
          setTimeout(() => setAutoScan(true), 60 * 1000);
        }
      } catch (err: any) {
        const rawMsg = String(err?.response?.data?.message || "");
        const msg = rawMsg.toLowerCase();
        setScanError(true);

        if (msg.includes("chưa đăng ký") || msg.includes("chua dang ky")) {
          setScanStatus("Ban chua dang ky Face ID. Dang chuyen sang trang dang ky...");
          setAutoScan(false);
          setTimeout(() => router.push("/employee/register" as any), 1200);
        } else if (msg.includes("không khớp") || msg.includes("khong khop") || msg.includes("unknown")) {
          setScanStatus("Khuon mat khong khop, vui long thu lai.");
        } else if (rawMsg) {
          setScanStatus(rawMsg);
        } else {
          setScanStatus("Khong tim thay khuon mat hop le.");
        }
      } finally {
        setIsProcessing(false);
      }
    };

    if (autoScan && camPermission?.granted && cameraReady) {
      intervalId = setInterval(scanFace, 3000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoScan, camPermission?.granted, cameraReady, user?.maNV, caLamViec?.maCa, fetchData, isProcessing]);

  const timeStr = now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  const dateStr = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0284c7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#f8fbff", "#eef9ff"]} style={styles.header}>
        <View>
          <Text style={styles.timeText}>{timeStr}</Text>
          <Text style={styles.dateText}>{dateStr}</Text>
        </View>
        <View style={styles.userInfoBox}>
          <View style={styles.companyBox}>
            <Briefcase size={16} color="#0e7490" />
            <Text style={styles.companyText}>IT-Global</Text>
          </View>
          <View style={styles.userNameBox}>
            <User size={13} color="#475569" />
            <Text style={styles.userName}>{user?.hoTen || "Nhan vien"}</Text>
          </View>
        </View>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.shiftHeader}>
            <View>
              <Text style={styles.shiftLabel}>Ca lam viec hien tai</Text>
              <Text style={styles.shiftName}>{caLamViec ? caLamViec.tenCa : "Khong co ca co dinh"}</Text>
            </View>
            <View style={styles.shiftTimeBadge}>
              <Text style={styles.shiftTimeText}>
                {caLamViec ? `${formatTime(caLamViec.gioBatDau)} - ${formatTime(caLamViec.gioKetThuc)}` : "--:--"}
              </Text>
            </View>
          </View>

          <View style={styles.cameraWrap}>
            <LinearGradient colors={["#0ea5e9", "#06b6d4", "#14b8a6"]} style={styles.cameraGradient}>
              <View style={styles.cameraInner}>
                {camPermission?.granted ? (
                  <>
                    <CameraView
                      ref={cameraRef}
                      style={styles.cameraView}
                      facing="front"
                      onCameraReady={() => setCameraReady(true)}
                    />
                    {!cameraReady ? (
                      <View style={styles.cameraMask}>
                        <Camera size={28} color="#ffffff" />
                        <Text style={styles.cameraMaskText}>Dang khoi dong camera...</Text>
                      </View>
                    ) : null}
                    <View style={styles.scanRing} />
                  </>
                ) : (
                  <View style={styles.cameraMask}>
                    <CameraOff size={30} color="#f87171" />
                    <Text style={styles.cameraMaskText}>Chua cap quyen camera</Text>
                    <TouchableOpacity style={styles.permissionButton} onPress={requestCamPermission}>
                      <Text style={styles.permissionButtonText}>Cap quyen</Text>
                    </TouchableOpacity>
                  </View>
                )}
                {isProcessing ? (
                  <View style={styles.processingOverlay}>
                    <ActivityIndicator size="small" color="#ffffff" />
                  </View>
                ) : null}
              </View>
            </LinearGradient>
          </View>

          <View style={styles.statusArea}>
            {isProcessing ? (
              <View style={styles.processingPill}>
                <ActivityIndicator size="small" color="#0369a1" />
                <Text style={styles.processingText}>Dang nhan dien...</Text>
              </View>
            ) : scanStatus ? (
              <View style={scanError ? styles.errorPill : styles.successPill}>
                {scanError ? <AlertCircle size={14} color="#dc2626" /> : null}
                <Text style={scanError ? styles.errorText : styles.successText}>{scanStatus}</Text>
              </View>
            ) : autoScan ? (
              <Text style={styles.autoScanText}>He thong dang tu dong quet...</Text>
            ) : (
              <TouchableOpacity
                style={styles.resumeButton}
                onPress={() => {
                  setScanStatus("");
                  setScanError(false);
                  setAutoScan(true);
                }}
              >
                <Play size={12} color="#ffffff" />
                <Text style={styles.resumeButtonText}>Tiep tuc quet</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.statusGrid}>
            <View style={styles.statusBoxIn}>
              <Text style={styles.statusLabelIn}>Gio vao</Text>
              <Text style={styles.statusTimeIn}>{formatTime(attendanceRecord?.gioVao)}</Text>
            </View>
            <View style={styles.statusBoxOut}>
              <Text style={styles.statusLabelOut}>Gio ra</Text>
              <Text style={styles.statusTimeOut}>{formatTime(attendanceRecord?.gioRa)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.historyHeader}>
            <History size={18} color="#0369a1" />
            <Text style={styles.historyTitle}>Hoat dong hom nay</Text>
          </View>
          <View style={styles.historyList}>
            {attendanceRecord?.gioVao ? (
              <>
                <View style={styles.historyItem}>
                  <View style={styles.dotIn} />
                  <Text style={styles.historyText}>
                    Check-in: <Text style={styles.historyTimeBold}>{formatTime(attendanceRecord.gioVao)}</Text>
                  </Text>
                </View>
                {attendanceRecord?.gioRa ? (
                  <View style={styles.historyItem}>
                    <View style={styles.dotOut} />
                    <Text style={styles.historyText}>
                      Check-out: <Text style={styles.historyTimeBold}>{formatTime(attendanceRecord.gioRa)}</Text>
                    </Text>
                  </View>
                ) : null}
              </>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Chua co du lieu hom nay</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      <View style={styles.chatFab}>
        <MessageCircle size={24} color="#ffffff" />
      </View>
    </View>
  );
}
