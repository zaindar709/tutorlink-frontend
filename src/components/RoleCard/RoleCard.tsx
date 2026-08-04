import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import useUi from '../../hooks/ui/useUi';
import { AUTH_GLASS } from '../AuthGlass/authGlassTheme';

const ACCENT = '#F7B84B';

function RoleCard({ role, isSelected, onSelect }: any) {
  const { resp } = useUi();
  const styles = useMemo(
    () => createStyles(resp, isSelected),
    [resp, isSelected],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isSelected ? 1.02 : 1, {
          damping: 18,
          stiffness: 140,
        }),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.88}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{role.icon}</Text>
          </View>

          <View style={styles.textContainer}>
            <Text style={styles.title}>{role.title}</Text>
            <Text style={styles.subtitle} numberOfLines={2}>
              {role.subtitle}
            </Text>
            <View style={styles.descriptionRow}>
              <Text style={styles.description}>{role.description}</Text>
              {isSelected ? <Text style={styles.arrow}> →</Text> : null}
            </View>
          </View>

          <View style={styles.radioOuter}>
            {isSelected ? (
              <MaterialCommunityIcons name="check" size={14} color="#fff" />
            ) : null}
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(RoleCard, (prev, next) => {
  return prev.role.id === next.role.id && prev.isSelected === next.isSelected;
});

const createStyles = (resp: any, isSelected: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: isSelected
        ? 'rgba(117, 72, 245, 0.12)'
        : AUTH_GLASS.cardBg,
      paddingVertical: resp.dy(18),
      paddingHorizontal: resp.dx(16),
      borderRadius: resp.dx(20),
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected
        ? (AUTH_GLASS.primary as string)
        : AUTH_GLASS.cardBorder,
      marginBottom: resp.dy(12),
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconContainer: {
      width: resp.dx(52),
      height: resp.dy(52),
      borderRadius: resp.dx(14),
      backgroundColor: isSelected
        ? (AUTH_GLASS.primary as string)
        : 'rgba(117, 72, 245, 0.1)',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(12),
    },

    icon: {
      fontSize: resp.df(24),
    },

    textContainer: {
      flex: 1,
      paddingRight: 8,
    },

    title: {
      fontSize: resp.df(17),
      color: AUTH_GLASS.title,
      fontWeight: '700',
    },

    subtitle: {
      color: AUTH_GLASS.subtitle,
      fontSize: resp.df(12),
      marginTop: resp.dy(3),
      lineHeight: resp.df(17),
    },

    descriptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(8),
      flexWrap: 'wrap',
    },

    description: {
      fontSize: resp.df(12),
      fontWeight: isSelected ? '700' : '500',
      color: isSelected ? ACCENT : AUTH_GLASS.muted,
    },

    arrow: {
      fontSize: resp.df(14),
      color: ACCENT,
      fontWeight: '800',
    },

    radioOuter: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: isSelected
        ? (AUTH_GLASS.primary as string)
        : AUTH_GLASS.inputBorder,
      backgroundColor: isSelected
        ? (AUTH_GLASS.primary as string)
        : 'transparent',
      alignItems: 'center',
      justifyContent: 'center',
    },
  });
