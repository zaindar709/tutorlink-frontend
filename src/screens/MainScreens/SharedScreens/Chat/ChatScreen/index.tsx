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
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
  ChatMessage,
  MOCK_CONVERSATIONS,
  MOCK_MESSAGES,
} from '../../../../../constants/chatMockData';
import {
  getDateDividerLabel,
  sameDay,
} from '../../../../../utils/chat/formatters';

type ListItem =
  | { kind: 'date'; id: string; label: string }
  | { kind: 'unread'; id: string }
  | { kind: 'message'; id: string; message: ChatMessage };

const ChatScreen = () => {
  const { colors } = useUi();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const listRef = useRef<FlatList>(null);
  const chatId = route.params?.chatId || 'c1';

  const conversation =
    MOCK_CONVERSATIONS.find(c => c.id === chatId) || MOCK_CONVERSATIONS[0];

  const [messages, setMessages] = useState<ChatMessage[]>(
    MOCK_MESSAGES[chatId] || MOCK_MESSAGES.c1
  );
  const [attachOpen, setAttachOpen] = useState(false);
  const [actionsOpen, setActionsOpen] = useState(false);
  const [activeMessageId, setActiveMessageId] = useState<string | null>(null);
  const [isTyping] = useState(conversation.isTyping);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [emojiOpen, setEmojiOpen] = useState(false);

  useEffect(() => {
    const showEvent =
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const hideEvent =
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';

    const onShow = Keyboard.addListener(showEvent, e => {
      // Prefer overlap with the window so we don't under/over-lift on Android.
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

  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];
    let unreadInserted = false;
    const unreadFromIndex = Math.max(0, messages.length - 2);

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

      if (!unreadInserted && index === unreadFromIndex && !msg.isMine) {
        items.push({ kind: 'unread', id: 'unread' });
        unreadInserted = true;
      }

      items.push({ kind: 'message', id: msg.id, message: msg });
    });

    return items;
  }, [messages]);

  const onSend = (text: string) => {
    const next: ChatMessage = {
      id: `local-${Date.now()}`,
      chatId,
      type: 'text',
      text,
      senderId: 'me',
      isMine: true,
      createdAt: new Date().toISOString(),
      status: 'sent',
    };
    setMessages(prev => [...prev, next]);
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  };

  const onMessageAction = (actionId: string) => {
    if (!activeMessageId) return;

    if (actionId.startsWith('react:')) {
      const reaction = actionId.replace('react:', '');
      setMessages(prev =>
        prev.map(msg =>
          msg.id === activeMessageId
            ? {
                ...msg,
                reaction: msg.reaction === reaction ? undefined : reaction,
              }
            : msg
        )
      );
      return;
    }

    if (actionId === 'delete') {
      setMessages(prev => prev.filter(msg => msg.id !== activeMessageId));
    }
  };

  // With adjustNothing, lift the composer by the keyboard overlap on both platforms
  // when KeyboardAvoidingView isn't enough (Android).
  const keyboardPad =
    keyboardHeight > 0 && !emojiOpen
      ? Platform.OS === 'ios'
        ? 0
        : keyboardHeight
      : 0;

  return (
    <View
      style={[styles.screen, { backgroundColor: colors.BACKGROUND as string }]}
    >
      <StatusBar
        barStyle="dark-content"
        backgroundColor={colors.WHITE_COLOR as string}
      />

      <ChatHeader
        name={conversation.participant.name}
        avatar={conversation.participant.avatar}
        subject={conversation.subject}
        isOnline={conversation.participant.isOnline}
        isVerified={conversation.participant.isVerified}
        isTyping={isTyping}
        lastSeen={conversation.participant.lastSeen}
        onBack={() => navigation.goBack()}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
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
            isTyping ? (
              <TypingIndicator
                name={conversation.participant.name.split(' ')[0]}
              />
            ) : null
          }
          renderItem={({ item }) => {
            if (item.kind === 'date') return <DateDivider label={item.label} />;
            if (item.kind === 'unread') return <UnreadDivider count={2} />;
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
            onCamera={() => setAttachOpen(true)}
          />
        </View>
      </KeyboardAvoidingView>

      <AttachmentSheet
        visible={attachOpen}
        onClose={() => setAttachOpen(false)}
        onSelect={() => {}}
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
  flex: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 16,
    paddingTop: 4,
    flexGrow: 1,
    justifyContent: 'flex-end',
  },
});

export default ChatScreen;
