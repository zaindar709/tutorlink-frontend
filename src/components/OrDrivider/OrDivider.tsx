import { StyleSheet, View, Text } from 'react-native';
import useUi from '../../ui/useUi';
import { Divider } from 'react-native-paper';

export const OrDivider = () => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);
  return (
    <View style={styles.dividerContainer}>
      <Divider style={styles.line} />
      <Text style={styles.text}>OR</Text>
      <Divider style={styles.line} />
    </View>
  );
};
const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: 10,
    },
    line: {
      flex: 1,
      height: 1,
    },
    text: {
      marginHorizontal: 10,
      fontSize: 12,
      color: '#000000',
    },
  });
