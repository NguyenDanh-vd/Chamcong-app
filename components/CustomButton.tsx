import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet, TouchableOpacityProps } from 'react-native';

interface Props extends TouchableOpacityProps {
  title: string;
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'outline';
}

export default function CustomButton({ 
  title, 
  isLoading = false, 
  variant = 'primary', 
  style, 
  disabled,
  ...props 
}: Props) {
  
  // Chọn màu nền dựa trên variant
  let bgStyle = styles.primary;
  let textStyle = styles.textWhite;

  switch (variant) {
    case 'secondary':
      bgStyle = styles.secondary;
      textStyle = styles.textGray;
      break;
    case 'danger':
      bgStyle = styles.danger;
      textStyle = styles.textWhite;
      break;
    case 'outline':
      bgStyle = styles.outline;
      textStyle = styles.textPrimary;
      break;
  }

  return (
    <TouchableOpacity
      style={[
        styles.base, 
        bgStyle, 
        (disabled || isLoading) && styles.disabled, 
        style
      ]}
      disabled={disabled || isLoading}
      activeOpacity={0.8}
      {...props}
    >
      {isLoading ? (
        <ActivityIndicator color={variant === 'outline' ? '#2563eb' : 'white'} />
      ) : (
        <Text style={[styles.textBase, textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  textBase: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabled: {
    opacity: 0.6,
  },
  // Variants
  primary: { backgroundColor: '#2563eb' },
  secondary: { backgroundColor: '#e5e7eb' },
  danger: { backgroundColor: '#ef4444' },
  outline: { 
    backgroundColor: 'transparent', 
    borderWidth: 1, 
    borderColor: '#2563eb', 
    elevation: 0 
  },
  // Text Colors
  textWhite: { color: 'white' },
  textGray: { color: '#374151' },
  textPrimary: { color: '#2563eb' },
});
