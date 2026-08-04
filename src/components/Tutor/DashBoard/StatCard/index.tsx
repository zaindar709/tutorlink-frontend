import { StyleSheet, Text, View } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { GLASS } from '../../../../theme/glass';

const StatCard = ({ item, colors, resp }: any) => {
  return (
    <View style={styles(colors, resp).cardWrapper}>
      <View
        style={[
          styles(colors, resp).statCard,
          {
            backgroundColor: item.bg,
          },
        ]}
      >
        <View style={styles(colors, resp).statIconBox}>
          <MaterialCommunityIcons
            name={item.icon}
            size={20}
            color={item.iconColor}
          />
        </View>

        <Text style={styles(colors, resp).statValue}>{item.value}</Text>

        <Text style={styles(colors, resp).statTitle}>{item.title}</Text>
      </View>
    </View>
  );
};

export default StatCard;

const styles = (_colors: any, resp: any) =>
  StyleSheet.create({
    cardWrapper: {
      marginTop: resp.dy(20),
    },

    statsList: {
      justifyContent: 'space-between',
      marginTop: resp.dy(40),
    },

    statCard: {
      width: resp.dx(105),
      borderRadius: GLASS.radius.lg,
      paddingVertical: resp.dy(18),
      alignItems: 'center',
      marginRight: resp.dx(10),
      borderWidth: 1,
      borderColor: GLASS.cardBorder,
      ...GLASS.shadow.soft,
    },

    statIconBox: {
      width: resp.dx(38),
      height: resp.dy(38),
      borderRadius: resp.dx(12),
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: resp.dy(10),
      backgroundColor: GLASS.cardBgStrong,
    },

    statValue: {
      fontSize: resp.df(22),
      fontWeight: '700',
      color: GLASS.textPrimary,
    },

    statTitle: {
      fontSize: resp.df(12),
      color: GLASS.textSecondary,
      marginTop: resp.dy(4),
    },
  });
