import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { CLASSROOM_BRAND } from '../../constants/webrtc';
import { formatSessionTimer } from '../../utils/webrtc/permissions';

type Props = {
  seconds: number;
  active?: boolean;
};

const SessionTimer = ({ seconds, active = true }: Props) => {
  return (
    <View style={[styles.wrap, !active && styles.inactive]}>
      <View style={[styles.liveDot, active && styles.liveDotOn]} />
      <Text style={styles.time}>{formatSessionTimer(seconds)}</Text>
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
  inactive: {
    opacity: 0.7,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  liveDotOn: {
    backgroundColor: CLASSROOM_BRAND.success,
  },
  time: {
    color: '#fff',
    fontVariant: ['tabular-nums'],
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});

export default SessionTimer;
