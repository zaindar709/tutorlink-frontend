import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUi from '../../hooks/ui/useUi';
import OnlineIndicator from './OnlineIndicator';
import VerifiedBadge from './VerifiedBadge';

type Props = {
  name: string;
  avatar: string;
  subject: string;
  isOnline?: boolean;
  isVerified?: boolean;
  isTyping?: boolean;
  lastSeen?: string;
  onBack: () => void;
  onVoiceCall?: () => void;
  onVideoCall?: () => void;
};

const ChatHeader = ({
  name,
  avatar,
  subject,
  isOnline,
  isVerified,
  isTyping,
  lastSeen,
  onBack,
  onVoiceCall,
  onVideoCall,
}: Props) => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();

  const subtitle = isTyping
    ? 'typing…'
    : isOnline
      ? 'Online'
      : lastSeen || 'Offline';

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingTop: insets.top + 8,
          backgroundColor: colors.CARD_COLOR as string,
          borderBottomColor: colors.BORDER_COLOR as string,
          shadowColor: colors.PRIMARY_COLOR as string,
        },
      ]}
    >
      <Pressable onPress={onBack} hitSlop={10} style={styles.back}>
        <MaterialCommunityIcons
          name="chevron-left"
          size={28}
          color={colors.TEXT_PRIMARY as string}
        />
      </Pressable>

      <View style={styles.avatarWrap}>
        <Image source={{ uri: avatar }} style={styles.avatar} />
        <OnlineIndicator online={!!isOnline} size={11} />
      </View>

      <View style={styles.meta}>
        <View style={styles.nameRow}>
          <Text
            numberOfLines={1}
            style={{
              color: colors.TEXT_PRIMARY as string,
              fontSize: resp.df(16),
              fontWeight: '700',
              maxWidth: resp.dx(150),
            }}
          >
            {name}
          </Text>
          <VerifiedBadge verified={!!isVerified} size={15} />
        </View>
        <Text
          style={{
            color: isTyping || isOnline
              ? (colors.PRIMARY_COLOR as string)
              : (colors.TEXT_SECONDARY as string),
            fontSize: resp.df(12),
            fontWeight: isTyping ? '600' : '500',
          }}
        >
          {subtitle}
        </Text>
        <View
          style={[
            styles.subject,
            { backgroundColor: colors.LIGHT_PRIMARY as string },
          ]}
        >
          <Text
            style={{
              color: colors.PRIMARY_COLOR as string,
              fontSize: 10,
              fontWeight: '700',
            }}
          >
            {subject}
          </Text>
        </View>
      </View>

      <Pressable onPress={onVoiceCall} style={styles.iconBtn}>
        <MaterialCommunityIcons
          name="phone-outline"
          size={22}
          color={colors.PRIMARY_COLOR as string}
        />
      </Pressable>
      <Pressable onPress={onVideoCall} style={styles.iconBtn}>
        <View
          style={[
            styles.videoBtn,
            { backgroundColor: colors.PRIMARY_COLOR as string },
          ]}
        >
          <MaterialCommunityIcons name="video-outline" size={18} color="#fff" />
        </View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  back: {
    padding: 4,
  },
  avatarWrap: {
    width: 42,
    height: 42,
    marginRight: 10,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
  },
  meta: {
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subject: {
    alignSelf: 'flex-start',
    marginTop: 3,
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 6,
  },
  iconBtn: {
    padding: 8,
  },
  videoBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
});

export default ChatHeader;
