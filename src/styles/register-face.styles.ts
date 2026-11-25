import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  
  // Title
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 30,
    paddingHorizontal: 20,
  },

  // Camera Box
  cameraContainer: {
    width: width * 0.8,
    height: width * 0.8, // Vuông
    borderRadius: width * 0.4, // Tròn
    overflow: 'hidden',
    borderWidth: 5,
    borderColor: '#e5e7eb',
    marginBottom: 30,
    position: 'relative',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  
  // Scan Effect (Vòng tròn quét)
  scanLine: {
    width: '100%',
    height: 4,
    backgroundColor: '#3b82f6',
    position: 'absolute',
    opacity: 0.7,
  },

  // Buttons
  btnContainer: {
    width: '100%',
    gap: 15,
  },
  captureBtn: {
    backgroundColor: '#2563eb',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  btnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelBtn: {
    backgroundColor: '#f3f4f6',
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
  },
  cancelText: {
    color: '#4b5563',
    fontSize: 16,
    fontWeight: '600',
  },

  // Initial State (Chưa bật camera)
  placeholder: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  startBtn: {
    backgroundColor: '#10b981', // Emerald
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginTop: 20,
  },
});