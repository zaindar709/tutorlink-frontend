import {StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import CustomButton from '../../../CustomButton';
import GradientSurface from '../../../GradientSurface';

export const BookingRequestCard = ({
  item,
  colors,
  resp,
  onAccept,
  onDecline,
}: any) => {
  return (
    <View style={styles(colors, resp).requestCard}>
      <View style={styles(colors, resp).requestTopRow}>
        <GradientSurface variant="primaryButton" style={styles(colors, resp).avatar}>
          <MaterialCommunityIcons
            name="account-outline"
            size={20}
            color="#fff"
          />
        </GradientSurface>

        <View style={{flex: 1}}>
          <Text style={styles(colors, resp).studentName}>
            {item.name}
          </Text>

          <Text style={styles(colors, resp).requestTime}>
            {item.time}
          </Text>
        </View>
      </View>

      <View style={styles(colors, resp).subjectRow}>
        <View style={styles(colors, resp).subjectItem}>
          <MaterialCommunityIcons
            name="book-outline"
            size={15}
            color="#9CA3AF"
          />

          <Text style={styles(colors, resp).subjectText}>
            {item.subject}
          </Text>
        </View>

        <View style={styles(colors, resp).subjectItem}>
          <MaterialCommunityIcons
            name="calendar-blank-outline"
            size={15}
            color="#9CA3AF"
          />

          <Text style={styles(colors, resp).subjectText}>
            {item.grade}
          </Text>
        </View>
      </View>

      <View style={styles(colors, resp).actionRow}>
        <CustomButton
          title="Accept"
          onPress={onAccept}
          style={styles(colors, resp).acceptBtn}
        />

        <CustomButton
          title="Decline"
          textColor="#374151"
          onPress={onDecline}
          style={styles(colors, resp).declineBtn}
        />
      </View>
    </View>
  );
};

const styles = (colors: any, resp: any) =>
  StyleSheet.create({
    requestCard: {
      backgroundColor: '#fff',
      borderRadius: resp.dx(18),
      padding: resp.dx(14),
      marginBottom: resp.dx(16),

      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.06,
      shadowRadius: 6,

      elevation: 3,
    },

    requestTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    avatar: {
      width: resp.dx(38),
      height: resp.dy(38),
      borderRadius: resp.dx(19),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(12),
      overflow: 'hidden',
    },

    studentName: {
      fontSize: resp.df(16),
      fontWeight: '600',
      color: '#111827',
    },

    requestTime: {
      fontSize: resp.df(12),
      color: '#6B7280',
      marginTop: resp.dy(2),
    },

    subjectRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: resp.dy(18),
      gap: resp.dy(16),
    },

    subjectItem: {
      flexDirection: 'row',
      alignItems: 'center',
    },

    subjectText: {
      fontSize: resp.df(13),
      color: '#4B5563',
      marginLeft: resp.dx(5),
    },

    actionRow: {
      flexDirection: 'row',
      marginTop: resp.dy(18),
    },

    acceptBtn: {
      flex: 1,
      height: resp.dy(42),
      borderRadius: resp.dx(12),
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: resp.dx(8),
    },

    declineBtn: {
      flex: 1,
      height: resp.dy(42),
      backgroundColor: '#F3F4F6',
      borderRadius: resp.dx(12),
      justifyContent: 'center',
      alignItems: 'center',
    },
  });