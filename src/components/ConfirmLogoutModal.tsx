import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import GlassModal from './Glass/GlassModal';
import { GLASS } from '../theme/glass';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  confirming?: boolean;
};

const ConfirmLogoutModal = ({ visible, onCancel, onConfirm, confirming }: Props) => {
  return (
    <GlassModal visible={visible} onClose={onCancel} title={"Confirm Logout"}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <MaterialCommunityIcons name="logout" size={36} color="#DC2626" />
        </View>
        <Text style={styles.message}>Are you sure you want to logout?</Text>

        <View style={styles.actions}>
          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Cancel logout"
            style={[styles.btn, styles.noBtn, confirming && styles.disabled]}
            onPress={onCancel}
            disabled={!!confirming}
          >
            <Text style={styles.noText}>NO</Text>
          </TouchableOpacity>

          <TouchableOpacity
            accessibilityRole="button"
            accessibilityLabel="Confirm logout"
            style={[styles.btn, styles.yesBtn, confirming && styles.disabled]}
            onPress={onConfirm}
            disabled={!!confirming}
          >
            <Text style={styles.yesText}>{confirming ? 'Logging out…' : 'YES, LOGOUT'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </GlassModal>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  message: {
    color: GLASS.textPrimary,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: GLASS.space.lg,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
    justifyContent: 'center',
  },
  iconWrap: { marginBottom: GLASS.space.md },
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 10,
    minWidth: 120,
    alignItems: 'center',
  },
  noBtn: {
    backgroundColor: GLASS.cardBgStrong,
    borderWidth: 1,
    borderColor: GLASS.cardBorder,
  },
  yesBtn: {
    backgroundColor: '#DC2626',
  },
  noText: { color: GLASS.textPrimary, fontWeight: '800' },
  yesText: { color: '#fff', fontWeight: '800' },
  disabled: { opacity: 0.6 },
});

export default ConfirmLogoutModal;
