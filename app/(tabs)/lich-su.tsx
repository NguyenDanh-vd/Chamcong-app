import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { format } from "date-fns";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as XLSX from "xlsx";
import { Buffer } from "buffer";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import api from "../../utils/api";
import { styles } from "../../src/styles/lich-su.styles";
import StatusBadge from "../../components/StatusBadge";

interface ChamCong {
  gioVao: string;
  gioRa?: string;
  soGioLam?: number | null;
  trangThai: string;
  caLamViec?: { tenCa?: string };
  soPhutDiTre?: number;
  soPhutVeSom?: number;
}

const formatHours = (hours: number | null | undefined): string => {
  if (!hours || hours <= 0) return "-";
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h > 0) return m > 0 ? `${h}h ${m}p` : `${h}h`;
  return `${m}p`;
};

const formatDuration = (minutes: number | null | undefined): string => {
  if (!minutes || minutes <= 0) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h > 0) return `${h}h ${m}p`;
  return `${m}p`;
};

const statusOptions = [
  { key: "", label: "Tat ca" },
  { key: "hop-le", label: "Hop le" },
  { key: "di-tre", label: "Di tre" },
  { key: "ve-som", label: "Ve som" },
  { key: "tre-va-ve-som", label: "Tre + ve som" },
  { key: "dang-lam-viec", label: "Dang lam" },
  { key: "da-checkout", label: "Da checkout" },
];

