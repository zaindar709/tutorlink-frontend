import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  FlatList,
  useWindowDimensions,
} from 'react-native';
import useUi from '../../hooks/ui/useUi';

const EMOJI_CATEGORIES: { title: string; data: string[] }[] = [
  {
    title: 'Smileys',
    data: [
      '😀', '😁', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤗',
      '🤔', '😅', '😢', '😭', '😤', '😴', '🤯', '🥳', '😇', '🙃',
      '🤩', '😋', '😜', '😌', '😷', '🤒', '🤕', '😮', '😬', '🙄',
    ],
  },
  {
    title: 'Gestures',
    data: [
      '👍', '👎', '👏', '🙌', '🙏', '🤝', '✌️', '🤞', '👋', '💪',
      '🫶', '❤️', '🔥', '✨', '⭐', '💯', '✅', '🎉', '📚', '🎓',
      '😊', '😎', '🥳', '😇', '🫡', '👀', '💬', '🔔', '📌', '✅',
    ],
  },
  {
    title: 'Study',
    data: [
      '📝', '📖', '✏️', '🧠', '💡', '📌', '📎', '🗓️', '⏰', '💻',
      '🧪', '📐', '📊', '🗂️', '🧾', '🏆', '🎯', '🗣️', '👨‍🏫', '👩‍🎓',
      '📘', '📗', '📕', '🎒', '🔬', '🧮', '🖥️', '📱', '✍️', '🏫',
    ],
  },
];

const COLS = 8;

type Props = {
  visible: boolean;
  onSelect: (emoji: string) => void;
};

const EmojiPicker = ({ visible, onSelect }: Props) => {
  const { colors, resp } = useUi();
  const { width } = useWindowDimensions();
  const [category, setCategory] = useState(0);
  const cellSize = width / COLS;

  const emojis = useMemo(
    () => EMOJI_CATEGORIES[category]?.data ?? [],
    [category]
  );

  if (!visible) return null;

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.CHAT_COMPOSER_BG as string,
          borderTopColor: (colors.BORDER_COLOR as string) || '#E5E7EB',
        },
      ]}
    >
      <View style={styles.tabs}>
        {EMOJI_CATEGORIES.map((cat, index) => {
          const active = index === category;
          return (
            <Pressable
              key={cat.title}
              onPress={() => setCategory(index)}
              style={[
                styles.tab,
                active && {
                  backgroundColor: colors.LIGHT_PRIMARY as string,
                },
              ]}
            >
              <Text
                style={{
                  color: active
                    ? (colors.PRIMARY_COLOR as string)
                    : (colors.TEXT_SECONDARY as string),
                  fontSize: resp.df(12),
                  fontWeight: '700',
                }}
              >
                {cat.title}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={emojis}
        keyExtractor={(item, index) => `${item}-${index}`}
        numColumns={COLS}
        style={styles.grid}
        contentContainerStyle={styles.gridContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => onSelect(item)}
            style={[styles.emojiHit, { width: cellSize, height: cellSize }]}
            hitSlop={4}
          >
            <Text style={styles.emoji}>{item}</Text>
          </Pressable>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    height: 280,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  tabs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 8,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
  },
  grid: {
    flex: 1,
  },
  gridContent: {
    paddingBottom: 8,
  },
  emojiHit: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 26,
  },
});

export default EmojiPicker;
