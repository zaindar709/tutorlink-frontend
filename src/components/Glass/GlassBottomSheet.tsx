import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Text,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLASS, glassTypography } from '../../theme/glass';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

/** Bottom sheet chrome only — same API surface for UI consistency. */
const GlassBottomSheet = ({ visible, onClose, title, children }: Props) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable
          style={[styles.sheet, { paddingBottom: Math.max(insets.bottom, 16) }]}
          onPress={e => e.stopPropagation()}
        >
          <View style={styles.handle} />
          {title ? (
            <View style={styles.header}>
              <Text style={styles.title}>{title}</Text>
              <TouchableOpacity onPress={onClose}>
                <Text style={styles.close}>Done</Text>
              </TouchableOpacity>
            </View>
          ) : null}
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: GLASS.cardBgStrong,
    borderTopLeftRadius: GLASS.radius.xxl,
    borderTopRightRadius: GLASS.radius.xxl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    paddingHorizontal: GLASS.space.xl,
    paddingTop: GLASS.space.md,
    minHeight: 180,
    ...GLASS.shadow.medium,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(148,163,184,0.5)',
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: GLASS.space.lg,
  },
  title: glassTypography.h3,
  close: { color: GLASS.primary, fontWeight: '700' },
});

export default GlassBottomSheet;
