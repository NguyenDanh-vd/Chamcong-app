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
    width: 24,
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

  // Text Area
  textArea: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    height: 120, // Cao hơn xíu cho lý do nghỉ
    textAlignVertical: 'top',
    fontSize: 16,
    color: "#1f2937",
  },
  charCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 5,
  },

  // Button
  submitBtn: {
    backgroundColor: "#2563eb",
    borderRadius: 12,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#2563eb",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  submitText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});