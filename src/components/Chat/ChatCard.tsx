import React from 'react';
import { View, Text, StyleSheet, Image, Pressable } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import Swipeable from 'react-native-gesture-handler/Swipeable';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ChatConversation } from '../../constants/chatMockData';
import useUi from '../../hooks/ui/useUi';
import OnlineIndicator from './OnlineIndicator';
import VerifiedBadge from './VerifiedBadge';
import TypingIndicator from './TypingIndicator';
import MessageStatusIcon from './MessageStatus';
import { formatListTime } from '../../utils/chat/formatters';

type Props = {
  item: ChatConversation;
  index: number;
  onPress: () => void;
  onArchive?: () => void;
  onPin?: () => void;
};

const ChatCard = ({ item, index, onPress, onArchive, onPin }: Props) => {
  const { colors, resp } = useUi();

  const renderRight = () => (
    <View style={styles.actions}>
      <RectButton
        style={[styles.actionBtn, { backgroundColor: colors.PRIMARY_COLOR as string }]}
        onPress={onPin}
      >
        <MaterialCommunityIcons name="pin" size={20} color="#fff" />
        <Text style={styles.actionText}>Pin</Text>
      </RectButton>
      <RectButton
        style={[styles.actionBtn, { backgroundColor: '#64748B' }]}
        onPress={onArchive}
      >
        <MaterialCommunityIcons name="archive-outline" size={20} color="#fff" />
        <Text style={styles.actionText}>Archive</Text>
      </RectButton>
    </View>
  );

  return (
    <Animated.View entering={FadeInDown.delay(index * 50).springify()}>
      <Swipeable renderRightActions={renderRight} overshootRight={false}>
        <Pressable
          onPress={onPress}
          style={[
            styles.card,
            {
              backgroundColor: colors.CARD_COLOR as string,
              borderColor: item.pinned
                ? (colors.PRIMARY_LIGHT as string)
                : (colors.BORDER_COLOR as string),
            },
          ]}
        >
          <View style={styles.avatarWrap}>
            <Image source={{ uri: item.participant.avatar }} style={styles.avatar} />
            <OnlineIndicator online={!!item.participant.isOnline} size={12} />
          </View>

          <View style={styles.body}>
            <View style={styles.topRow}>
              <View style={styles.nameRow}>
                {item.pinned ? (
                  <MaterialCommunityIcons
                    name="pin"
                    size={13}
                    color={colors.PRIMARY_COLOR as string}
                    style={{ marginRight: 4 }}
                  />
                ) : null}
                <Text
                  numberOfLines={1}
                  style={{
                    color: colors.TEXT_PRIMARY as string,
                    fontSize: resp.df(15),
                    fontWeight: '700',
                    maxWidth: resp.dx(160),
                  }}
                >
                  {item.participant.name}
                </Text>
                <VerifiedBadge verified={!!item.participant.isVerified} size={15} />
              </View>
              <Text
                style={{
                  color: item.unreadCount
                    ? (colors.PRIMARY_COLOR as string)
                    : (colors.TEXT_SECONDARY as string),
                  fontSize: resp.df(11),
                  fontWeight: item.unreadCount ? '700' : '500',
                }}
              >
                {formatListTime(item.lastMessageAt)}
              </Text>
            </View>

            <View
              style={[
                styles.subjectPill,
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
                {item.subject}
              </Text>
            </View>

            <View style={styles.bottomRow}>
              {item.isTyping ? (
                <View style={styles.previewRow}>
                  <TypingIndicator compact />
                  <Text
                    style={{
                      color: colors.PRIMARY_COLOR as string,
                      fontSize: resp.df(12),
                      marginLeft: 6,
                      fontWeight: '600',
                    }}
                  >
                    typing…
                  </Text>
                </View>
              ) : (
                <View style={styles.previewRow}>
                  {item.lastStatus && item.unreadCount === 0 ? (
                    <MessageStatusIcon
                      status={item.lastStatus}
                      isMine
                    />
                  ) : null}
                  <Text
                    numberOfLines={1}
                    style={{
                      color: colors.TEXT_SECONDARY as string,
                      fontSize: resp.df(13),
                      flex: 1,
                      marginLeft: 4,
                    }}
                  >
                    {item.lastMessage}
                  </Text>
                </View>
              )}

              {item.unreadCount > 0 ? (
                <View
                  style={[
                    styles.badge,
                    { backgroundColor: colors.CHAT_UNREAD_BADGE as string },
                  ]}
                >
                  <Text style={styles.badgeText}>
                    {item.unreadCount > 9 ? '9+' : item.unreadCount}
                  </Text>
                </View>
              ) : null}
            </View>
          </View>
        </Pressable>
      </Swipeable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 18,
    borderWidth: 1,
  },
  avatarWrap: {
    width: 52,
    height: 52,
    marginRight: 12,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
  },
  body: {
    flex: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  subjectPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 4,
    marginBottom: 6,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  badge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  actions: {
    flexDirection: 'row',
    marginBottom: 10,
    marginRight: 16,
  },
  actionBtn: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginLeft: 8,
  },
  actionText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
});

export default ChatCard;
