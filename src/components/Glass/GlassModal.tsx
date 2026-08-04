import React, { ReactNode } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  Text,
  TouchableOpacity,
} from 'react-native';
import { GLASS, glassTypography } from '../../theme/glass';

type Props = {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
};

const GlassModal = ({ visible, onClose, title, children }: Props) => (
  <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.card} onPress={e => e.stopPropagation()}>
        {title ? (
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.close}>Close</Text>
            </TouchableOpacity>
          </View>
        ) : null}
        {children}
      </Pressable>
    </Pressable>
  </Modal>
);

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'center',
    padding: GLASS.space.xl,
  },
  card: {
    backgroundColor: GLASS.cardBgStrong,
    borderRadius: GLASS.radius.xxl,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
    padding: GLASS.space.xl,
    ...GLASS.shadow.medium,
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

export default GlassModal;
