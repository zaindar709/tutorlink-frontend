import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-paper';
import Animated, { FadeInDown } from 'react-native-reanimated';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';
import { AiTutorRecommendation } from '../../types/aiRecommendation.types';
import Images from '../../assets/images';

type Props = {
  recommendation: AiTutorRecommendation | null;
  loading?: boolean;
  error?: string | null;
  interests?: string[];
  onViewProfile: () => void;
  onBookNow: () => void;
  onRefresh: () => void;
  onAnother: () => void;
};

export default function AiRecommendationCard({
  recommendation,
  loading,
  error,
  interests = [],
  onViewProfile,
  onBookNow,
  onRefresh,
  onAnother,
}: Props) {
  const { colors, resp } = useUi();
  const styles = useMemo(() => createStyles(colors, resp), [colors, resp]);

  if (loading && !recommendation) {
    return (
      <View style={styles.loadingCard}>
        <ActivityIndicator color={String(colors.PRIMARY_COLOR)} />
        <Text style={styles.loadingText}>
          Finding the best tutor for your interests…
        </Text>
      </View>
    );
  }

  // No match / quiet fail — robot handles messaging; hide broken error card.
  if (!recommendation) {
    if (error) {
      return (
        <View style={styles.quietError}>
          <Text style={styles.quietErrorText}>{error}</Text>
          <TouchableOpacity onPress={onRefresh}>
            <Text style={styles.retryLink}>Try again</Text>
          </TouchableOpacity>
        </View>
      );
    }
    return null;
  }

  const { tutor, explanation, matchedSubjects } = recommendation;
  const subjectLine =
    (matchedSubjects.length ? matchedSubjects : tutor.subjects)
      .slice(0, 3)
      .join(' · ') || 'General';

  return (
    <Animated.View entering={FadeInDown.duration(420)} style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.topRow}>
          <View style={styles.badge}>
            <Icon source="robot-outline" size={13} color="#fff" />
            <Text style={styles.badgeText}>AI Recommended</Text>
          </View>
          <View style={styles.actionsRow}>
            <TouchableOpacity onPress={onRefresh} style={styles.iconBtn}>
              <Icon source="refresh" size={18} color="#7548F5" />
            </TouchableOpacity>
            <TouchableOpacity onPress={onAnother} style={styles.iconBtn}>
              <Icon source="shuffle-variant" size={18} color="#7548F5" />
            </TouchableOpacity>
          </View>
        </View>

        {interests.length > 0 ? (
          <Text style={styles.interestHint}>
            For your interests:{' '}
            <Text style={styles.interestStrong}>
              {interests.slice(0, 3).join(', ')}
            </Text>
          </Text>
        ) : null}

        <View style={styles.tutorRow}>
          <Image
            source={
              tutor.avatarUrl ? { uri: tutor.avatarUrl } : Images.OneOnOne
            }
            style={styles.avatar}
          />
          <View style={styles.tutorMeta}>
            <View style={styles.nameRow}>
              <Text style={styles.name} numberOfLines={1}>
                {tutor.name}
              </Text>
              {tutor.isVerified ? (
                <Icon source="check-decagram" size={16} color="#7548F5" />
              ) : null}
            </View>
            <Text style={styles.subjects} numberOfLines={2}>
              {subjectLine}
            </Text>
            <Text style={styles.stats}>
              ★ {tutor.rating.toFixed(1)} · {tutor.experienceYears}y · PKR{' '}
              {tutor.hourlyRate.toLocaleString()}/hr
            </Text>
            <Text
              style={[
                styles.availability,
                tutor.available ? styles.availOn : styles.availOff,
              ]}
            >
              {tutor.available ? 'Available now' : 'Limited availability'}
            </Text>
          </View>
        </View>

        <View style={styles.explainBox}>
          <Text style={styles.explainText}>{explanation}</Text>
        </View>

        <View style={styles.ctaRow}>
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={onViewProfile}
            activeOpacity={0.85}
          >
            <Text style={styles.secondaryBtnText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={onBookNow}
            activeOpacity={0.85}
          >
            <Text style={styles.primaryBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={onAnother} style={styles.anotherLink}>
          <Text style={styles.anotherText}>Recommend another</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    wrap: { marginBottom: resp.dy(16), width: '100%' },
    card: {
      width: '100%',
      borderRadius: GLASS.radius.xl,
      padding: GLASS.space.md,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      backgroundColor: '#FFFFFF',
      ...GLASS.shadow.soft,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    badge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: GLASS.primary,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
    },
    badgeText: { color: '#fff', fontSize: 11, fontWeight: '800' },
    actionsRow: { flexDirection: 'row', gap: 6 },
    iconBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
    },
    interestHint: { color: GLASS.textSecondary, fontSize: 12, marginBottom: 10 },
    interestStrong: { color: GLASS.primaryDark, fontWeight: '700' },
    tutorRow: { flexDirection: 'row', gap: 12, marginBottom: 10 },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 18,
      backgroundColor: '#E2E8F0',
    },
    tutorMeta: { flex: 1, minWidth: 0 },
    nameRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
    name: {
      flexShrink: 1,
      fontSize: 16,
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },
    subjects: { color: '#64748B', fontSize: 12, marginTop: 2 },
    stats: {
      color: '#0F172A',
      fontSize: 12,
      fontWeight: '600',
      marginTop: 6,
    },
    availability: {
      marginTop: 6,
      fontSize: 11,
      fontWeight: '700',
      alignSelf: 'flex-start',
      overflow: 'hidden',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 999,
    },
    availOn: { color: '#166534', backgroundColor: '#DCFCE7' },
    availOff: { color: '#92400E', backgroundColor: '#FEF3C7' },
    explainBox: {
      backgroundColor: 'transparent',
      borderRadius: GLASS.radius.sm,
      padding: 10,
      borderWidth: 0,
      marginBottom: 12,
    },
    explainText: { color: GLASS.textSecondary, fontSize: 12.5, lineHeight: 18 },
    ctaRow: { flexDirection: 'row', gap: 10 },
    secondaryBtn: {
      flex: 1,
      height: 44,
      borderRadius: GLASS.radius.sm,
      backgroundColor: GLASS.primarySoft,
      borderWidth: 0,
      borderColor: GLASS.cardBorderStrong,
      alignItems: 'center',
      justifyContent: 'center',
    },
    secondaryBtnText: { color: GLASS.primaryDeep, fontWeight: '700', fontSize: 14 },
    primaryBtn: {
      flex: 1,
      height: 44,
      borderRadius: 12,
      backgroundColor: String(colors.PRIMARY_COLOR || '#7548F5'),
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
    anotherLink: { alignSelf: 'center', marginTop: 10 },
    anotherText: {
      color: colors.PRIMARY_COLOR,
      fontWeight: '700',
      fontSize: 13,
    },
    loadingCard: {
      borderRadius: GLASS.radius.lg,
      padding: 20,
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      marginBottom: 16,
      gap: 8,
      ...GLASS.shadow.soft,
    },
    loadingText: { color: GLASS.textSecondary, fontSize: 13, textAlign: 'center' },
    quietError: {
      marginBottom: 12,
      alignItems: 'center',
      gap: 6,
    },
    quietErrorText: {
      color: GLASS.textMuted,
      fontSize: 12,
      textAlign: 'center',
    },
    retryLink: { color: GLASS.primary, fontWeight: '700', fontSize: 13 },
  });
