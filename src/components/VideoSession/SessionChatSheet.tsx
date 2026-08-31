import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  View,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import GlassBottomSheet from '../Glass/GlassBottomSheet';
import { CLASSROOM_BRAND } from '../../constants/webrtc';
import type { SessionChatPayload } from '../../types/webrtc.types';

type Props = {
  visible: boolean;
  onClose: () => void;
  messages: SessionChatPayload[];
  selfUserId: string;
  onSend: (text: string) => void;
};

const SessionChatSheet = ({
  visible,
  onClose,
  messages,
  selfUserId,
  onSend,
}: Props) => {
  const [text, setText] = useState('');

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    onSend(value);
    setText('');
  };

  return (
    <GlassBottomSheet visible={visible} onClose={onClose} title="Class chat">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <FlatList
          data={messages}
          keyExtractor={(item, index) => `${item.createdAt}-${index}`}
          style={styles.list}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text style={styles.empty}>
              Say hello — messages stay in this live session.
            </Text>
          }
          renderItem={({ item }) => {
            const mine = item.userId === selfUserId;
            return (
              <View
                style={[styles.bubble, mine ? styles.bubbleMine : styles.bubblePeer]}
              >
                {!mine ? <Text style={styles.author}>{item.name}</Text> : null}
                <Text style={[styles.body, mine && styles.bodyMine]}>
                  {item.text}
                </Text>
              </View>
            );
          }}
        />
        <View style={styles.composer}>
          <TextInput
            value={text}
            onChangeText={setText}
            placeholder="Message your class…"
            placeholderTextColor="#94A3B8"
            style={styles.input}
            onSubmitEditing={handleSend}
            returnKeyType="send"
          />
          <Pressable style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendText}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </GlassBottomSheet>
  );
};

const styles = StyleSheet.create({
  list: {
    maxHeight: 280,
  },
  listContent: {
    paddingBottom: 12,
    gap: 8,
  },
  empty: {
    textAlign: 'center',
    color: '#94A3B8',
    paddingVertical: 24,
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  bubbleMine: {
    alignSelf: 'flex-end',
    backgroundColor: CLASSROOM_BRAND.primary,
  },
  bubblePeer: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(15,23,42,0.06)',
  },
  author: {
    fontSize: 11,
    fontWeight: '700',
    color: CLASSROOM_BRAND.primary,
    marginBottom: 2,
  },
  body: {
    color: '#0F172A',
    fontSize: 14,
  },
  bodyMine: {
    color: '#fff',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  input: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(15,23,42,0.05)',
    color: '#0F172A',
  },
  sendBtn: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: CLASSROOM_BRAND.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendText: {
    color: '#fff',
    fontWeight: '800',
  },
});

export default SessionChatSheet;
