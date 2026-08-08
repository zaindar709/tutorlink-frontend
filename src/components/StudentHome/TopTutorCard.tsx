import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

type TopTutorCardProps = {
  image: any;
  name: string;
  subject: string;
  rating: number;
  badge: string;
  verified?: boolean;
  university?: string;
  onHire: () => void;
  ctaLabel?: string;
  ctaDisabled?: boolean;
};

const TopTutorCard: React.FC<TopTutorCardProps> = ({
  image,
  name,
  subject,
  rating,
  badge,
  verified = false,
  university,
  onHire,
  ctaLabel = 'Hire Tutor',
  ctaDisabled = false,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  const detailLine = university || badge;
  const primarySubject = subject.split(',')[0]?.trim() || subject;

  return (
    <View style={styles.card}>
      <LinearGradient
        colors={['#EDE9FE', '#F5F3FF', '#EEF2FF']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.avatarHeader}
      >
        <View style={styles.orbA} pointerEvents="none" />
        <View style={styles.orbB} pointerEvents="none" />

        <View style={styles.ratingPill}>
          <MaterialCommunityIcons name="star" size={resp.df(11)} color="#F59E0B" />
          <Text style={styles.ratingPillText}>{rating.toFixed(1)}</Text>
        </View>

        <View style={styles.avatarRing}>
          <Image source={image} style={styles.avatar} resizeMode="cover" />
        </View>
      </LinearGradient>

      <View style={styles.infoSection}>
        <View style={styles.nameRow}>
          <Text style={styles.tutorName} numberOfLines={1}>
            {name}
          </Text>
          {verified ? (
            <MaterialCommunityIcons
              name="check-decagram"
              size={resp.df(14)}
              color={GLASS.primary}
            />
          ) : null}
        </View>

        <View style={styles.subjectChip}>
          <MaterialCommunityIcons
            name="book-open-page-variant-outline"
            size={resp.df(11)}
            color={GLASS.primary}
          />
          <Text style={styles.subjectChipText} numberOfLines={1}>
            {primarySubject}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <MaterialCommunityIcons
            name="school-outline"
            size={resp.df(12)}
            color="#94A3B8"
          />
          <Text style={styles.metaText} numberOfLines={1}>
            {detailLine}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        onPress={onHire}
        activeOpacity={0.88}
        disabled={ctaDisabled}
      >
        {ctaDisabled ? (
          <View style={[styles.hireBtn, styles.hireBtnDisabled]}>
            <Text style={styles.hireBtnDisabledText} numberOfLines={1}>
              {ctaLabel}
            </Text>
          </View>
        ) : (
          <LinearGradient
            colors={[...GLASS.buttonGradient]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.hireBtn}
          >
            <Text style={styles.hireBtnText} numberOfLines={1}>
              {ctaLabel}
            </Text>
            <MaterialCommunityIcons
              name="arrow-right"
              size={resp.df(13)}
              color="#FFFFFF"
            />
          </LinearGradient>
        )}
      </TouchableOpacity>
    </View>
  );
};

export default TopTutorCard;

const createStyles = (_colors: any, resp: any) =>
  StyleSheet.create({
    card: {
      width: resp.dx(158),
      backgroundColor: '#FFFFFF',
      borderRadius: resp.dx(20),
      borderWidth: 1,
      borderColor: 'rgba(117, 72, 245, 0.1)',
      padding: resp.dx(8),
      paddingBottom: resp.dx(10),
      marginRight: resp.dx(12),
      shadowColor: '#7548F5',
      shadowOpacity: 0.12,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
    },
    avatarHeader: {
      width: '100%',
      borderRadius: resp.dx(14),
      paddingTop: resp.dy(12),
      paddingBottom: resp.dy(18),
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: resp.dy(8),
      overflow: 'hidden',
      minHeight: resp.dy(96),
    },
    orbA: {
      position: 'absolute',
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: 'rgba(117, 72, 245, 0.12)',
      top: -12,
      right: -10,
    },
    orbB: {
      position: 'absolute',
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(91, 47, 214, 0.08)',
      bottom: -8,
      left: -6,
    },
    ratingPill: {
      position: 'absolute',
      top: 8,
      right: 8,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: 'rgba(255,255,255,0.95)',
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 999,
      borderWidth: 1,
      borderColor: 'rgba(245, 158, 11, 0.25)',
      zIndex: 2,
    },
    ratingPillText: {
      color: '#0F172A',
      fontSize: resp.df(10),
      fontWeight: '800',
    },
    avatarRing: {
      width: resp.dx(72),
      height: resp.dx(72),
      borderRadius: resp.dx(36),
      padding: 3,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#7548F5',
      shadowOpacity: 0.16,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 3 },
      elevation: 3,
    },
    avatar: {
      width: '100%',
      height: '100%',
      borderRadius: resp.dx(33),
      backgroundColor: '#EDE9FE',
    },
    infoSection: {
      marginBottom: resp.dy(10),
      paddingHorizontal: resp.dx(4),
    },
    nameRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(4),
      marginBottom: resp.dy(7),
    },
    tutorName: {
      flexShrink: 1,
      color: '#0F172A',
      fontSize: resp.df(13),
      fontWeight: '800',
      letterSpacing: 0.1,
    },
    subjectChip: {
      alignSelf: 'flex-start',
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: GLASS.primarySoft,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      marginBottom: resp.dy(6),
      maxWidth: '100%',
    },
    subjectChipText: {
      color: GLASS.primaryDeep,
      fontSize: resp.df(10),
      fontWeight: '700',
      maxWidth: resp.dx(100),
    },
    metaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(5),
    },
    metaText: {
      flex: 1,
      color: '#94A3B8',
      fontSize: resp.df(10),
      fontWeight: '500',
    },
    hireBtn: {
      alignSelf: 'stretch',
      height: resp.dy(34),
      borderRadius: resp.dx(11),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
    },
    hireBtnText: {
      color: '#FFFFFF',
      fontSize: resp.df(12),
      fontWeight: '700',
      letterSpacing: 0.2,
    },
    hireBtnDisabled: {
      backgroundColor: 'rgba(148, 163, 184, 0.22)',
    },
    hireBtnDisabledText: {
      color: '#64748B',
      fontSize: resp.df(11),
      fontWeight: '700',
      paddingHorizontal: 4,
    },
  });
