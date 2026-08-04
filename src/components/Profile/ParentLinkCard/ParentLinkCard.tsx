import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';
import { GLASS } from '../../../theme/glass';

type Props = {
  onGenerateCode?: () => void;
  loading?: boolean;
};

export default function ParentLinkCard({ onGenerateCode, loading }: Props) {
  return (
    <LinearGradient
      colors={['#34D399', '#10B981', '#059669']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.iconBox}>
        <Icon source="account-child-outline" size={22} color="#fff" />
      </View>

      <View style={styles.textBox}>
        <Text style={styles.title}>Link a parent</Text>
        <Text style={styles.desc}>Share progress with a short code</Text>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={onGenerateCode}
        disabled={loading}
        activeOpacity={0.85}
      >
        {loading ? (
          <ActivityIndicator color="#059669" />
        ) : (
          <Text style={styles.btnText}>Generate</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: -28,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: GLASS.radius.xl,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
    shadowColor: '#10B981',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.22)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textBox: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },
  title: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
  desc: {
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    marginTop: 2,
  },
  btn: {
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    minWidth: 92,
    alignItems: 'center',
  },
  btnText: {
    color: '#059669',
    fontSize: 13,
    fontWeight: '700',
  },
});
