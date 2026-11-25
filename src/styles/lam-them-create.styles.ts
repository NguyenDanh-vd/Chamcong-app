import { StyleSheet, Platform } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  // Header
  header: {
    paddingTop: Platform.OS === 'ios' ? 50 : 40,
    paddingBottom: 15,
    paddingHorizontal: 20,
    backgroundColor: "white",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
  },
  backBtn: {
    padding: 5,
  },
  headerPlaceholder: {
    width: 24, // Để cân đối title ở giữa
  },

  // Body
  keyboardView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 50,
  },

  // Form Elements
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 8,
  },
  
  // Date Picker Input
  dateInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    height: 50,
  },
  dateText: {
    marginLeft: 10,
    fontSize: 16,
    color: "#1f2937",
  },
  
  // Readonly Input (Màu xám)
  readOnlyBg: {
    backgroundColor: '#e5e7eb',
  },
  readOnlyText: {
    fontWeight: 'bold',
  },

  // Grid Layout (Start Time / End Time)
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInputContainer: {
    flex: 1,
  },
  mr10: {
    marginRight: 10,
  },

  // Text Area
  textArea: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    height: 100,
    textAlignVertical: 'top', // Quan trọng cho Android để text nằm trên cùng
    fontSize: 16,
    color: "#1f2937",
  },
});