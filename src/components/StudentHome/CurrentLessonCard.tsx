import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../theme/glass';
import { DashboardLesson } from '../../types/api.types';

type Props = {
  lesson: DashboardLesson;
  onJoin: () => void;
  onPress?: () => void;
};

const CurrentLessonCard: React.FC<Props> = ({ lesson, onJoin, onPress }) => {
  const tutorName = lesson.tutor?.name || 'Your tutor';
  const avatar =
    lesson.tutor?.avatarUrl ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(
      tutorName
    )}&background=7548F5&color=fff`;
  const canJoin = lesson.canJoinRoom !== false;

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.92}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.row}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <View style={styles.meta}>
          <Text style={styles.name} numberOfLines={1}>
            {tutorName}
          </Text>
          <Text style={styles.subject} numberOfLines={1}>
            {lesson.subject || 'Lesson'}
          </Text>
          <View style={styles.timeRow}>
            <MaterialCommunityIcons
              name="clock-outline"
              size={14}
              color={GLASS.textMuted}
            />
            <Text style={styles.time}>
              {lesson.startTime}
              {lesson.endTime ? ` – ${lesson.endTime}` : ''}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onJoin}
        disabled={!canJoin}
        style={styles.joinWrap}
      >
        <LinearGradient
          colors={
            canJoin
              ? [...GLASS.buttonGradient]
              : ['#CBD5E1', '#94A3B8']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.joinBtn}
        >
          <MaterialCommunityIcons
            name="video-outline"
            size={18}
            color="#fff"
          />
          <Text style={styles.joinText}>
            {canJoin ? 'Join Room' : 'Not ready yet'}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: GLASS.radius.xxl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: GLASS.space.lg,
    ...GLASS.shadow.soft,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: GLASS.primarySoft,
  },
  meta: { flex: 1, minWidth: 0 },
  name: {
    color: GLASS.textPrimary,
    fontSize: 17,
    fontWeight: '800',
  },
  subject: {
    color: GLASS.textSecondary,
    fontSize: 14,
    marginTop: 2,
    fontWeight: '500',
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 8,
  },
  time: {
    color: GLASS.textMuted,
    fontSize: 13,
    fontWeight: '600',
  },
  joinWrap: { width: '100%' },
  joinBtn: {
    height: 48,
    borderRadius: GLASS.radius.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  joinText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
});

export default CurrentLessonCard;
