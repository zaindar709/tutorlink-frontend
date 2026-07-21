import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { ZoomIn } from 'react-native-reanimated';
import useUi from '../../hooks/ui/useUi';

type Action = {
  id: string;
  label: string;
  icon: string;
  danger?: boolean;
};

const ACTIONS: Action[] = [
  { id: 'reply', label: 'Reply', icon: 'reply' },
  { id: 'copy', label: 'Copy', icon: 'content-copy' },
  { id: 'forward', label: 'Forward', icon: 'share' },
  { id: 'edit', label: 'Edit', icon: 'pencil-outline' },
  { id: 'pin', label: 'Pin', icon: 'pin-outline' },
  { id: 'delete', label: 'Delete', icon: 'delete-outline', danger: true },
];

type Props = {
  visible: boolean;
  onClose: () => void;
  onAction?: (id: string) => void;
};

const MessageActions = ({ visible, onClose, onAction }: Props) => {
  const { colors, resp } = useUi();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <Animated.View
          entering={ZoomIn.springify()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.CARD_COLOR as string,
              borderColor: colors.BORDER_COLOR as string,
            },
          ]}
        >
          <View style={styles.reactions}>
            {['👍', '❤️', '🎉', '🙏', '🔥'].map(emoji => (
              <Pressable
                key={emoji}
                onPress={() => {
                  onAction?.(`react:${emoji}`);
                  onClose();
                }}
                style={styles.emoji}
                hitSlop={8}
              >
                <Text style={styles.emojiText}>{emoji}</Text>
              </Pressable>
            ))}
          </View>
          {ACTIONS.map(action => (
            <Pressable
              key={action.id}
              style={styles.row}
              onPress={() => {
                onAction?.(action.id);
                onClose();
              }}
            >
              <MaterialCommunityIcons
                name={action.icon as any}
                size={20}
                color={
                  action.danger
                    ? (colors.ERROR_COLOR as string)
                    : (colors.TEXT_PRIMARY as string)
                }
              />
              <Text
                style={{
                  marginLeft: 12,
                  color: action.danger
                    ? (colors.ERROR_COLOR as string)
                    : (colors.TEXT_PRIMARY as string),
                  fontSize: resp.df(15),
                  fontWeight: '600',
                }}
              >
                {action.label}
              </Text>
            </Pressable>
          ))}
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  sheet: {
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 10,
    paddingHorizontal: 4,
  },
  emoji: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  emojiText: {
    fontSize: 26,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
});

export default MessageActions;
