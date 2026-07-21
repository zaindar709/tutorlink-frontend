import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { MessageStatus } from '../../constants/chatMockData';
import useUi from '../../hooks/ui/useUi';

type Props = {
  status?: MessageStatus;
  isMine?: boolean;
};

const MessageStatusIcon = ({ status = 'sent', isMine = true }: Props) => {
  const { colors } = useUi();
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (status === 'sending') {
      pulse.value = withRepeat(
        withSequence(
          withTiming(0.5, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      pulse.value = withTiming(1);
    }
  }, [status, pulse]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  if (!isMine) return null;

  const color =
    status === 'seen'
      ? (colors.CHAT_TICK_READ as string)
      : status === 'failed'
        ? (colors.ERROR_COLOR as string)
        : (colors.CHAT_TICK as string);

  if (status === 'failed') {
    return (
      <MaterialCommunityIcons name="alert-circle-outline" size={14} color={color} />
    );
  }

  if (status === 'sending') {
    return (
      <Animated.View style={animStyle}>
        <MaterialCommunityIcons name="clock-outline" size={13} color={color} />
      </Animated.View>
    );
  }

  const name =
    status === 'sent' ? 'check' : status === 'delivered' ? 'check-all' : 'check-all';

  return (
    <View style={styles.wrap}>
      <MaterialCommunityIcons name={name} size={15} color={color} />
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    marginLeft: 2,
  },
});

export default MessageStatusIcon;
