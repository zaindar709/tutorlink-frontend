import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { Icon } from 'react-native-paper';
import useUi from '../../hooks/ui/useUi';
import CustomButton from '../CustomButton';

type TopTutorCardProps = {
  image: any;
  name: string;
  subject: string;
  rating: number;
  badge: string;
  onHire: () => void;
};

const TopTutorCard: React.FC<TopTutorCardProps> = ({
  image,
  name,
  subject,
  rating,
  badge,
  onHire,
}) => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        <Image source={image} style={styles.tutorImage} />
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.tutorName}>{name}</Text>
        <Text style={styles.subject}>{subject}</Text>

        <View style={styles.ratingRow}>
          {[...Array(5)].map((_, index) => (
            <Icon
              key={index}
              source="star"
              size={resp.df(14)}
              color={
                index < Math.round(rating)
                  ? colors.YELLOW_COLOR as string
                  : colors.GRAY_COLOR as string
              }
            />
          ))}
          <Text style={styles.ratingText}>{rating.toFixed(1)}</Text>
        </View>

        <View style={styles.badgeRow}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      </View>
      <CustomButton title="Hire Tutor" onPress={onHire} />
    </View>
  );
};

export default TopTutorCard;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.WHITE_COLOR,
      borderRadius: resp.dx(24),
      padding: resp.dx(18),
      shadowColor: colors.BLACK_COLOR,
      shadowOpacity: 0.08,
      shadowRadius: 18,
      shadowOffset: { width: 0, height: 8 },
      elevation: 4,
      marginTop: resp.dy(10),
      marginBottom: resp.dy(20),
    },
    imageContainer: {
      width: '100%',
      height: resp.dy(180),
      borderRadius: resp.dx(20),
      marginBottom: resp.dy(14),
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center',
    },

    tutorImage: {
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    },
    infoSection: {
      marginBottom: resp.dy(16),
    },
    tutorName: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(18),
      fontWeight: '700',
      marginBottom: resp.dy(4),
    },
    subject: {
      color: colors.SPACES_COLOR,
      fontSize: resp.df(14),
      marginBottom: resp.dy(12),
    },
    ratingRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: resp.dx(6),
      marginBottom: resp.dy(10),
    },
    ratingText: {
      color: colors.BLACK_COLOR,
      fontSize: resp.df(14),
      fontWeight: '600',
    },
    badgeRow: {
      backgroundColor: colors.BRIGHT_COLOR,
      alignSelf: 'flex-start',
      paddingVertical: resp.dy(6),
      paddingHorizontal: resp.dx(10),
      borderRadius: resp.dx(14),
    },
    badgeText: {
      color: colors.Green_Color,
      fontSize: resp.df(12),
      fontWeight: '600',
    },
    actionText: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(15),
      fontWeight: '700',
    },
  });
