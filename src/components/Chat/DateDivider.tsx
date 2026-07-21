import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';

type Props = { label: string };

const DateDivider = ({ label }: Props) => {
  const { colors, resp } = useUi();

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.pill,
          {
            backgroundColor: colors.LIGHT_PRIMARY as string,
            borderColor: colors.CHAT_BUBBLE_IN_BORDER as string,
          },
        ]}
      >
        <Text
          style={{
            color: colors.PRIMARY_COLOR as string,
            fontSize: resp.df(11),
            fontWeight: '700',
            letterSpacing: 0.3,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    marginVertical: 14,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
});

export default DateDivider;