export default function LichSuScreen() {
  const router = useRouter();

  const [records, setRecords] = useState<ChamCong[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState("all");
  const [monthSelect, setMonthSelect] = useState<number>(new Date().getMonth());
  const [statusFilter, setStatusFilter] = useState("");
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const query: Record<string, string> = {};
        const today = new Date();

        if (filter === "week") {
          const start = new Date(today);
          const day = start.getDay() || 7;
          start.setDate(start.getDate() - day + 1);
          start.setHours(0, 0, 0, 0);

          const end = new Date(start);
          end.setDate(start.getDate() + 6);
          end.setHours(23, 59, 59, 999);

          query.tuNgay = start.toISOString();
          query.denNgay = end.toISOString();
        } else if (filter === "month") {
          const start = new Date(today.getFullYear(), today.getMonth(), 1);
          const end = new Date(today.getFullYear(), today.getMonth() + 1, 0, 23, 59, 59);
          query.tuNgay = start.toISOString();
          query.denNgay = end.toISOString();
        } else if (filter === "month-select") {
          const year = today.getFullYear();
          const start = new Date(year, monthSelect, 1);
          const end = new Date(year, monthSelect + 1, 0, 23, 59, 59);
          query.tuNgay = start.toISOString();
          query.denNgay = end.toISOString();
        }

        if (statusFilter) {
          query.trangThai = statusFilter;
        }

        const res = await api.get("/chamcong/my-records", { params: query });
        setRecords(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Loi tai lich su cham cong:", err);
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, [filter, monthSelect, statusFilter]);

  const totals = useMemo(() => {
    return {
      hours: records.reduce((s, r) => s + (r.soGioLam ?? 0), 0),
      late: records.reduce((s, r) => s + (r.soPhutDiTre ?? 0), 0),
      early: records.reduce((s, r) => s + (r.soPhutVeSom ?? 0), 0),
    };
  }, [records]);

  const hasTodayRecord = useMemo(() => {
    const now = new Date();
    return records.some((r) => {
      const d = new Date(r.gioVao);
      return (
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate()
      );
    });
  }, [records]);

  const handleExportExcel = async () => {
    if (records.length === 0) return;

    try {
      if (!global.Buffer) {
        global.Buffer = Buffer;
      }

      const dataToExport = records.map((r, i) => ({
        STT: i + 1,
        Ngay: format(new Date(r.gioVao), "dd/MM/yyyy"),
        GioVao: format(new Date(r.gioVao), "HH:mm"),
        GioRa: r.gioRa ? format(new Date(r.gioRa), "HH:mm") : "--",
        SoGioLam: formatHours(r.soGioLam),
        Ca: r.caLamViec?.tenCa || "--",
        DiTre: formatDuration(r.soPhutDiTre),
        VeSom: formatDuration(r.soPhutVeSom),
        TrangThai: r.trangThai,
      }));

      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "ChamCong");
      const wbout = XLSX.write(wb, { type: "base64", bookType: "xlsx" });

      const dir = (FileSystem as any).cacheDirectory || (FileSystem as any).documentDirectory;
      if (!dir) throw new Error("Khong tim thay thu muc luu file");

      const fileUri = `${dir}lich_su_cham_cong_${Date.now()}.xlsx`;
      await (FileSystem as any).writeAsStringAsync(fileUri, wbout, { encoding: "base64" });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri, {
          mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          dialogTitle: "Xuat lich su cham cong",
          UTI: "com.microsoft.excel.xlsx",
        });
      }
    } catch (e) {
      console.error("Xuat excel that bai:", e);
    }
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={records}
        keyExtractor={(_, idx) => String(idx)}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            <View style={styles.heroCard}>
              <View style={styles.heroBadge}>
                <MaterialCommunityIcons name="history" size={14} color="#0369a1" />
                <Text style={styles.heroBadgeText}>Lich su cham cong</Text>
              </View>
              <Text style={styles.heroTitle}>Theo doi ban ghi cham cong cua ban</Text>
              <Text style={styles.heroDesc}>Loc theo thoi gian, trang thai va xuat Excel khi can.</Text>

              <TouchableOpacity
                style={[styles.exportButton, records.length === 0 && styles.exportButtonDisabled]}
                disabled={records.length === 0}
                onPress={handleExportExcel}
              >
                <MaterialCommunityIcons name="file-excel" size={16} color="#ffffff" />
                <Text style={styles.exportButtonText}>Xuat Excel</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statCardBlue}>
                <Text style={styles.statLabel}>Tong gio</Text>
                <Text style={styles.statValueBlue}>{formatHours(totals.hours)}</Text>
              </View>
              <View style={styles.statCardRed}>
                <Text style={styles.statLabel}>Di tre</Text>
                <Text style={styles.statValueRed}>{formatDuration(totals.late)}</Text>
              </View>
              <View style={styles.statCardOrange}>
                <Text style={styles.statLabel}>Ve som</Text>
                <Text style={styles.statValueOrange}>{formatDuration(totals.early)}</Text>
              </View>
            </View>

            {!loading && !hasTodayRecord ? (
              <View style={styles.warningBanner}>
                <Text style={styles.warningText}>Ban chua check-in hom nay.</Text>
                <TouchableOpacity style={styles.warningAction} onPress={() => router.push("/home")}> 
                  <Text style={styles.warningActionText}>Di den cham cong</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.filterWrap}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { key: "all", label: "Tat ca" },
                  { key: "week", label: "Tuan nay" },
                  { key: "month", label: "Thang nay" },
                  { key: "month-select", label: `Thang ${monthSelect + 1} v` },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[styles.chip, filter === item.key && styles.chipActive]}
                    onPress={() => {
                      if (item.key === "month-select") {
                        setFilter("month-select");
                        setShowMonthPicker(true);
                        return;
                      }
                      setFilter(item.key);
                    }}
                  >
                    <Text style={[styles.chipText, filter === item.key && styles.chipTextActive]}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusChipRow}>
                {statusOptions.map((item) => (
                  <TouchableOpacity
                    key={item.key || "all-status"}
                    style={[styles.statusChip, statusFilter === item.key && styles.statusChipActive]}
                    onPress={() => setStatusFilter(item.key)}
                  >
                    <Text style={[styles.statusChipText, statusFilter === item.key && styles.statusChipTextActive]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color="#0284c7" style={{ marginTop: 40 }} />
          ) : (
            <View style={styles.emptyState}>
              <MaterialCommunityIcons name="clipboard-text-clock-outline" size={44} color="#94a3b8" />
              <Text style={styles.emptyText}>Chua co du lieu cham cong</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.dateText}>{format(new Date(item.gioVao), "dd/MM/yyyy")}</Text>
              <StatusBadge status={item.trangThai || "hop-le"} />
            </View>

            <View style={styles.gridContainer}>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Gio vao</Text>
                <Text style={styles.gridValue}>{format(new Date(item.gioVao), "HH:mm")}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Gio ra</Text>
                <Text style={styles.gridValue}>{item.gioRa ? format(new Date(item.gioRa), "HH:mm") : "--:--"}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>So gio</Text>
                <Text style={styles.gridValue}>{formatHours(item.soGioLam)}</Text>
              </View>
              <View style={styles.gridItem}>
                <Text style={styles.gridLabel}>Ca lam</Text>
                <Text style={styles.gridValue}>{item.caLamViec?.tenCa || "--"}</Text>
              </View>
            </View>

            {(item.soPhutDiTre ?? 0) > 0 ? (
              <View style={[styles.warningBox, styles.warningBoxRed]}>
                <Text style={styles.warningBoxRedText}>Di tre: {formatDuration(item.soPhutDiTre)}</Text>
              </View>
            ) : null}

            {(item.soPhutVeSom ?? 0) > 0 ? (
              <View style={[styles.warningBox, styles.warningBoxOrange]}>
                <Text style={styles.warningBoxOrangeText}>Ve som: {formatDuration(item.soPhutVeSom)}</Text>
              </View>
            ) : null}
          </View>
        )}
      />

      <Modal transparent visible={showMonthPicker} animationType="fade">
        <View style={styles.monthModalOverlay}>
          <View style={styles.monthModalCard}>
            <Text style={styles.monthModalTitle}>Chon thang</Text>
            <View style={styles.monthGrid}>
              {Array.from({ length: 12 }, (_, i) => (
                <TouchableOpacity
                  key={i}
                  style={[styles.monthCell, monthSelect === i && styles.monthCellActive]}
                  onPress={() => {
                    setMonthSelect(i);
                    setShowMonthPicker(false);
                  }}
                >
                  <Text style={[styles.monthCellText, monthSelect === i && styles.monthCellTextActive]}>Thang {i + 1}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.monthCloseButton} onPress={() => setShowMonthPicker(false)}>
              <Text style={styles.monthCloseText}>Dong</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
