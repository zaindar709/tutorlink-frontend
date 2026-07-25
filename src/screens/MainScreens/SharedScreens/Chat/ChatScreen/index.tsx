import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  Dimensions,
  ActivityIndicator,
  Text,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { launchCamera, launchImageLibrary } from 'react-native-image-picker';
import { pick, types as DocumentTypes } from '@react-native-documents/picker';
import { useSelector } from 'react-redux';
import useUi from '../../../../../hooks/ui/useUi';
import {
  AttachmentSheet,
  ChatBubble,
  ChatHeader,
  DateDivider,
  EncryptionBanner,
  MessageActions,
  MessageInput,
  TypingIndicator,
  UnreadDivider,
} from '../../../../../components/Chat';
import {
  ChatConversation,
  ChatMessage,
} from '../../../../../types/chat.types';
import {
  getDateDividerLabel,
  sameDay,
} from '../../../../../utils/chat/formatters';
import { useChatMessages } from '../../../../../hooks/api/useChatMessages';
import { createConversation } from '../../../../../services/chat/chatService';
import { isInquiryConversationId } from '../../../../../services/chat/localInquiryChat';
import { ApiUser } from '../../../../../types/api.types';

type ListItem =
  | { kind: 'date'; id: string; label: string }
  | { kind: 'unread'; id: string }
  | { kind: 'message'; id: string; message: ChatMessage };

const fallbackAvatar = 'https://i.pravatar.cc/150?u=chat';

