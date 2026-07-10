import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { Icon } from 'react-native-paper';

type Props = {
  colors: any;
  resp: any;

  title: string; // NEXT SESSION label
  timerText: string;

  name: string;
  subject: string;
  time: string;
  image: string;

  onJoin?: () => void;
  onMessage?: () => void;
  onAddCalendar?: () => void;
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
  onJoin,
  onMessage,
  onAddCalendar,
}: Props) => {
  const styles = createStyles(colors, resp);

  return (
    <View style={styles.card}>
      {/* TOP */}
      <View style={styles.topRow}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.timerBadge}>
          <Icon source="clock-outline" size={14} color="#fff" />
          <Text style={styles.timerText}>{timerText}</Text>
        </View>
      </View>

      {/* PROFILE */}
      <View style={styles.profileRow}>
        <View style={styles.imageWrapper}>
          <Image source={{ uri: image }} style={styles.image} />
          <View style={styles.onlineDot} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.subject}>{subject}</Text>

          <View style={styles.timeRow}>
            <Icon source="clock-outline" size={14} color={colors.SPACES_COLOR} />
            <Text style={styles.time}>{time}</Text>
          </View>
        </View>
      </View>

      {/* JOIN */}
      <TouchableOpacity style={styles.joinBtn} onPress={onJoin}>
        <Icon source="video-outline" size={18} color="#fff" />
        <Text style={styles.joinText}>Join Class Now</Text>
      </TouchableOpacity>

      {/* ACTIONS */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.secondaryBtn} onPress={onMessage}>
          <Icon source="message-outline" size={18} color={colors.BLACK_COLOR} />
          <Text style={styles.secondaryText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryBtn} onPress={onAddCalendar}>
          <Icon source="plus" size={18} color={colors.BLACK_COLOR} />
          <Text style={styles.secondaryText}>Add to Calendar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default SessionCard;

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    card: {
      marginHorizontal: resp.dx(20),
      marginTop: resp.dy(20),
      backgroundColor: '#F6F0FF',
      borderRadius: resp.dx(26),
      padding: resp.dx(20),
    },

    topRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: resp.dy(18),
    },

    title: {
      color: '#2F6BFF',
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
    },

    image: {
      width: '100%',
      height: '100%',
    },

    onlineDot: {
      position: 'absolute',
      bottom: 3,
      right: 3,
      width: resp.dx(14),
      height: resp.dx(14),
      borderRadius: resp.dx(7),
      backgroundColor: '#20D67B',
      borderWidth: 2,
      borderColor: '#fff',
    },

    info: {
      flex: 1,
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
      backgroundColor: '#2F6BFF',
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
    },

    secondaryBtn: {
      width: '48%',
      height: resp.dy(52),
      borderRadius: resp.dx(16),
      backgroundColor: '#fff',
      borderWidth: 1,
      borderColor: '#E8E8E8',
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