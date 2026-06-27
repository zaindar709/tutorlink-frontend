import { useMemo } from "react";
import useColors from "./useColors";
import useResp from "./useResp";
import { StyleSheet } from "react-native";

const useStyles = () => {
  const colors = useColors();
  const resp = useResp();
  const appStyles = useMemo(
    () =>
      StyleSheet.create({
        full: {
          width: "100%",
          height: "100%",
        },
        screen: {
          flex: 1,
          width: "100%",
          height: "100%",
          backgroundColor: colors.BACKGROUND,
        },
        allCenter: {
          justifyContent: "center",
          alignItems: "center",
          alignSelf: "center",
        },
        button: {
          height: resp.dm(50),
          width: resp.pw(90),
          borderRadius: resp.dxy(20),
        },
        groupButton: {
          height: resp.dm(90),
          width: resp.pw(90),
          borderRadius: resp.dxy(12),
        },
        screenHeading: {
          fontSize: resp.dfs(2.1),
          fontWeight: "600",
          color: colors.SECONDARY_COLOR,
        },
        authLogo: {
          height: resp.pw(50),
          width: resp.pw(50),
          marginVertical: resp.dy(48),
          alignSelf: "center",
        },
        sheetTitle: {
          color: colors.SECONDARY_COLOR,
          fontWeight: "bold",
          fontSize: resp.dfs(2),
        },
        sheetDesc: {
          color: colors.BLACK_COLOR,
          fontWeight: "300",
          fontSize: resp.dfs(1.5),
        },
        sheetButtonYes: {
          marginTop: resp.dy(32),
        },
        sheetButtonYesText: {},
        sheetButtonNoText: {},
      }),
    [colors, resp],
  );
  return appStyles;
};

export default useStyles;
