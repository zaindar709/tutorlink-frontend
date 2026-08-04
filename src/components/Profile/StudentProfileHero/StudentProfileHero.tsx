import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUi from '../../../hooks/ui/useUi';
import { GLASS } from '../../../theme/glass';

type Props = {
  name: string;
  grade: string;
  publicId: string;
  avatarUri?: string | null;
  loading?: boolean;
  onAvatarPress?: () => void;
};

export default function StudentProfileHero({
  name,
  grade,
  publicId,
  avatarUri,
  loading,
  onAvatarPress,
}: Props) {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const avatarSize = resp.dx(84);
  const canEditAvatar = typeof onAvatarPress === 'function';
  const primary = String(colors.PRIMARY_COLOR || GLASS.primary);

  const AvatarInner = (
    <>
      {loading ? (
        <ActivityIndicator color={primary} />
      ) : avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <MaterialCommunityIcons
          name="account-outline"
          size={resp.df(38)}
          color={primary}
        />
      )}
      {canEditAvatar ? (
        <View style={[styles.cameraBadge, { backgroundColor: primary }]}>
          <MaterialCommunityIcons name="camera-plus" size={13} color="#fff" />
        </View>
      ) : null}
    </>
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...GLASS.buttonGradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.hero, { paddingTop: Math.max(insets.top, 10) + 8 }]}
      >
        <View style={styles.identityRow}>
          {canEditAvatar ? (
            <TouchableOpacity
              onPress={onAvatarPress}
              activeOpacity={0.85}
              style={[
                styles.avatarRing,
                {
                  width: avatarSize + 8,
                  height: avatarSize + 8,
                  borderRadius: (avatarSize + 8) / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarWrap,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  },
                ]}
              >
                {AvatarInner}
              </View>
            </TouchableOpacity>
          ) : (
            <View
              style={[
                styles.avatarRing,
                {
                  width: avatarSize + 8,
                  height: avatarSize + 8,
                  borderRadius: (avatarSize + 8) / 2,
                },
              ]}
            >
              <View
                style={[
                  styles.avatarWrap,
                  {
                    width: avatarSize,
                    height: avatarSize,
                    borderRadius: avatarSize / 2,
                  },
                ]}
              >
                {AvatarInner}
              </View>
            </View>
          )}

          <View style={styles.meta}>
            <Text style={styles.name} numberOfLines={1}>
              {name}
            </Text>
            <View style={styles.gradeChip}>
              <MaterialCommunityIcons
                name="school-outline"
                size={14}
                color="#fff"
              />
              <Text style={styles.gradeText} numberOfLines={1}>
                {grade}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.idCard}>
          <View style={styles.idLeft}>
            <Text style={styles.idLabel}>Student ID</Text>
            <Text style={styles.idValue} numberOfLines={1}>
              {publicId}
            </Text>
          </View>
          <View style={styles.idBadge}>
            <MaterialCommunityIcons
              name="card-account-details-outline"
              size={18}
              color="#fff"
            />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    backgroundColor: 'transparent',
  },
  hero: {
    paddingHorizontal: 18,
    paddingBottom: 44,
    overflow: 'hidden',
    borderBottomLeftRadius: GLASS.radius.xxl,
    borderBottomRightRadius: GLASS.radius.xxl,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarRing: {
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarWrap: {
    backgroundColor: 'rgba(255,255,255,0.95)',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  meta: {
    flex: 1,
    minWidth: 0,
  },
  name: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gradeChip: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  gradeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    maxWidth: 180,
  },
  idCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: GLASS.radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.24)',
  },
  idLeft: {
    flex: 1,
    minWidth: 0,
  },
  idLabel: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  idValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
  idBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
