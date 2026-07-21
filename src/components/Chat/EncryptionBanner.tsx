import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import useUi from '../../hooks/ui/useUi';

const EncryptionBanner = () => {
  const { colors, resp } = useUi();

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: colors.CHAT_SECURITY_BG as string,
          borderColor: colors.CHAT_BUBBLE_IN_BORDER as string,
        },
      ]}
    >
      <View
        style={[
          styles.iconWrap,
          { backgroundColor: colors.LIGHT_PRIMARY as string },
        ]}
      >
        <MaterialCommunityIcons
          name="shield-lock-outline"
          size={18}
          color={colors.PRIMARY_COLOR as string}
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            color: colors.TEXT_PRIMARY as string,
            fontSize: resp.df(12),
            fontWeight: '700',
          }}
        >
          End-to-End Encrypted
        </Text>
        <Text
          style={{
            color: colors.TEXT_SECONDARY as string,
            fontSize: resp.df(11),
            marginTop: 2,
            lineHeight: 16,
          }}
        >
          Messages are protected. Only you and your tutor can read them.
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default EncryptionBanner;
