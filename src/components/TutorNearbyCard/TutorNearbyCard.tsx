import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import { GLASS } from '../../theme/glass';

const DEFAULT_AVATAR =
  'https://randomuser.me/api/portraits/lego/1.jpg';

type TutorNearbyCardProps = {
  name: string;
  subject: string;
  distance: string;
  rating: number;
  avatarUrl?: string;
  isSelected: boolean;
  onPress: () => void;
};

const TutorNearbyCard: React.FC<TutorNearbyCardProps> = ({
  name,
  subject,
  distance,
  rating,
  avatarUrl,
  isSelected,
  onPress,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp, isSelected);
  const roundedRating = Math.round(rating);

  return (
    <TouchableOpacity style={styles.card} activeOpacity={0.85} onPress={onPress}>
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: avatarUrl || DEFAULT_AVATAR }}
          style={styles.avatarImage}
        />
        <View style={styles.onlineDot} />
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.subject} numberOfLines={1}>
          {subject}
        </Text>

        <View style={styles.ratingRow}>
          {[...Array(5)].map((_, index) => (
            <Icon
              key={index}
              source="star"
              size={resp.df(13)}
              color={
                index < roundedRating
                  ? (colors.YELLOW_COLOR as string)
                  : (colors.GRAY_COLOR as string)
              }
            />
          ))}
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>

        <View style={styles.detailsRow}>
          <View style={styles.detailPill}>
            <Icon
              source="map-marker-radius"
              size={14}
              color={colors.PRIMARY_COLOR as string}
            />
            <Text style={styles.detailText}>{distance}</Text>
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
      alignSelf: 'center',
      minHeight: resp.dy(108),
      borderRadius: GLASS.radius.xl,
      backgroundColor: '#FFFFFF',
      padding: resp.dy(14),
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: isSelected ? 2 : 1,
      borderColor: isSelected ? GLASS.primary : GLASS.cardBorder,
      ...GLASS.shadow.soft,
      marginBottom: resp.dy(14),
    },
    avatarWrapper: {
      width: resp.dx(56),
      height: resp.dx(56),
      borderRadius: resp.dx(18),
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    onlineDot: {
      position: 'absolute',
      bottom: 2,
      right: 2,
      width: resp.dx(11),
      height: resp.dx(11),
      borderRadius: resp.dx(6),
      backgroundColor: '#1ED760',
      borderWidth: 2,
      borderColor: colors.WHITE_COLOR,
    },
    content: {
      flex: 1,
      marginLeft: resp.dx(12),
    },
    name: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(16),
      fontWeight: '700',
      marginBottom: resp.dy(2),
    },
    subject: {
      color: colors.SPACES_COLOR,
      fontSize: resp.df(13),
      marginBottom: resp.dy(6),
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(2),
      marginBottom: resp.dy(6),
    },
    ratingText: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(12),
      fontWeight: '600',
      marginLeft: resp.dx(4),
    },
    detailsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
    },
    detailPill: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    detailText: {
      color: colors.GRAY_COLOR,
      fontSize: resp.df(12),
      marginLeft: resp.dx(4),
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
