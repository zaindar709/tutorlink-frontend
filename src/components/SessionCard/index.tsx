import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';
import { GLASS } from '../../theme/glass';

type Props = {
  colors: any;
  resp: any;

  title: string;
  timerText: string;

  name: string;
  subject: string;
  time: string;
  image: string;

  showJoin?: boolean;
  onJoin?: () => void;
  onMessage?: () => void;
  onAddCalendar?: () => void;
  onPress?: () => void;
};

const SessionCard = ({
  colors,
  resp,
  title,
  timerText,
  name,
  subject,
  time,
  image,
  showJoin = true,
  onJoin,
  onMessage,
  onAddCalendar,
  onPress,
}: Props) => {
  const styles = createStyles(colors, resp);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={onPress ? 0.92 : 1}
      disabled={!onPress}
      onPress={onPress}
    >
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.timerBadge}>
          <Icon source="clock-outline" size={14} color="#fff" />
          <Text style={styles.timerText}>{timerText}</Text>
        </View>
      </View>

      <View style={styles.profileRow}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.image} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.subject} numberOfLines={1}>
            {subject}
          </Text>

          <View style={styles.timeRow}>
            <Icon source="clock-outline" size={14} color={colors.SPACES_COLOR} />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </View>

      {showJoin ? (
        <TouchableOpacity
          style={styles.joinBtn}
          onPress={e => {
            e?.stopPropagation?.();
            onJoin?.();
          }}
        >
          <Icon source="video-outline" size={18} color="#fff" />
          <Text style={styles.joinText}>Join Class Now</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.secondaryBtn}
          onPress={e => {
            e?.stopPropagation?.();
            onMessage?.();
          }}
        >
          <Icon source="message-outline" size={18} color={colors.BLACK_COLOR} />
          <Text style={styles.secondaryText}>Message</Text>
        </TouchableOpacity>

        {onAddCalendar ? (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={e => {
              e?.stopPropagation?.();
              onAddCalendar();
            }}
          >
            <Icon source="plus" size={18} color={colors.BLACK_COLOR} />
            <Text style={styles.secondaryText}>Add to Calendar</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={e => {
              e?.stopPropagation?.();
              onPress?.();
            }}
          >
            <Icon source="eye-outline" size={18} color={colors.BLACK_COLOR} />
            <Text style={styles.secondaryText}>View details</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default SessionCard;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    card: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(20),
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xxl,
      padding: resp.dx(20),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: resp.dy(18),
    },

    title: {
      color: GLASS.primary,
      fontWeight: '800',
      fontSize: resp.df(12),
    },

    timerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FF4D4F',
      paddingHorizontal: resp.dx(12),
      paddingVertical: resp.dy(8),
      borderRadius: resp.dx(20),
    },

    timerText: {
      color: '#fff',
      marginLeft: resp.dx(6),
      fontWeight: '700',
      fontSize: resp.df(12),
    },

    profileRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    imageWrapper: {
      width: resp.dx(64),
      height: resp.dx(64),
      borderRadius: resp.dx(18),
      overflow: 'hidden',
      marginRight: resp.dx(14),
      backgroundColor: GLASS.primarySoft,
    },

    image: {
      width: '100%',
      height: '100%',
    },

    info: {
      flex: 1,
      minWidth: 0,
    },

    name: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: colors.BLACK_COLOR,
    },

    subject: {
      marginTop: resp.dy(5),
      fontSize: resp.df(14),
      color: colors.SPACES_COLOR,
    },

    timeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(10),
    },

    time: {
      marginLeft: resp.dx(6),
      fontSize: resp.df(13),
      color: colors.SPACES_COLOR,
      fontWeight: '500',
    },

    joinBtn: {
      height: resp.dy(54),
      borderRadius: resp.dx(18),
      backgroundColor: GLASS.primary,
      marginTop: resp.dy(22),
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    joinText: {
      color: '#fff',
      fontSize: resp.df(16),
      fontWeight: '700',
      marginLeft: resp.dx(8),
    },

    actions: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: resp.dy(14),
      gap: 10,
    },

    secondaryBtn: {
      flex: 1,
      height: resp.dy(52),
      borderRadius: resp.dx(16),
      backgroundColor: GLASS.cardBg,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },

    secondaryText: {
      marginLeft: resp.dx(8),
      fontWeight: '600',
      color: colors.BLACK_COLOR,
      fontSize: resp.df(13),
    },
  });
