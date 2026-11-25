import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, RefreshControl, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";
import dayjs from "dayjs";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import api from "../../utils/api";
import { styles } from "../../src/styles/lam-them.styles";
import EmptyState from "../../components/EmptyState";
import StatusBadge from "../../components/StatusBadge";

interface OvertimeRequest {
  maLT: number;
  soGio?: number;
  lyDo?: string;
  ngay?: string;
  trangThai?: "cho-duyet" | "da-duyet" | "tu-choi";
}

export default function LamThemScreen() {
  const router = useRouter();

  const [requests, setRequests] = useState<OvertimeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOvertime = useCallback(async () => {
    try {
      const res = await api.get("/lamthem/nhanvien");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Loi lay danh sach lam them:", err);
      setRequests([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchOvertime();
  }, [fetchOvertime]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOvertime();
  }, [fetchOvertime]);

  const stats = useMemo(() => {
    const total = requests.length;
    const choDuyet = requests.filter((r) => r.trangThai === "cho-duyet").length;
    const daDuyet = requests.filter((r) => r.trangThai === "da-duyet").length;
    const tongGio = requests.reduce((sum, r) => sum + (r.soGio ?? 0), 0);
    return { total, choDuyet, daDuyet, tongGio };
  }, [requests]);

  return (
    <View style={styles.container}>
      <FlatList
        data={requests}
        keyExtractor={(item) => String(item.maLT)}
        contentContainerStyle={styles.listContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#0284c7"]} />}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="trending-up" size={14} color="#0e7490" />
                <Text style={styles.heroBadgeText}>Quan ly lam them</Text>
              </View>

              <Text style={styles.heroTitle}>Don lam them cua toi</Text>
              <Text style={styles.heroDesc}>Theo doi tien do duyet don va tong thoi gian lam them.</Text>

              <TouchableOpacity style={styles.createButton} onPress={() => router.push("/employee/lam-them/create" as any)}>
                <Text style={styles.createButtonText}>+ Gui don moi</Text>
              </TouchableOpacity>
            </View>

            {!loading && requests.length > 0 ? (
              <View style={styles.statsGrid}>
                <View style={styles.statCardBlue}>
                  <Text style={styles.statLabel}>Tong don</Text>
                  <Text style={styles.statValueBlue}>{stats.total}</Text>
                </View>
                <View style={styles.statCardAmber}>
                  <Text style={styles.statLabel}>Cho duyet</Text>
                  <Text style={styles.statValueAmber}>{stats.choDuyet}</Text>
                </View>
                <View style={styles.statCardGreen}>
                  <Text style={styles.statLabel}>Da duyet</Text>
                  <Text style={styles.statValueGreen}>{stats.daDuyet}</Text>
                </View>
                <View style={styles.statCardCyan}>
                  <Text style={styles.statLabel}>Tong gio</Text>
                  <Text style={styles.statValueCyan}>{stats.tongGio}h</Text>
                </View>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyWrap}>
              <EmptyState message="Chua co don lam them nao" />
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.reasonText} numberOfLines={2}>
                {item.lyDo || "Khong co ly do"}
              </Text>
              <StatusBadge status={item.trangThai || "cho-duyet"} />
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.detailRow}>
              <View style={styles.detailChip}>
                <MaterialCommunityIcons name="calendar-month-outline" size={14} color="#0284c7" />
                <Text style={styles.detailText}>Ngay: {item.ngay ? dayjs(item.ngay).format("DD/MM/YYYY") : "--"}</Text>
              </View>
              <View style={styles.detailChip}>
                <MaterialCommunityIcons name="clock-time-four-outline" size={14} color="#0891b2" />
                <Text style={styles.detailText}>So gio: {item.soGio ?? 0} gio</Text>
              </View>
            </View>
          </View>
        )}
      />
    </View>
  );
}
