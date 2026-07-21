import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Dimensions,
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { FadeIn, SlideInDown } from 'react-native-reanimated';
import { ATTACHMENT_OPTIONS } from '../../constants/chatMockData';
import useUi from '../../hooks/ui/useUi';

type Props = {
  visible: boolean;
  onClose: () => void;
  onSelect?: (id: string) => void;
};

const AttachmentSheet = ({ visible, onClose, onSelect }: Props) => {
  const { colors, resp } = useUi();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Animated.View
          entering={SlideInDown.springify()}
          style={[
            styles.sheet,
            {
              backgroundColor: colors.CARD_COLOR as string,
              borderColor: colors.BORDER_COLOR as string,
            },
          ]}
        >
          <View
            style={[
              styles.handle,
              { backgroundColor: colors.GRAY_COLOR as string },
            ]}
          />
          <Text
            style={{
              color: colors.TEXT_PRIMARY as string,
              fontSize: resp.df(16),
              fontWeight: '800',
              marginBottom: 16,
            }}
          >
            Share with tutor
          </Text>
          <View style={styles.grid}>
            {ATTACHMENT_OPTIONS.map(opt => (
              <Pressable
                key={opt.id}
                onPress={() => {
                  onSelect?.(opt.id);
                  onClose();
                }}
                style={styles.item}
              >
                <View
                  style={[
                    styles.iconWrap,
                    { backgroundColor: `${opt.color}22` },
                  ]}
                >
                  <MaterialCommunityIcons
                    name={opt.icon as any}
                    size={24}
                    color={opt.color}
                  />
                </View>
                <Text
                  style={{
                    color: colors.TEXT_SECONDARY as string,
                    fontSize: 12,
                    fontWeight: '600',
                    marginTop: 8,
                  }}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 36,
    borderWidth: 1,
    minHeight: Dimensions.get('window').height * 0.32,
  },
  handle: {
    alignSelf: 'center',
    width: 42,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    width: '33.33%',
    alignItems: 'center',
    marginBottom: 18,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AttachmentSheet;
