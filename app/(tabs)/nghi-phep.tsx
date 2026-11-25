import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import api from "../../utils/api";
import { styles } from "../../src/styles/nghi-phep.styles";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

interface LeaveRequest {
  maDon?: number;
  maNP?: number;
  lyDo: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  trangThai: "cho-duyet" | "dang-cho" | "da-duyet" | "tu-choi";
}

export default function NghiPhepScreen() {
  const router = useRouter();

  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLeaves = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (!token) {
        router.replace("/auth/login");
        return;
      }

      const decoded: any = jwtDecode(token);
      const maNV = decoded?.maNV;
      if (!maNV) return;

      const res = await api.get(`/nghiphep/nhanvien/${maNV}`);
      setLeaves(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Loi tai danh sach nghi phep:", err);
      setLeaves([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    fetchLeaves();
  }, [fetchLeaves]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchLeaves();
  }, [fetchLeaves]);

  const pendingCount = useMemo(
    () => leaves.filter((x) => x.trangThai === "cho-duyet" || x.trangThai === "dang-cho").length,
    [leaves]
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={leaves}
        keyExtractor={(item, idx) => String(item.maDon ?? item.maNP ?? idx)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0284c7"]} />}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="beach" size={14} color="#0e7490" />
                <Text style={styles.heroBadgeText}>Quan ly nghi phep</Text>
              </View>

              <Text style={styles.heroTitle}>Don nghi phep cua toi</Text>
              <Text style={styles.heroDesc}>Theo doi trang thai duyet va gui yeu cau nghi phep moi nhanh chong.</Text>

              <TouchableOpacity style={styles.createButton} onPress={() => router.push("/employee/nghi-phep/create" as any)}>
                <Text style={styles.createButtonText}>+ Gui don moi</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.summaryRow}>
              <View style={styles.summaryCardBlue}>
                <Text style={styles.summaryLabel}>Tong don</Text>
                <Text style={styles.summaryValueBlue}>{leaves.length}</Text>
              </View>
              <View style={styles.summaryCardAmber}>
                <Text style={styles.summaryLabel}>Cho duyet</Text>
                <Text style={styles.summaryValueAmber}>{pendingCount}</Text>
              </View>
            </View>

            {!loading && leaves.length === 0 ? null : <View style={styles.sectionSpacer} />}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState message="Chua co don nghi phep nao" iconName="island" />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.reasonText} numberOfLines={2}>
                {item.lyDo || "Khong co ly do"}
              </Text>
              <StatusBadge status={item.trangThai || "dang-cho"} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.infoRow}>
              <View style={styles.infoChip}>
                <MaterialCommunityIcons name="calendar-start" size={14} color="#0284c7" />
                <Text style={styles.infoText}>Tu: {dayjs(item.ngayBatDau).format("DD/MM/YYYY")}</Text>
              </View>
              <View style={styles.infoChip}>
                <MaterialCommunityIcons name="calendar-end" size={14} color="#0891b2" />
                <Text style={styles.infoText}>Den: {dayjs(item.ngayKetThuc).format("DD/MM/YYYY")}</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
