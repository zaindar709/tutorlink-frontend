import React, { useMemo } from 'react';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-paper';
import Animated, {
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
import useUi from '../../ui/useUi';

function RoleCard({ role, isSelected, onSelect }: any) {
  const { colors, resp } = useUi();
  const styles = useMemo(
    () => createStyles(colors, resp, isSelected),
    [colors, resp, isSelected],
  );

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          scale: withSpring(isSelected ? 1.04 : 1, {
            damping: 16,
            stiffness: 120,
          }),
        },
      ],
    };
  });

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        onPress={onSelect}
        activeOpacity={0.9}
        style={styles.card}
      >
        <View style={styles.row}>
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>{role.icon}</Text>
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{role.title}</Text>
            <Text style={styles.subtitle}>{role.subtitle}</Text>
            <View style={styles.descriptionRow}>
              <Text style={styles.description}>{role.description}</Text>
              {isSelected && <Text style={styles.arrow}>→</Text>}
            </View>
          </View>
          <RadioButton
            value={role.id}
            status={isSelected ? 'checked' : 'unchecked'}
            onPress={onSelect}
            color={colors.PRIMARY_COLOR as string}
            uncheckedColor={colors.GRAY_COLOR as string}
          />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default React.memo(RoleCard, (prev, next) => {
  return prev.role.id === next.role.id && prev.isSelected === next.isSelected;
});

const createStyles = (colors: any, resp: any, isSelected: boolean) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.WHITE_COLOR || '#fff',
      padding: resp.dx(30),
      height: resp.dy(150),
      borderRadius: resp.dx(20),
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected
        ? colors.PRIMARY_COLOR
        : colors.BORDER_COLOR || '#eee',
      marginBottom: resp.dy(15),
      elevation: isSelected ? 6 : 2,
      marginTop: resp.dy(10),
    },

    row: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconContainer: {
      width: resp.dx(60),
      height: resp.dy(60),
      borderRadius: resp.dx(16),
      backgroundColor: isSelected
        ? colors.PRIMARY_COLOR
        : colors.LIGHT_PRIMARY || '#EAF2FF',
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(15),
    },

    icon: {
      fontSize: resp.df(28),
    },

    textContainer: {
      flex: 1,
    },

    title: {
      fontSize: resp.df(18),
      color: isSelected ? colors.PRIMARY_COLOR : colors.TEXT_PRIMARY || '#000',
      fontWeight: '600',
    },

    subtitle: {
      color: colors.TEXT_SECONDARY || '#666',
      fontSize: resp.df(13),
      marginTop: resp.dy(2),
    },

    descriptionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(5),
    },

    description: {
      fontSize: resp.df(12),
      color: isSelected ? colors.ORANGE_COLOR : colors.GRAY || '#aaa',
    },

    arrow: {
      marginLeft: resp.dx(6),
      fontSize: resp.df(14),
      color: colors.ORANGE_COLOR,
      fontWeight: 'bold',
    },
  });
