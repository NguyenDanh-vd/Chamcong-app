import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  let config = { bg: '#f3f4f6', text: '#374151', label: 'Không rõ' };

  switch (status) {
    case 'cho-duyet':
    case 'dang-cho':
    case 'chua-xac-nhan':
      config = { bg: '#fef9c3', text: '#854d0e', label: 'Chờ duyệt' };
      break;
    case 'da-duyet':
      config = { bg: '#dcfce7', text: '#166534', label: 'Đã duyệt' };
      break;
    case 'hop-le':
      config = { bg: '#dcfce7', text: '#166534', label: 'Hợp lệ' };
      break;
    case 'da-checkout':
    case 'da-check-out':
      config = { bg: '#dcfce7', text: '#166534', label: 'Đã check-out' };
      break;
    case 'dang-lam-viec':
      config = { bg: '#e0f2fe', text: '#0369a1', label: 'Đang làm việc' };
      break;
    case 'tu-choi':
      config = { bg: '#fee2e2', text: '#991b1b', label: 'Từ chối' };
      break;
    case 'di-tre':
      config = { bg: '#fee2e2', text: '#991b1b', label: 'Đi trễ' };
      break;
    case 've-som':
      config = { bg: '#ffedd5', text: '#9a3412', label: 'Về sớm' };
      break;
    case 'tre-va-ve-som':
      config = { bg: '#fae8ff', text: '#86198f', label: 'Trễ & về sớm' };
      break;
  }

  return (
    <View style={[styles.badge, { backgroundColor: config.bg, borderColor: config.bg }]}>
      <Text style={[styles.text, { color: config.text }]}>{config.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: 'bold',
  },
});
