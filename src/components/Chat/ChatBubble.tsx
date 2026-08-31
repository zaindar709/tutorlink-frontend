import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeInUp, ZoomIn } from 'react-native-reanimated';
import { ChatMessage, SystemCardKind } from '../../constants/chatMockData';
import useUi from '../../hooks/ui/useUi';
import MessageStatusIcon from './MessageStatus';
import VoiceMessage from './VoiceMessage';
import { formatChatTime } from '../../utils/chat/formatters';

type Props = {
  message: ChatMessage;
  onLongPress?: () => void;
};

const systemMeta: Record<
  SystemCardKind,
  { icon: string; accent: string }
> = {
  homework_shared: { icon: 'book-education-outline', accent: '#8F73FD' },
  assignment_received: { icon: 'clipboard-check-outline', accent: '#5B4FF5' },
  session_reminder: { icon: 'bell-ring-outline', accent: '#F59E0B' },
  ai_summary: { icon: 'brain', accent: '#A855F7' },
  class_recording: { icon: 'video-outline', accent: '#22C55E' },
  booking_confirmed: { icon: 'calendar-check', accent: '#7548F5' },
};

const SystemCard = ({ message }: { message: ChatMessage }) => {
  const { colors, resp } = useUi();
  const kind = message.systemKind || 'booking_confirmed';
  const meta = systemMeta[kind];

  return (
    <Animated.View
      entering={FadeInUp.springify()}
      style={[
        styles.systemCard,
        {
          backgroundColor: colors.CARD_COLOR as string,
          borderColor: colors.CHAT_BUBBLE_IN_BORDER as string,
        },
      ]}
    >
      <View
        style={[
          styles.systemIcon,
          { backgroundColor: `${meta.accent}22` },
        ]}
      >
        <MaterialCommunityIcons
          name={meta.icon as any}
          size={20}
          color={meta.accent}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.TEXT_PRIMARY as string,
            fontWeight: '700',
            fontSize: resp.df(13),
          }}
        >
          {message.systemTitle || message.text}
        </Text>
        {message.systemSubtitle ? (
          <Text
            style={{
              color: colors.TEXT_SECONDARY as string,
              fontSize: resp.df(11),
              marginTop: 2,
            }}
          >
            {message.systemSubtitle}
          </Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

const SessionJoinCard = ({ message }: { message: ChatMessage }) => {
  const { colors, resp } = useUi();

  return (
    <Animated.View entering={ZoomIn.springify()} style={styles.sessionWrap}>
      <View
        style={[
          styles.sessionCard,
          { backgroundColor: colors.PRIMARY_COLOR as string },
        ]}
      >
        <View style={styles.sessionTop}>
          <MaterialCommunityIcons name="video-wireless" size={22} color="#fff" />
          <Text
            style={{
              color: '#fff',
              fontWeight: '800',
              fontSize: resp.df(14),
              marginLeft: 8,
              flex: 1,
            }}
          >
            {message.systemTitle || 'Tutor has started your session'}
          </Text>
        </View>
        <Text
          style={{
            color: 'rgba(255,255,255,0.85)',
            fontSize: resp.df(12),
            marginTop: 6,
          }}
        >
          {message.systemSubtitle || 'Join your live class now'}
        </Text>
        <Pressable style={styles.joinBtn}>
          <Text style={{ color: colors.PRIMARY_COLOR as string, fontWeight: '800' }}>
            Join Now
          </Text>
        </Pressable>
      </View>
    </Animated.View>
  );
};

const ChatBubble = ({ message, onLongPress }: Props) => {
  const { colors, resp } = useUi();

  if (message.type === 'system') {
    return <SystemCard message={message} />;
  }

  if (message.type === 'session') {
    return <SessionJoinCard message={message} />;
  }

  const mine = message.isMine;
  // WhatsApp-style: sent = brand purple, received = solid white
  const bubbleBg = mine
    ? (colors.CHAT_BUBBLE_OUT as string)
    : (colors.CHAT_BUBBLE_IN as string) || '#FFFFFF';
  const textColor = mine
    ? (colors.WHITE_COLOR as string)
    : ((colors.TEXT_PRIMARY as string) || '#111827');
  const muted = mine
    ? 'rgba(255,255,255,0.75)'
    : ((colors.TEXT_SECONDARY as string) || '#6B7280');

  return (
    <View
     
      style={[
        styles.row,
        {
          justifyContent: mine ? 'flex-end' : 'flex-start',
          marginBottom: message.reaction ? 14 : 4,
        },
      ]}
    >
      <Pressable
        onLongPress={onLongPress}
        delayLongPress={280}
        style={[
          styles.bubble,
          mine ? styles.bubbleOut : styles.bubbleIn,
          {
            backgroundColor: bubbleBg,
            borderColor: mine
              ? 'transparent'
              : ((colors.CHAT_BUBBLE_IN_BORDER as string) || '#E5E7EB'),
            borderBottomRightRadius: mine ? 6 : 18,
            borderBottomLeftRadius: mine ? 18 : 6,
          },
        ]}
      >
        {message.replyTo ? (
          <View
            style={[
              styles.reply,
              {
                backgroundColor: mine
                  ? 'rgba(255,255,255,0.15)'
                  : (colors.LIGHT_PRIMARY as string),
                borderLeftColor: mine
                  ? '#fff'
                  : (colors.PRIMARY_COLOR as string),
              },
            ]}
          >
            <Text
              style={{
                color: mine ? '#fff' : (colors.PRIMARY_COLOR as string),
                fontSize: 11,
                fontWeight: '700',
              }}
            >
              {message.replyTo.senderName}
            </Text>
            <Text numberOfLines={1} style={{ color: muted, fontSize: 11 }}>
              {message.replyTo.text}
            </Text>
          </View>
        ) : null}

        {message.type === 'voice' ? (
          <VoiceMessage durationSec={message.durationSec} isMine={mine} />
        ) : message.type === 'homework' ||
          message.type === 'pdf' ||
          message.type === 'document' ? (
          <View style={styles.fileRow}>
            <View
              style={[
                styles.fileIcon,
                {
                  backgroundColor: mine
                    ? 'rgba(255,255,255,0.18)'
                    : (colors.LIGHT_PRIMARY as string),
                },
              ]}
            >
              <MaterialCommunityIcons
                name="file-pdf-box"
                size={22}
                color={mine ? '#fff' : (colors.PRIMARY_COLOR as string)}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                numberOfLines={1}
                style={{ color: textColor, fontWeight: '700', fontSize: resp.df(13) }}
              >
                {message.fileName || message.text || 'Document'}
              </Text>
              <Text style={{ color: muted, fontSize: 11, marginTop: 2 }}>
                {message.fileSize || 'File'}
              </Text>
            </View>
          </View>
        ) : message.type === 'location' ? (
          <View style={styles.fileRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={22}
              color={mine ? '#fff' : (colors.PRIMARY_COLOR as string)}
            />
            <Text style={{ color: textColor, marginLeft: 8, fontWeight: '600' }}>
              {message.locationLabel || 'Shared location'}
            </Text>
          </View>
        ) : (
          <Text
            style={{
              color: textColor,
              fontSize: resp.df(14),
              lineHeight: 20,
            }}
          >
            {message.text}
          </Text>
        )}

        <View style={styles.footer}>
          {message.edited ? (
            <Text style={{ color: muted, fontSize: 10, marginRight: 4 }}>edited</Text>
          ) : null}
          <Text style={{ color: muted, fontSize: 10 }}>
            {formatChatTime(message.createdAt)}
          </Text>
          <MessageStatusIcon status={message.status} isMine={mine} />
        </View>

        {message.reaction ? (
          <View
            style={[
              styles.reaction,
              {
                backgroundColor: colors.CARD_COLOR as string,
                borderColor: colors.CHAT_BUBBLE_IN_BORDER as string,
                [mine ? 'right' : 'left']: 8,
              },
            ]}
          >
            <Text style={styles.reactionText}>{message.reaction}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginVertical: 4,
    overflow: 'visible',
  },
  bubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'visible',
  },
  bubbleOut: {
    borderWidth: 0,
  },
  bubbleIn: {
    borderWidth: StyleSheet.hairlineWidth,
    // Soft elevation so white received bubbles read clearly (WhatsApp-like)
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  reply: {
    borderLeftWidth: 3,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 6,
    gap: 3,
  },
  reaction: {
    position: 'absolute',
    bottom: -12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 6,
    paddingVertical: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  reactionText: {
    fontSize: 14,
  },
  fileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minWidth: 180,
  },
  fileIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  systemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 24,
    marginVertical: 8,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  systemIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sessionWrap: {
    marginHorizontal: 20,
    marginVertical: 10,
  },
  sessionCard: {
    borderRadius: 20,
    padding: 16,
    overflow: 'hidden',
  },
  sessionTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  joinBtn: {
    marginTop: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
});

export default ChatBubble;
