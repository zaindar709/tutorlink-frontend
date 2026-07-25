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
  const avatarSize = resp.dx(88);
  const canEditAvatar = typeof onAvatarPress === 'function';
  const primary = String(colors.PRIMARY_COLOR || '#7548F5');

  const AvatarInner = (
    <>
      {loading ? (
        <ActivityIndicator color={primary} />
      ) : avatarUri ? (
        <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
      ) : (
        <MaterialCommunityIcons
          name="account-outline"
          size={resp.df(40)}
          color={primary}
        />
      )}
      {canEditAvatar ? (
        <View style={[styles.cameraBadge, { backgroundColor: primary }]}>
          <MaterialCommunityIcons name="camera-plus" size={14} color="#fff" />
        </View>
      ) : null}
    </>
  );

  return (
    <LinearGradient
      colors={[primary, '#5B2FD6', '#4C1D95']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: Math.max(insets.top, 12) + 12 }]}
    >
      <Text style={styles.screenTitle}>Profile</Text>

      <View style={styles.profileBox}>
        {canEditAvatar ? (
          <TouchableOpacity
            onPress={onAvatarPress}
            activeOpacity={0.85}
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
          </TouchableOpacity>
        ) : (
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
        )}

        <Text style={styles.name}>{name}</Text>
        <Text style={styles.grade}>{grade}</Text>

        <View style={styles.idCard}>
          <Text style={styles.idLabel}>Student ID</Text>
          <Text style={styles.idValue}>{publicId}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: 16,
    paddingBottom: 36,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  screenTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
  },
  profileBox: {
    alignItems: 'center',
  },
  avatarWrap: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  name: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  grade: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 13,
    marginTop: 4,
    marginBottom: 12,
  },
  idCard: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 14,
    alignItems: 'center',
  },
  idLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
  },
  idValue: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginTop: 2,
  },
});
