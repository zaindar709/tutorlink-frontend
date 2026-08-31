import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CLASSROOM_BRAND } from '../../constants/webrtc';

type ControlKey =
  | 'mic'
  | 'camera'
  | 'flip'
  | 'speaker'
  | 'screen'
  | 'chat'
  | 'end';

type Props = {
  isMicEnabled: boolean;
  isCameraEnabled: boolean;
  isSpeakerOn: boolean;
  isScreenSharing: boolean;
  showScreenShare?: boolean;
  unreadChat?: number;
  onToggleMic: () => void;
  onToggleCamera: () => void;
  onSwitchCamera: () => void;
  onToggleSpeaker: () => void;
  onToggleScreenShare: () => void;
  onOpenChat: () => void;
  onEndCall: () => void;
};

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ControlButton = ({
  icon,
  label,
  onPress,
  danger,
  active,
  badge,
}: {
  icon: string;
  label: string;
  onPress: () => void;
  danger?: boolean;
  active?: boolean;
  badge?: number;
}) => {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        scale.value = withSpring(0.9, { damping: 14, stiffness: 320 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 12, stiffness: 260 });
      }}
      style={[
        styles.btn,
        danger && styles.btnDanger,
        active && !danger && styles.btnActive,
        animStyle,
      ]}
      android_ripple={{ color: 'rgba(255,255,255,0.2)', borderless: true }}
    >
      <MaterialCommunityIcons name={icon as never} size={22} color="#fff" />
      <Text style={styles.label}>{label}</Text>
      {badge && badge > 0 ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 9 ? '9+' : badge}</Text>
        </View>
      ) : null}
    </AnimatedPressable>
  );
};

const CallControls = ({
  isMicEnabled,
  isCameraEnabled,
  isSpeakerOn,
  isScreenSharing,
  showScreenShare = false,
  unreadChat = 0,
  onToggleMic,
  onToggleCamera,
  onSwitchCamera,
  onToggleSpeaker,
  onToggleScreenShare,
  onOpenChat,
  onEndCall,
}: Props) => {
  const insets = useSafeAreaInsets();

  const items: Array<{
    key: ControlKey;
    icon: string;
    label: string;
    onPress: () => void;
    danger?: boolean;
    active?: boolean;
    badge?: number;
    hidden?: boolean;
  }> = [
    {
      key: 'mic',
      icon: isMicEnabled ? 'microphone' : 'microphone-off',
      label: isMicEnabled ? 'Mute' : 'Unmute',
      onPress: onToggleMic,
      active: !isMicEnabled,
    },
    {
      key: 'camera',
      icon: isCameraEnabled ? 'video' : 'video-off',
      label: isCameraEnabled ? 'Camera' : 'Cam Off',
      onPress: onToggleCamera,
      active: !isCameraEnabled,
    },
    {
      key: 'flip',
      icon: 'camera-flip',
      label: 'Flip',
      onPress: onSwitchCamera,
    },
    {
      key: 'speaker',
      icon: isSpeakerOn ? 'volume-high' : 'volume-medium',
      label: isSpeakerOn ? 'Speaker' : 'Earpiece',
      onPress: onToggleSpeaker,
      active: isSpeakerOn,
    },
    {
      key: 'screen',
      icon: isScreenSharing ? 'monitor-off' : 'monitor-share',
      label: isScreenSharing ? 'Stop' : 'Share',
      onPress: onToggleScreenShare,
      active: isScreenSharing,
      hidden: !showScreenShare,
    },
    {
      key: 'chat',
      icon: 'message-text',
      label: 'Chat',
      onPress: onOpenChat,
      badge: unreadChat,
    },
    {
      key: 'end',
      icon: 'phone-hangup',
      label: 'Leave',
      onPress: onEndCall,
      danger: true,
    },
  ];

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
      <View style={styles.row}>
        {items
          .filter(i => !i.hidden)
          .map(item => (
            <ControlButton
              key={item.key}
              icon={item.icon}
              label={item.label}
              onPress={item.onPress}
              danger={item.danger}
              active={item.active}
              badge={item.badge}
            />
          ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 0,
    borderRadius: 28,
    paddingTop: 14,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(8, 15, 35, 0.78)',
    borderWidth: 1,
    borderColor: CLASSROOM_BRAND.glassBorder,
    shadowColor: '#0066FF',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 14,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  btn: {
    width: 68,
    height: 64,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  btnActive: {
    backgroundColor: 'rgba(0,102,255,0.35)',
    borderColor: 'rgba(0,102,255,0.55)',
  },
  btnDanger: {
    backgroundColor: CLASSROOM_BRAND.danger,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  label: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 10,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: CLASSROOM_BRAND.danger,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default CallControls;
