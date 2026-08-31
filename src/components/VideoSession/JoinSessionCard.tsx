import React from 'react';
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  Text,
  View,
  Pressable,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { CLASSROOM_BRAND } from '../../constants/webrtc';

type Props = {
  tutorName: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  avatarUrl?: string;
  verified?: boolean;
  loading?: boolean;
  error?: string | null;
  onJoin: () => void;
  onCancel?: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const JoinSessionCard = ({
  tutorName,
  subject,
  date,
  startTime,
  endTime,
  avatarUrl,
  verified = true,
  loading,
  error,
  onJoin,
  onCancel,
}: Props) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['rgba(0,102,255,0.18)', 'rgba(255,255,255,0.92)']}
        style={styles.hero}
      >
        {avatarUrl ? (
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        ) : (
          <View style={styles.avatarFallback}>
            <Text style={styles.letter}>{tutorName.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <View style={styles.titleBlock}>
          <View style={styles.nameRow}>
            <Text style={styles.name}>{tutorName}</Text>
            {verified ? (
              <MaterialCommunityIcons
                name="check-decagram"
                size={18}
                color={CLASSROOM_BRAND.primary}
              />
            ) : null}
          </View>
          <Text style={styles.subject}>{subject}</Text>
          <Text style={styles.classroomTag}>TutorLink Classroom</Text>
        </View>
      </LinearGradient>

      <View style={styles.metaGrid}>
        <Meta icon="calendar" label="Date" value={date} />
        <Meta icon="clock-outline" label="Starts" value={startTime} />
        <Meta icon="timer-outline" label="Ends" value={endTime} />
      </View>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <AnimatedPressable
        disabled={loading}
        onPress={onJoin}
        onPressIn={() => {
          scale.value = withSpring(0.97);
        }}
        onPressOut={() => {
          scale.value = withSpring(1);
        }}
        style={[styles.joinBtnWrap, animStyle]}
        android_ripple={{ color: 'rgba(255,255,255,0.25)' }}
      >
        <LinearGradient
          colors={[CLASSROOM_BRAND.primary, CLASSROOM_BRAND.primaryDeep]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinBtn}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <MaterialCommunityIcons name="video" size={20} color="#fff" />
              <Text style={styles.joinText}>Join Session</Text>
            </>
          )}
        </LinearGradient>
      </AnimatedPressable>

      {onCancel ? (
        <Pressable onPress={onCancel} style={styles.cancelBtn}>
          <Text style={styles.cancelText}>Not now</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const Meta = ({
  icon,
  label,
  value,
}: {
  icon: string;
  label: string;
  value: string;
}) => (
  <View style={styles.metaItem}>
    <MaterialCommunityIcons
      name={icon as never}
      size={16}
      color={CLASSROOM_BRAND.primary}
    />
    <Text style={styles.metaLabel}>{label}</Text>
    <Text style={styles.metaValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  card: {
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(0,102,255,0.14)',
    overflow: 'hidden',
    shadowColor: '#0066FF',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  hero: {
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#fff',
  },
  avatarFallback: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: CLASSROOM_BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  letter: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '800',
  },
  titleBlock: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  name: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
  },
  subject: {
    marginTop: 4,
    fontSize: 14,
    color: '#475569',
    fontWeight: '600',
  },
  classroomTag: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    color: CLASSROOM_BRAND.primary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  metaGrid: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    paddingBottom: 8,
    gap: 8,
  },
  metaItem: {
    flex: 1,
    backgroundColor: 'rgba(0,102,255,0.06)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'flex-start',
    gap: 4,
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  metaValue: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '700',
  },
  error: {
    marginHorizontal: 16,
    marginBottom: 8,
    color: CLASSROOM_BRAND.danger,
    fontSize: 13,
    fontWeight: '600',
  },
  joinBtnWrap: {
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 18,
    overflow: 'hidden',
  },
  joinBtn: {
    height: 54,
    borderRadius: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  cancelText: {
    color: '#64748B',
    fontWeight: '700',
  },
});

export default JoinSessionCard;
