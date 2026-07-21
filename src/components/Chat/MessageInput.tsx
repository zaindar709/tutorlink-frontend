import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Pressable,
  Text,
  Keyboard,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useUi from '../../hooks/ui/useUi';
import EmojiPicker from './EmojiPicker';

type Props = {
  onSend: (text: string) => void;
  onAttach: () => void;
  onCamera?: () => void;
  keyboardVisible?: boolean;
  onEmojiOpenChange?: (open: boolean) => void;
};

const MessageInput = ({
  onSend,
  onAttach,
  onCamera,
  keyboardVisible = false,
  onEmojiOpenChange,
}: Props) => {
  const { colors, resp } = useUi();
  const insets = useSafeAreaInsets();
  const inputRef = useRef<TextInput>(null);
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const sendScale = useSharedValue(1);
  const recPulse = useSharedValue(1);

  useEffect(() => {
    if (recording) {
      recPulse.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      recPulse.value = withTiming(1);
    }
  }, [recording, recPulse]);

  useEffect(() => {
    if (keyboardVisible && emojiOpen) {
      setEmojiOpen(false);
      onEmojiOpenChange?.(false);
    }
  }, [keyboardVisible, emojiOpen, onEmojiOpenChange]);

  const sendStyle = useAnimatedStyle(() => ({
    transform: [{ scale: sendScale.value }],
  }));

  const recStyle = useAnimatedStyle(() => ({
    transform: [{ scale: recPulse.value }],
  }));

  const hasText = text.trim().length > 0;

  const handleSend = () => {
    if (!hasText) return;
    sendScale.value = withSequence(withSpring(0.85), withSpring(1));
    onSend(text.trim());
    setText('');
  };

  const setEmojiVisible = (open: boolean) => {
    setEmojiOpen(open);
    onEmojiOpenChange?.(open);
  };

  const toggleEmoji = () => {
    if (emojiOpen) {
      setEmojiVisible(false);
      inputRef.current?.focus();
      return;
    }
    Keyboard.dismiss();
    // Wait for keyboard hide so the picker doesn't fight keyboard layout.
    setTimeout(() => setEmojiVisible(true), 40);
  };

  const insertEmoji = (emoji: string) => {
    setText(prev => `${prev}${emoji}`);
  };

  const bottomPad =
    emojiOpen || keyboardVisible ? 8 : Math.max(insets.bottom, 10);

  return (
    <View
      style={[
        styles.wrap,
        {
          paddingBottom: bottomPad,
          backgroundColor: colors.CHAT_COMPOSER_BG as string,
          borderTopColor: colors.BORDER_COLOR as string,
        },
      ]}
    >
      {recording ? (
        <View style={styles.recordingRow}>
          <Animated.View style={recStyle}>
            <View
              style={[
                styles.recDot,
                { backgroundColor: colors.ERROR_COLOR as string },
              ]}
            />
          </Animated.View>
          <Text
            style={{
              color: colors.TEXT_PRIMARY as string,
              fontWeight: '700',
              marginLeft: 8,
              flex: 1,
            }}
          >
            Recording voice note…
          </Text>
          <Pressable onPress={() => setRecording(false)}>
            <Text
              style={{
                color: colors.PRIMARY_COLOR as string,
                fontWeight: '700',
              }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.row}>
        <Pressable
          onPress={() => {
            setEmojiVisible(false);
            onAttach();
          }}
          style={styles.sideBtn}
        >
          <MaterialCommunityIcons
            name="plus-circle-outline"
            size={26}
            color={colors.PRIMARY_COLOR as string}
          />
        </Pressable>

        <View
          style={[
            styles.inputShell,
            {
              backgroundColor: colors.CHAT_INPUT_BG as string,
              borderColor: colors.BORDER_COLOR as string,
            },
          ]}
        >
          <Pressable onPress={toggleEmoji} style={styles.emojiBtn} hitSlop={6}>
            <MaterialCommunityIcons
              name={emojiOpen ? 'keyboard-outline' : 'emoticon-outline'}
              size={22}
              color={
                emojiOpen
                  ? (colors.PRIMARY_COLOR as string)
                  : (colors.TEXT_SECONDARY as string)
              }
            />
          </Pressable>
          <TextInput
            ref={inputRef}
            value={text}
            onChangeText={setText}
            onFocus={() => setEmojiVisible(false)}
            placeholder="Message your tutor…"
            placeholderTextColor={colors.PLACEHOLDER_TEXTCOLOR as string}
            style={[
              styles.input,
              {
                color: colors.TEXT_PRIMARY as string,
                fontSize: resp.df(14),
              },
            ]}
            multiline
          />
          <Pressable
            onPress={() => {
              setEmojiVisible(false);
              onCamera?.();
            }}
            style={styles.emojiBtn}
          >
            <MaterialCommunityIcons
              name="camera-outline"
              size={22}
              color={colors.TEXT_SECONDARY as string}
            />
          </Pressable>
        </View>

        {hasText ? (
          <Animated.View style={sendStyle}>
            <Pressable onPress={handleSend}>
              <View
                style={[
                  styles.sendBtn,
                  { backgroundColor: colors.PRIMARY_COLOR as string },
                ]}
              >
                <MaterialCommunityIcons name="send" size={18} color="#fff" />
              </View>
            </Pressable>
          </Animated.View>
        ) : (
          <Pressable
            onPress={() => setRecording(r => !r)}
            onLongPress={() => setRecording(true)}
          >
            <Animated.View style={recStyle}>
              <View
                style={[
                  styles.sendBtn,
                  {
                    backgroundColor: recording
                      ? (colors.ERROR_COLOR as string)
                      : (colors.LIGHT_PRIMARY as string),
                  },
                ]}
              >
                <MaterialCommunityIcons
                  name={recording ? 'stop' : 'microphone'}
                  size={20}
                  color={
                    recording
                      ? '#fff'
                      : (colors.PRIMARY_COLOR as string)
                  }
                />
              </View>
            </Animated.View>
          </Pressable>
        )}
      </View>

      <EmojiPicker visible={emojiOpen} onSelect={insertEmoji} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
    paddingHorizontal: 10,
  },
  sideBtn: {
    paddingBottom: 10,
  },
  inputShell: {
    flex: 1,
    minHeight: 46,
    maxHeight: 120,
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  emojiBtn: {
    padding: 8,
  },
  input: {
    flex: 1,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  recordingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingHorizontal: 18,
  },
  recDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});

export default MessageInput;
