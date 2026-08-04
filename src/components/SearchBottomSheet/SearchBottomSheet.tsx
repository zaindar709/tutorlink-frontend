import React, { useEffect, useMemo } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import {
  Gesture,
  GestureDetector,
  ScrollView,
} from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GLASS } from '../../theme/glass';

type SearchBottomSheetProps = {
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  title: string;
  countLabel: string;
  loading: boolean;
  onViewAll?: () => void;
  isEmpty?: boolean;
  emptyText?: string;
  colors: Record<string, unknown>;
  resp: {
    dx: (n: number) => number;
    dy: (n: number) => number;
    df: (n: number) => number;
  };
  children: React.ReactNode;
};

const SPRING = { damping: 24, stiffness: 240 };

const SearchBottomSheet: React.FC<SearchBottomSheetProps> = ({
  expanded,
  onExpandedChange,
  title,
  countLabel,
  loading,
  isEmpty,
  emptyText = 'No tutors found nearby.',
  colors,
  resp,
  children,
}) => {
  const insets = useSafeAreaInsets();
  const collapsedHeight = resp.dy(320) + insets.bottom;
  const expandedHeight = resp.dy(560) + insets.bottom;
  const snapRange = expandedHeight - collapsedHeight;

  const sheetHeight = useSharedValue(collapsedHeight);
  const dragStartHeight = useSharedValue(collapsedHeight);

  const styles = useMemo(
    () => createStyles(colors, resp),
    [colors, resp]
  );

  const setExpanded = (value: boolean) => {
    onExpandedChange(value);
  };

  useEffect(() => {
    sheetHeight.value = withSpring(
      expanded ? expandedHeight : collapsedHeight,
      SPRING
    );
  }, [collapsedHeight, expanded, expandedHeight, sheetHeight]);

  const panGesture = Gesture.Pan()
    .activeOffsetY([-8, 8])
    .onStart(() => {
      dragStartHeight.value = sheetHeight.value;
    })
    .onUpdate(event => {
      const next = dragStartHeight.value - event.translationY;
      sheetHeight.value = Math.max(
        collapsedHeight,
        Math.min(expandedHeight, next)
      );
    })
    .onEnd(event => {
      const midPoint = collapsedHeight + snapRange * 0.45;
      const shouldExpand =
        event.velocityY < -400 || sheetHeight.value > midPoint;

      const target = shouldExpand ? expandedHeight : collapsedHeight;
      sheetHeight.value = withSpring(target, SPRING);
      runOnJS(setExpanded)(shouldExpand);
    });

  const sheetAnimatedStyle = useAnimatedStyle(() => ({
    height: sheetHeight.value,
  }));

  return (
    <Animated.View style={[styles.bottomSheet, sheetAnimatedStyle]}>
      <GestureDetector gesture={panGesture}>
        <View style={styles.dragArea}>
          <View style={styles.sheetHandle} />
          <View style={styles.listHeader}>
            <Text style={styles.listTitle}>{title}</Text>
            <Text style={styles.listCount}>{countLabel}</Text>
          </View>
        </View>
      </GestureDetector>

      {loading ? (
        <ActivityIndicator style={styles.loader} />
      ) : isEmpty ? (
        <Text style={styles.emptyText}>{emptyText}</Text>
      ) : (
        <ScrollView
          style={styles.listContainer}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + resp.dy(16) },
          ]}
          showsVerticalScrollIndicator={false}
          bounces={expanded}
        >
          {children}
        </ScrollView>
      )}
    </Animated.View>
  );
};

export default SearchBottomSheet;

const createStyles = (
  colors: Record<string, unknown>,
  resp: SearchBottomSheetProps['resp']
) =>
  StyleSheet.create({
    bottomSheet: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#FFFFFF',
      borderTopLeftRadius: GLASS.radius.xxl,
      borderTopRightRadius: GLASS.radius.xxl,
      paddingTop: resp.dy(10),
      borderTopWidth: 1,
      borderColor: '#E8E8EE',
      ...GLASS.shadow.medium,
      overflow: 'hidden',
    },
    dragArea: {
      paddingBottom: resp.dy(4),
      alignItems: 'center',
    },
    sheetHandle: {
      alignSelf: 'center',
      width: resp.dx(44),
      height: resp.dy(5),
      borderRadius: resp.dx(4),
      backgroundColor: colors.LIGHT_GRAY as string,
      marginBottom: resp.dy(12),
    },
    listHeader: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: resp.dx(18),
      marginBottom: resp.dy(10),
    },
    listTitle: {
      fontSize: resp.df(18),
      fontWeight: '800',
      color: colors.BLACK_COLOR as string,
      textAlign: 'center',
    },
    listCount: {
      marginTop: resp.dy(4),
      fontSize: resp.df(13),
      color: colors.SPACES_COLOR as string,
      textAlign: 'center',
    },
    listContainer: {
      flex: 1,
      width: '100%',
      alignSelf: 'stretch',
    },
    listContent: {
      paddingHorizontal: resp.dx(16),
      width: '100%',
      alignItems: 'center',
    },
    loader: {
      marginTop: resp.dy(20),
      alignSelf: 'center',
    },
    emptyText: {
      textAlign: 'center',
      color: colors.SPACES_COLOR as string,
      fontSize: resp.df(14),
      marginTop: resp.dy(24),
      marginBottom: resp.dy(24),
      alignSelf: 'center',
    },
  });
