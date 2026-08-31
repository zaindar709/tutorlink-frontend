import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { CLASSROOM_BRAND, QUALITY_LABELS } from '../../constants/webrtc';
import type { ConnectionQuality } from '../../types/webrtc.types';

type Props = {
  quality: ConnectionQuality;
  callStateLabel?: string;
};

const DOT: Record<ConnectionQuality, string> = {
  excellent: CLASSROOM_BRAND.success,
  good: CLASSROOM_BRAND.warning,
  poor: CLASSROOM_BRAND.danger,
  unknown: '#94A3B8',
};

const ConnectionIndicator = ({ quality, callStateLabel }: Props) => {
  return (
    <View style={styles.wrap}>
      <View style={[styles.dot, { backgroundColor: DOT[quality] }]} />
      <View>
        <Text style={styles.quality}>{QUALITY_LABELS[quality]}</Text>
        {callStateLabel ? (
          <Text style={styles.state}>{callStateLabel}</Text>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(15,23,42,0.55)',
    borderWidth: 1,
    borderColor: CLASSROOM_BRAND.glassBorder,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  quality: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  state: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: 10,
    marginTop: 1,
  },
});

export default ConnectionIndicator;
