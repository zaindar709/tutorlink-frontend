import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ChatConversation } from '../../constants/chatMockData';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';
import OnlineIndicator from './OnlineIndicator';
import VerifiedBadge from './VerifiedBadge';
import MessageStatusIcon from './MessageStatus';
import { formatListTime } from '../../utils/chat/formatters';

type Props = {
  item: ChatConversation;
  index: number;
  onPress: () => void;
  onArchive?: () => void;
  onPin?: () => void;
  showDivider?: boolean;
};

const ChatCard = ({
  item,
  onPress,
  onArchive,
  onPin,
  showDivider = true,
}: Props) => {
  const { resp } = useUi();
  const hasUnread = item.unreadCount > 0;

  const renderRight = () => (
    <View style={styles.actions}>
      <RectButton style={[styles.actionBtn, styles.pinBtn]} onPress={onPin}>
        <MaterialCommunityIcons name="pin" size={20} color="#fff" />
      </RectButton>
      <RectButton style={[styles.actionBtn, styles.archiveBtn]} onPress={onArchive}>
        <MaterialCommunityIcons name="archive-outline" size={20} color="#fff" />
      </RectButton>
    </View>
  );

  return (
    <Swipeable renderRightActions={renderRight} overshootRight={false}>
      <Pressable
        onPress={onPress}
        android_ripple={{ color: 'rgba(117,72,245,0.08)' }}
        style={({ pressed }) => [styles.wrap, pressed && styles.wrapPressed]}
      >
        <View style={styles.row}>
          <View style={styles.avatarWrap}>
            <Image
              source={{ uri: item.participant.avatar }}
              style={styles.avatar}
            />
            <OnlineIndicator online={!!item.participant.isOnline} size={11} />
          </View>

          <View style={styles.content}>
            <View style={styles.topRow}>
              <View style={styles.nameRow}>
                {item.pinned ? (
                  <MaterialCommunityIcons
                    name="pin"
                    size={12}
                    color={GLASS.primary}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.name,
                    {
                      fontSize: resp.df(16),
                      fontWeight: hasUnread ? '700' : '600',
                    },
                  ]}
                >
                  {item.participant.name}
                </Text>
                <VerifiedBadge
                  verified={!!item.participant.isVerified}
                  size={14}
                />
              </View>
              <Text
                style={[
                  styles.time,
                  {
                    fontSize: resp.df(12),
                    color: hasUnread ? GLASS.primary : GLASS.textMuted,
                    fontWeight: hasUnread ? '600' : '400',
                  },
                ]}
              >
                {formatListTime(item.lastMessageAt)}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              {item.isTyping ? (
                <Text
                  numberOfLines={1}
                  style={[styles.typing, { fontSize: resp.df(13) }]}
                >
                  Typing...
                </Text>
              ) : (
                <Text
                  numberOfLines={1}
                  style={[
                    styles.preview,
                    {
                      fontSize: resp.df(13),
                      color: hasUnread ? GLASS.primary : GLASS.textSecondary,
                      fontWeight: hasUnread ? '500' : '400',
                    },
                  ]}
                >
                  {item.lastMessage}
                </Text>
              )}

              <View style={styles.trailing}>
                {hasUnread ? (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {item.unreadCount > 9 ? '9+' : item.unreadCount}
                    </Text>
                  </View>
                ) : item.lastStatus ? (
                  <MessageStatusIcon status={item.lastStatus} isMine />
                ) : null}
              </View>
            </View>
          </View>
        </View>

        {showDivider ? <View style={styles.divider} /> : null}
      </Pressable>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: 'transparent',
  },
  wrapPressed: {
    backgroundColor: 'rgba(117, 72, 245, 0.04)',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 12,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: GLASS.primarySoft,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
    minWidth: 0,
  },
  name: {
    color: GLASS.textPrimary,
    flexShrink: 1,
  },
  time: {
    flexShrink: 0,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 20,
  },
  preview: {
    flex: 1,
    marginRight: 10,
  },
  typing: {
    flex: 1,
    marginRight: 10,
    color: GLASS.primary,
    fontStyle: 'italic',
    fontWeight: '500',
  },
  trailing: {
    minWidth: 22,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
    backgroundColor: GLASS.primary,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148, 163, 184, 0.45)',
    width: '100%',
  },
  actions: {
    flexDirection: 'row',
  },
  actionBtn: {
    width: 64,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinBtn: {
    backgroundColor: GLASS.primary,
  },
  archiveBtn: {
    backgroundColor: '#64748B',
  },
});

export default ChatCard;
