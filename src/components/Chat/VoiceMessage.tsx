import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import useUi from '../../hooks/ui/useUi';

type Props = {
  durationSec?: number;
  isMine?: boolean;
};

const BAR_COUNT = 18;

const VoiceMessage = ({ durationSec = 12, isMine = false }: Props) => {
  const { colors, resp } = useUi();
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const pulse = useSharedValue(1);

  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => 6 + ((i * 7) % 16)),
    []
  );

  const onToggle = () => {
    setPlaying(p => {
      const next = !p;
      if (next) {
        pulse.value = withRepeat(
          withSequence(
            withTiming(1.08, { duration: 400, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 400 })
          ),
          -1,
          false
        );
      } else {
        pulse.value = withTiming(1);
      }
      return next;
    });
  };

  const anim = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }],
  }));

  const accent = isMine
    ? (colors.WHITE_COLOR as string)
    : (colors.PRIMARY_COLOR as string);
  const track = isMine
    ? 'rgba(255,255,255,0.35)'
    : (colors.LIGHT_PRIMARY as string);

  const mins = Math.floor(durationSec / 60);
  const secs = `${durationSec % 60}`.padStart(2, '0');

  return (
    <Animated.View style={[styles.row, anim]}>
      <Pressable
        onPress={onToggle}
        style={[
          styles.playBtn,
          {
            backgroundColor: isMine
              ? 'rgba(255,255,255,0.2)'
              : (colors.LIGHT_PRIMARY as string),
          },
        ]}
      >
        <MaterialCommunityIcons
          name={playing ? 'pause' : 'play'}
          size={20}
          color={accent}
        />
      </Pressable>

      <View style={styles.waveWrap}>
        <View style={styles.wave}>
          {bars.map((h, i) => (
            <View
              key={i}
              style={{
                width: 3,
                height: playing ? h + (i % 3) : h,
                borderRadius: 2,
                backgroundColor: i < BAR_COUNT * 0.45 ? accent : track,
                opacity: playing && i % 2 === 0 ? 1 : 0.85,
              }}
            />
          ))}
        </View>
        <View style={styles.meta}>
          <Text style={{ color: accent, fontSize: resp.df(11), fontWeight: '600' }}>
            {mins}:{secs}
          </Text>
          <Pressable
            onPress={() => setSpeed(s => (s === 1 ? 1.5 : s === 1.5 ? 2 : 1))}
            style={[
              styles.speed,
              {
                backgroundColor: isMine
                  ? 'rgba(255,255,255,0.18)'
                  : (colors.LIGHT_PRIMARY as string),
              },
            ]}
          >
            <Text style={{ color: accent, fontSize: 10, fontWeight: '700' }}>
              {speed}x
            </Text>
          </Pressable>
        </View>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 180,
  },
  playBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveWrap: {
    flex: 1,
  },
  wave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    height: 28,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  speed: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
});

export default VoiceMessage;