const ChatScreen = () => {
  const { colors } = useUi();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const listRef = useRef<FlatList>(null);
  const authUser = useSelector(
    (state: any) => state.auth.user as ApiUser | null
  );

  const chatId = route.params?.chatId as string | undefined;
  const bookingId = route.params?.bookingId as string | undefined;
  const participantId = route.params?.participantId as string | undefined;
  const peerName = route.params?.peerName as string | undefined;
  const peerAvatar = route.params?.peerAvatar as string | undefined;
  const peerId = route.params?.peerId as string | undefined;
  const subjectParam = route.params?.subject as string | undefined;
  const isOnlineParam = route.params?.isOnline as boolean | undefined;
  const isVerifiedParam = route.params?.isVerified as boolean | undefined;
  const lastSeenParam = route.params?.lastSeen as string | undefined;

  const [resolvedChatId, setResolvedChatId] = useState(chatId || '');
  const [resolving, setResolving] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [conversation, setConversation] = useState<ChatConversation | null>(
    () => {
      if (!chatId && !peerName) return null;
      return {
        id: chatId || '',
        participant: {
          id: peerId || '',
          name: peerName || 'Chat',
          avatar: peerAvatar || fallbackAvatar,
          role: 'tutor',
          isOnline: isOnlineParam,
          isVerified: isVerifiedParam,
          lastSeen: lastSeenParam,
        },
        lastMessage: '',
        lastMessageAt: new Date().toISOString(),
        unreadCount: 0,
        subject: subjectParam || 'General',
        bookingId,
      };
    }
  );

  useEffect(() => {
    if (chatId) {
      setResolvedChatId(chatId);
      setConversation(prev => ({
        id: chatId,
        participant: {
          id: peerId || prev?.participant.id || '',
          name: peerName || prev?.participant.name || 'Chat',
          avatar: peerAvatar || prev?.participant.avatar || fallbackAvatar,
          role: prev?.participant.role || 'tutor',
          isOnline: isOnlineParam ?? prev?.participant.isOnline,
          isVerified: isVerifiedParam ?? prev?.participant.isVerified,
          lastSeen: lastSeenParam || prev?.participant.lastSeen,
        },
        lastMessage: prev?.lastMessage || '',
        lastMessageAt: prev?.lastMessageAt || new Date().toISOString(),
        unreadCount: prev?.unreadCount || 0,
        subject: subjectParam || prev?.subject || 'General',
        bookingId: bookingId || prev?.bookingId,
      }));
      return;
    }

    if (!bookingId && !participantId) return;

    let cancelled = false;
    setResolving(true);
    createConversation(
      bookingId
        ? { bookingId }
        : {
            participantId: participantId!,
            tutorId: participantId!,
            subject: subjectParam,
            peerName,
            peerAvatar,
            isVerified: isVerifiedParam,
          },
      authUser
    )
      .then(created => {
        if (cancelled) return;
        setResolvedChatId(created.id);
        setConversation(created);
      })
      .catch(err => {
        if (!cancelled) {
          Alert.alert(
            'Chat unavailable',
            err instanceof Error ? err.message : 'Could not open chat.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setResolving(false);
      });

    return () => {
      cancelled = true;
    };
  }, [
    authUser,
    bookingId,
    chatId,
    isOnlineParam,
    isVerifiedParam,
    lastSeenParam,
    participantId,
    peerAvatar,
    peerId,
    peerName,
    subjectParam,
  ]);

  const {
    messages,
    loading,
    error,
    peerTyping,
    sendText,
    sendMedia,
    react,
    remove,
    notifyTyping,
  } = useChatMessages(resolvedChatId);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      const windowHeight = Dimensions.get('window').height;
      const overlap = Math.max(
        e.endCoordinates.height,
        windowHeight - e.endCoordinates.screenY
      );
      setKeyboardHeight(overlap);
      requestAnimationFrame(() => {
        listRef.current?.scrollToEnd({ animated: true });
      });
    });

    const onHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0);
    });

    return () => {
      onShow.remove();
      onHide.remove();
    };
  }, []);

  useEffect(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, [messages.length, peerTyping]);

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    let unreadInserted = false;
    const firstUnreadIndex = messages.findIndex(
      m => !m.isMine && m.status !== 'seen'
    );

    messages.forEach((msg, index) => {
      if (
        index === 0 ||
        !sameDay(messages[index - 1].createdAt, msg.createdAt)
      ) {
        items.push({
          kind: 'date',
          id: `date-${msg.id}`,
          label: getDateDividerLabel(msg.createdAt),
        });
      }

      if (
        !unreadInserted &&
        firstUnreadIndex >= 0 &&
        index === firstUnreadIndex
      ) {
        items.push({ kind: 'unread', id: 'unread' });
        unreadInserted = true;
      }

      items.push({ kind: 'message', id: msg.id, message: msg });
    });

    return items;
  }, [messages]);

  const onSend = (text: string) => {
    void sendText(text);
    notifyTyping();
  };

  const onMessageAction = (actionId: string) => {
    if (!activeMessageId) return;

    if (actionId.startsWith('react:')) {
      const reaction = actionId.replace('react:', '');
      void react(activeMessageId, reaction);
      return;
    }

    if (actionId === 'delete') {
      void remove(activeMessageId, 'me');
    }
  };

  const handleAttachment = async (optionId: string) => {
    setAttachOpen(false);

    try {
      if (optionId === 'gallery' || optionId === 'camera') {
        const result =
          optionId === 'camera'
            ? await launchCamera({ mediaType: 'photo', quality: 0.8 })
            : await launchImageLibrary({ mediaType: 'photo', quality: 0.8 });

        const asset = result.assets?.[0];
        if (!asset?.uri) return;

        await sendMedia({
          uri: asset.uri,
          type: asset.type || 'image/jpeg',
          name: asset.fileName || `photo-${Date.now()}.jpg`,
          messageType: 'image',
        });
        return;
      }

      if (optionId === 'document' || optionId === 'homework') {
        const files = await pick({
          type: [DocumentTypes.pdf, DocumentTypes.doc, DocumentTypes.docx],
          allowMultiSelection: false,
        });
        const file = files?.[0];
        if (!file?.uri) return;

        await sendMedia({
          uri: file.uri,
          type: file.type || 'application/pdf',
          name: file.name || `file-${Date.now()}.pdf`,
          messageType: optionId === 'homework' ? 'homework' : 'document',
        });
        return;
      }

      if (optionId === 'audio') {
        Alert.alert(
          'Coming soon',
          'Voice recording upload will be enabled next.'
        );
      }
    } catch (err: any) {
      if (
        err?.code === 'DOCUMENT_PICKER_CANCELED' ||
        err?.message?.includes('cancel')
      ) {
        return;
      }
      Alert.alert(
        'Upload failed',
        err instanceof Error ? err.message : 'Could not attach file.'
      );
    }
  };

  const keyboardPad =
    keyboardHeight > 0 && !emojiOpen
      ? Platform.OS === 'ios'
        ? 0
        : keyboardHeight
      : 0;

  if (!resolvedChatId || resolving) {
    return (
      <View
        style={[
          styles.screen,
          styles.centered,
          { backgroundColor: colors.BACKGROUND as string },
        ]}
      >
        <ActivityIndicator color={colors.PRIMARY_COLOR as string} />
      </View>
    );
  }

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.BACKGROUND as string }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.WHITE_COLOR as string}
      />

      <ChatHeader
        name={conversation?.participant.name || peerName || 'Chat'}
        avatar={
          conversation?.participant.avatar || peerAvatar || fallbackAvatar
        }
        subject={conversation?.subject || subjectParam || 'General'}
        isOnline={conversation?.participant.isOnline ?? isOnlineParam}
        isVerified={conversation?.participant.isVerified ?? isVerifiedParam}
        isTyping={peerTyping}
        lastSeen={conversation?.participant.lastSeen || lastSeenParam}
        onBack={() => navigation.goBack()}
      />

      {isInquiryConversationId(resolvedChatId) ? (
        <Text style={styles.previewBanner}>
          Pre-booking preview — messages stay on this device until backend
          accepts participantId (no bookingId).
        </Text>
      ) : null}

      {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        {loading && messages.length === 0 ? (
          <ActivityIndicator
            style={{ marginTop: 24 }}
            color={colors.PRIMARY_COLOR as string}
          />
        ) : (
          <FlatList
            ref={listRef}
            data={listData}
            keyExtractor={item => item.id}
            style={styles.flex}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
            ListHeaderComponent={<EncryptionBanner />}
            ListFooterComponent={
              peerTyping ? (
                <TypingIndicator
                  name={
                    (
                      conversation?.participant.name ||
                      peerName ||
                      'User'
                    ).split(' ')[0]
                  }
                />
              ) : null
            }
            renderItem={({ item }) => {
              if (item.kind === 'date') {
                return <DateDivider label={item.label} />;
              }
              if (item.kind === 'unread') {
                return <UnreadDivider count={1} />;
              }
              return (
                <ChatBubble
                  message={item.message}
                  onLongPress={() => {
                    setActiveMessageId(item.message.id);
                    setActionsOpen(true);
                  }}
                />
              );
            }}
          />
        )}

        <View style={{ marginBottom: keyboardPad }}>
          <MessageInput
            keyboardVisible={keyboardHeight > 0}
            onEmojiOpenChange={open => {
              setEmojiOpen(open);
              if (open) {
                requestAnimationFrame(() => {
                  listRef.current?.scrollToEnd({ animated: true });
                });
              }
            }}
            onSend={onSend}
            onAttach={() => setAttachOpen(true)}
            onCamera={() => void handleAttachment('camera')}
          />
        </View>
      </KeyboardAvoidingView>

      <AttachmentSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelect={id => void handleAttachment(id)}
      />

      <MessageActions
        visible={actionsOpen}
        onClose={() => {
          setActionsOpen(false);
          setActiveMessageId(null);
        }}
        onAction={onMessageAction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    paddingTop: 4,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
  errorBanner: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FEF2F2',
  },
  previewBanner: {
    color: '#92400E',
    fontSize: 12,
    fontWeight: '600',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFBEB',
  },
});

export default ChatScreen;
