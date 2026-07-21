import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import useUi from '../../hooks/ui/useUi';

type Props = { count?: number };

const UnreadDivider = ({ count }: Props) => {
  const { colors, resp } = useUi();

  return (
    <View style={styles.wrap}>
      <View style={[styles.line, { backgroundColor: colors.BORDER_COLOR as string || colors.GRAY_COLOR as string }]} />
      <View
        style={[
          styles.pill,
          { backgroundColor: colors.PRIMARY_COLOR as string },
        ]}
      >
        <Text
          style={{
            color: colors.WHITE_COLOR as string,
            fontSize: resp.df(11),
            fontWeight: '700',
          }}
        >
          {count ? `${count} Unread Messages` : 'Unread Messages'}
        </Text>
      </View>
      <View style={[styles.line, { backgroundColor: colors.BORDER_COLOR as string || colors.GRAY_COLOR as string }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  pill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
});

export default UnreadDivider;
