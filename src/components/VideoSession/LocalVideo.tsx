import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { RTCView, MediaStream } from 'react-native-webrtc';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { CLASSROOM_BRAND } from '../../constants/webrtc';

type Props = {
  stream: MediaStream | null;
  mutedVisual?: boolean;
  cameraOff?: boolean;
};

const PIP_W = 118;
const PIP_H = 168;

const LocalVideo = ({ stream, mutedVisual, cameraOff }: Props) => {
  const streamURL = stream
    ? (stream as unknown as { toURL: () => string }).toURL()
    : null;

  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);

  const pan = Gesture.Pan()
    .onBegin(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate(e => {
      translateX.value = startX.value + e.translationX;
      translateY.value = startY.value + e.translationY;
    });

  const animStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.pip, animStyle]}>
        {streamURL && !cameraOff ? (
          <RTCView
            streamURL={streamURL}
            style={styles.video}
            objectFit="cover"
            mirror
            zOrder={1}
          />
        ) : (
          <View style={styles.cameraOff}>
            <Text style={styles.cameraOffText}>Camera off</Text>
          </View>
        )}
        {mutedVisual ? (
          <View style={styles.micBadge}>
            <Text style={styles.micText}>Muted</Text>
          </View>
        ) : null}
        <View style={styles.youBadge}>
          <Text style={styles.youText}>You</Text>
        </View>
      </Animated.View>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  pip: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: PIP_W,
    height: PIP_H,
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.55)',
    backgroundColor: '#0B1220',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  video: {
    width: '100%',
    height: '100%',
  },
  cameraOff: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#111827',
  },
  cameraOffText: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  micBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(239,68,68,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  micText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  youBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: CLASSROOM_BRAND.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  youText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '800',
  },
});

export default LocalVideo;
