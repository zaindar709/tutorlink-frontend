import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';


type TutorNearbyCardProps = {
  name: string;
  subject: string;
  distance: string;
  rate: string;
  isSelected: boolean;
  onPress: () => void;
};

const TutorNearbyCard: React.FC<TutorNearbyCardProps> = ({
  name,
  subject,
  distance,
  rate,
  isSelected,
  onPress,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp, isSelected);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{name.charAt(0)}</Text>
      </View>

      <View style={styles.content}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.subject}>{subject}</Text>

        <View style={styles.detailsRow}>
          <View style={styles.detailPill}>
            <Icon source="map-marker-radius" size={14} color={colors.PRIMARY_COLOR as string} />
            <Text style={styles.detailText}>{distance}</Text>
          </View>
          <View style={styles.detailPill}>
            <Icon source="star" size={14} color={colors.YELLOW_COLOR as string} />
            <Text style={styles.detailText}>{rate}</Text>
          </View>
        </View>
      </View>

      <View style={styles.actionWrapper}>
        <Text style={styles.actionText}>Book Now</Text>
      </View>
    </TouchableOpacity>
  );
};

export default TutorNearbyCard;

const createStyles = (colors: any, resp: any, isSelected: boolean) =>
  StyleSheet.create({
    card: {
      width: resp.pw(85),
      minHeight: resp.dy(96),
      borderRadius: resp.dx(24),
      backgroundColor: colors.WHITE_COLOR,
      padding: resp.dy(14),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? colors.PRIMARY_COLOR : colors.LIGHT_GRAY,
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.08,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      elevation: 4,
      marginBottom: resp.dy(14),
    },
    avatar: {
      width: resp.dx(52),
      height: resp.dx(52),
      borderRadius: resp.dx(16),
      backgroundColor: colors.PRIMARY_COLOR + '20',
      justifyContent: 'center',
      alignItems: 'center',
    },
    avatarText: {
      color: colors.PRIMARY_COLOR,
      fontSize: resp.df(18),
      fontWeight: '700',
    },
    content: {
      flex: 1,
      marginLeft: resp.dx(12),
    },
    name: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(16),
      fontWeight: '700',
      marginBottom: resp.dy(4),
    },
    subject: {
      color: colors.SPACES_COLOR,
      fontSize: resp.df(13),
      marginBottom: resp.dy(10),
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    detailPill: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: resp.dx(12),
    },
    detailText: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(12),
    },
    actionWrapper: {
      backgroundColor: colors.PRIMARY_COLOR,
      borderRadius: resp.dx(16),
      paddingVertical: resp.dy(8),
      paddingHorizontal: resp.dx(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
    actionText: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(12),
      fontWeight: '700',
    },
  });