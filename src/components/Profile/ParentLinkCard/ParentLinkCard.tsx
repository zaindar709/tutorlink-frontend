import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import LinearGradient from 'react-native-linear-gradient';

export default function ParentLinkCard() {
  return (
    <LinearGradient
      colors={['#34D399', '#10B981', '#088a61']}
      style={styles.container}
    >
      {/* LEFT */}
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

      {/* RIGHT BUTTON */}
      <TouchableOpacity style={styles.btn}>
        <Text style={styles.btnText}>Generate Code</Text>
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
    flex: 1,   // ✅ IMPORTANT
  },

  textBox: {
    flex: 1,   // ✅ allows proper wrapping space
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
    flexShrink: 1,   // ✅ prevents overflow
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
    alignSelf: 'center', // ✅ keeps button centered vertically
  },

  btnText: {
    color: '#059669',
    fontSize: 12,
    fontWeight: '700',
  },
});