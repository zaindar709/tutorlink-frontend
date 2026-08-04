import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { GLASS } from '../../../../theme/glass';

interface Props {
  item: any;
  colors: any;
  resp: any;
  onStartClassroom?: () => void;
  onMessage?: () => void;
}

export const TodaySessionCard = ({
  item,
  colors,
  resp,
  onStartClassroom,
  onMessage,
}: Props) => {
  return (
    <View style={styles(resp).card}>
      <View style={styles(resp).topRow}>
        <View style={styles(resp).iconBox}>
          <Ionicons
            name="time-outline"
            size={resp.df(22)}
            color="#3366E8"
          />
        </View>

        <View style={styles(resp).infoContainer}>
          <Text style={styles(resp).name}>{item.name}</Text>
          <Text style={styles(resp).subject}>{item.subject}</Text>
        </View>

        <View style={styles(resp).timeContainer}>
          <Text style={styles(resp).time}>{item.time}</Text>
          <Text style={styles(resp).duration}>{item.duration}</Text>
        </View>
      </View>

      <View style={styles(resp).actions}>
        <TouchableOpacity
          style={styles(resp).secondaryButton}
          onPress={onMessage}
        >
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={resp.df(16)}
            color="#3366E8"
          />
          <Text style={styles(resp).secondaryButtonText}>Message</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles(resp).button}
          onPress={onStartClassroom}
        >
          <Ionicons
            name="videocam-outline"
            size={resp.df(16)}
            color="#fff"
          />
          <Text style={styles(resp).buttonText}>Start Classroom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = (resp: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: GLASS.cardBg,
      borderRadius: GLASS.radius.xl,
      padding: resp.dx(14),
      marginBottom: resp.dy(12),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },

    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    iconBox: {
      width: resp.dx(42),
      height: resp.dx(42),
      borderRadius: resp.dx(12),
      backgroundColor: GLASS.cardBgStrong,
      justifyContent: 'center',
      alignItems: 'center',
    },

    infoContainer: {
      flex: 1,
      marginLeft: resp.dx(12),
    },

    name: {
      fontSize: resp.df(15),
      fontWeight: '700',
      color: '#111827',
    },

    subject: {
      fontSize: resp.df(13),
      color: '#64748B',
      marginTop: 2,
    },

    timeContainer: {
      alignItems: 'flex-end',
    },

    time: {
      fontSize: resp.df(15),
      fontWeight: '700',
      color: '#3366E8',
    },

    duration: {
      fontSize: resp.df(12),
      color: '#64748B',
      marginTop: 4,
    },

    actions: {
      marginTop: resp.dy(14),
      flexDirection: 'row',
      gap: resp.dx(8),
    },

    secondaryButton: {
      flex: 1,
      height: resp.dy(46),
      borderRadius: resp.dx(12),
      backgroundColor: GLASS.cardBgStrong,
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    secondaryButtonText: {
      color: GLASS.primary,
      fontWeight: '700',
      fontSize: resp.df(13),
      marginLeft: resp.dx(6),
    },

    button: {
      flex: 1.4,
      height: resp.dy(46),
      borderRadius: resp.dx(12),
      backgroundColor: '#3366E8',
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },

    buttonText: {
      color: '#fff',
      fontWeight: '700',
      fontSize: resp.df(13),
      marginLeft: resp.dx(8),
    },
  });
