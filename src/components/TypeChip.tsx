import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TYPE_INFO } from '../theme';

type Props = {
  type: string;
};

export default function TypeChip({ type }: Props) {
  const info = TYPE_INFO[type] ?? { label: type, color: '#64748b' };
  return (
    <View style={[styles.chip, { backgroundColor: info.color }]}>
      <Text style={styles.text}>{info.label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
  },
  text: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
});
