import { StyleSheet, View, Text } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import useUi from '../../hooks/ui/useUi';

export const OrDivider = () => {
  const { colors, resp } = useUi();
  const styles = createStyles(colors, resp);

  return (
    <View style={styles.dividerContainer}>
      {/* Left Gradient Line */}
      <LinearGradient
        colors={[
          'transparent',
          String(colors.GRAY_COLOR || '#D1D5DB'),
          'transparent',
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.line}
      />

      <Text style={styles.text}>OR</Text>

      {/* Right Gradient Line */}
      <LinearGradient
        colors={[
          'transparent',
          String(colors.GRAY_COLOR || '#D1D5DB'),
          'transparent',
        ]}
        start={{ x: 1, y: 0 }}
        end={{ x: 0, y: 0 }}
        style={styles.line}
      />
    </View>
  );
};

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    dividerContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: resp.dy(12),
    },
    line: {
      flex: 1,
      height: 1,
    },
    text: {
      marginHorizontal: resp.dx(10),
      fontSize: resp.df(12),
      color: colors.TEXT_COLOR || '#000',
      fontWeight: '600',
    },
  });
