import React, { memo, ReactNode, useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import useUi from '../../../hooks/ui/useUi';
import BackButton from '../../BackButton/BackButton';

interface AuthHeaderProps {
  title: string;
  subtitle: string;

  // customizations
  titleStyle?: any;
  subtitleStyle?: any;
  containerStyle?: any;
  contentContainerStyle?: any;

  // custom icon
  topIcon?: ReactNode;

  // custom brand
  brandTitle?: string;
  showBrand?: boolean;
}

const AuthHeader = ({
  title,
  subtitle,

  titleStyle,
  subtitleStyle,
  containerStyle,
  contentContainerStyle,

  topIcon,

  brandTitle = 'TutorLink',
  showBrand = true,
}: AuthHeaderProps) => {
  const navigation = useNavigation<any>();
  const { colors, resp } = useUi();

  const styles = useMemo(
    () => createStyles(colors, resp),
    [colors, resp],
  );

  return (
    <View style={[styles.headerContainer, containerStyle]}>
      {/* BACK BUTTON */}
      <BackButton
        color="#FFFFFF"
        onPress={() => navigation.goBack()}
      />

      <View style={{ paddingHorizontal: resp.dx(10) }}>
        {/* TOP ICON */}
        {topIcon && (
          <View style={styles.iconWrapper}>{topIcon}</View>
        )}

        {/* BRAND */}
        {showBrand && (
          <View style={styles.brandWrapper}>
            <Text style={styles.brandTitle}>
              {brandTitle}
            </Text>
          </View>
        )}

        {/* CONTENT */}
        <View
          style={[
            styles.headerContent,
            contentContainerStyle,
          ]}>
          <Text style={[styles.heading, titleStyle]}>
            {title}
          </Text>

          <Text
            style={[styles.subHeading, subtitleStyle]}>
            {subtitle}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default memo(AuthHeader);

const createStyles = (colors: any, resp: any) =>
  StyleSheet.create({
    headerContainer: {
      backgroundColor: colors.PRIMARY_COLOR,
      minHeight: resp.dy(250),
      paddingTop: resp.dy(40),
      paddingHorizontal: resp.dx(5),
      paddingBottom: resp.dy(20),
      borderBottomLeftRadius: resp.df(28),
      borderBottomRightRadius: resp.df(28),
    },

    iconWrapper: {
      alignItems: 'center',
      marginBottom: resp.dy(12),
    },

    brandWrapper: {
      marginBottom: resp.dy(10),
    },

    brandTitle: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(24),
      fontWeight: '700',
    },

    headerContent: {
      marginTop: resp.dy(10),
      gap: resp.dy(10),
    },

    heading: {
      color: colors.WHITE_COLOR,
      fontSize: resp.df(18),
      fontWeight: '700',
    },

    subHeading: {
      color: '#DCE6FF',
      fontSize: resp.df(13),
      lineHeight: resp.dy(20),
    },
  });