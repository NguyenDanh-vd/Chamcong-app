import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

interface Props {
  message?: string;
  iconName?: keyof typeof MaterialCommunityIcons.glyphMap;
}

export default function EmptyState({ 
  message = "Không có dữ liệu", 
  iconName = "file-document-outline" 
}: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialCommunityIcons name={iconName} size={40} color="#9ca3af" />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  text: {
    color: '#6b7280',
    fontSize: 14,
    fontWeight: '500',
  },
});