import { useCallback, useMemo, useState } from "react";
import { Dimensions } from "react-native";
import useOrientation from "./useOrientation";

const screen = Dimensions.get("screen");

const useResp = () => {
  const [figmaTotalFrameWidth] = useState(430);
  const [figmaTotalFrameHeight] = useState(932);
  const [shouldUseForBiggerSizes] = useState(true);

  const {
    orientation,
    changedWindow,
  } = useOrientation();

  const {
    height, width
  } = changedWindow

  const alphaX = useMemo(() => width / figmaTotalFrameWidth, [width, figmaTotalFrameWidth]);

  const alphaY = useMemo(
    () => height / figmaTotalFrameHeight,
    [height, figmaTotalFrameHeight],
  );

  const alphaXY = useMemo(
    () => Math.sqrt(Math.pow(Math.sqrt(alphaX * alphaY), 2)),
    [alphaX, alphaY],
  );

  /** dx - dynamic width */
  const dx = useCallback(
    (size: number) => {
      return size * alphaX;
    },
    [alphaX],
  );

  /** dy - dynamic height */
  const dy = useCallback(
    (size: number) => {
      return size * alphaY;
    },
    [alphaX],
  );

  /** dxy - dynamic width*height pixels */
  const dxy = useCallback(
    (size: number) => {
      return alphaXY * size;
    },
    [alphaXY],
  );

  /** dm - dynamic max pixels */
  const dm = useCallback(
    (size: number) => Math.max(dx(size), dy(size), dxy(size)),
    [dx, dy, dxy],
  );

  /** df - dynamic font size */
  const df = useCallback(
    (size: number) => Math.max(dx(size), dy(size), dxy(size)),
    [dx, dy, dxy],
  );

  /** dfs - dynamic font scale */
  const dfs = useCallback((scale: number) => df(10 * scale), [df]);

  /** pw - percentage to width */
  const pw = useCallback(
    (percentage: number) => width * (percentage / 100),
    [width],
  );

  /** ph - percentage to height */
  const ph = useCallback(
    (percentage: number) => height * (percentage / 100),
    [height],
  );
  const typography = {
    Bold: 'RethinkSans-Bold',
    ExtraBold: 'RethinkSans-ExtraBold',
    Light: 'RethinkSans-Italic',
    Medium: 'RethinkSans-Medium',
    Regular: 'RethinkSans-Regular',
    SemiBold: 'RethinkSans-SemiBold',
    SF_Bold: 'SF-Pro-Text-Bold',
    SF_Light: 'SF-Pro-Text-Light',
    SF_Medium: 'SF-Pro-Text-Medium',
    SF_Regular: 'SF-Pro-Text-Regular',
    SF_SemiBold: 'SF-Pro-Text-Semibold',
  }

  return {
    dy,
    df,
    dm,
    dx,
    dfs,
    dxy,
    pw,
    ph,
    width,
    height,
    sWidth: screen.width,
    sHeight: screen.height,
    orientation,
    shouldUseForBiggerSizes,
    changedWindow,
    typography
  };
};

export default useResp;
