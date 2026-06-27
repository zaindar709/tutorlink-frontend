import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

type Props = {
  onGenerateCode?: () => void;
  loading?: boolean;
};

export default function ParentLinkCard({ onGenerateCode, loading }: Props) {
  return (
    <LinearGradient
      colors={['#34D399', '#10B981', '#088a61']}
      style={styles.container}
    >
      <View style={styles.left}>
        <View style={styles.iconBox}>
          <Icon source="link-variant" size={20} color="#fff" />
        </View>

        <View style={styles.textBox}>
          <Text style={styles.title}>Link Parent Account</Text>
          <Text style={styles.desc}>
            Share your progress with your parents
          </Text>
        </View>
      </View>

      <TouchableOpacity
        style={styles.btn}
        onPress={onGenerateCode}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#059669" />
        ) : (
          <Text style={styles.btnText}>Generate Code</Text>
        )}
      </TouchableOpacity>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    padding: 16,
    height: 150,
    borderRadius: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: -30,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  textBox: {
    flex: 1,
    marginLeft: 10,
    paddingRight: 10,
  },
  iconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  desc: {
    color: '#E7FFF5',
    fontSize: 12,
    flexShrink: 1,
  },
  btn: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'center',
    minWidth: 110,
    alignItems: 'center',
  },
  btnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
});
