import { useColorScheme, ColorValue, ColorSchemeName } from "react-native";
import { useCallback } from "react";
import { GRADIENTS } from "../../constants/gradients";

export const useAppColorScheme = (): ColorSchemeName => {
  // Should be from redux - if there's need to change color scheme on runtime.
  return "light";
};

const useColors = () => {
  const scheme: ColorSchemeName = useAppColorScheme() || useColorScheme();
  const getColor = useCallback(
    (lightColor: ColorValue, darkColor?: ColorValue) =>
      scheme === "dark" && !!darkColor ? darkColor : lightColor,
    [scheme],
  );
  const colors = {

    BLACK: getColor("#000000", '#000000'),
    PRIMARY_BLACK_COLOR: getColor("rgba(25, 25, 25, 1)", 'rgba(25, 25, 25, 1)'),
    BLACK_COLOR: getColor("#0A0E0D", "#0A0E0D"),
    CULTURED_GRAY: getColor("#F9F7F1", "#F9F7F1"),
    EERIE_Black: getColor("#191919", "#191919"),
    PLACEHOLDER_TEXTCOLOR: getColor("#989796", "#989796"),
    LICORICE_BLACK: getColor("#17150D", "#17150D"),
    BLACK_OLIVE: getColor("#3F3D38", "#3F3D38"),
    SPACES_COLOR: getColor("#5C5C68", "#5C5C68"),
    GRAY11: getColor("#1C1C1C", "#1C1C1C"),
    GRAY31: getColor("#4F4F4F", "#4F4F4F"),
    LIGHT_GRAY: getColor("#6B7280", "#6B7280"),
    PRIMARY_GRAY_COLO1: getColor("rgb(171, 171, 171)", "rgb(171, 171, 171)"),
    PRIMARY_GRAY_COLOR: getColor("rgb(241, 241, 241)", "rgb(241, 241, 241)"),
    BRIGHT_COLOR: getColor("#99F6FF10", "#99F6FF10"),
    BACKGROUND: getColor("#f8fbff"),
    ARSENIC_COLOR: getColor("#3d3e48", "#3d3e48"),
    LIGHT_GRAY_COLOR: getColor("#D9D9D9", "#D9D9D9"),
    HOME_BG_COLOR: getColor("#051615", "#051615"),
    SECONDARY_COLOR: getColor("#262626", "#262626"),
    DARK_GRAY_COLOR: getColor("#1E1E1E", "#1E1E1E"),
    Dolphin_GARY: getColor("#787879", "#787879"),
    GRAY_COLOR: getColor("#D1D5DB", "#D1D5DB"),
    TAB_GRAY_COLOR: getColor("#8C8C8C", "#8C8C8C"),
    PRIMARY_COLOR: getColor("rgba(117,72,245,1)"),
    PRIMARY_LIGHT: getColor("#8F73FD", "#8F73FD"),
    PRIMARY_DARK: getColor("#5B4FF5", "#5B4FF5"),
    LIGHT_PRIMARY: getColor("#EDE9FE", "#EDE9FE"),
    TEXT_PRIMARY: getColor("#0A0E0D", "#0A0E0D"),
    TEXT_SECONDARY: getColor("#6B7280", "#6B7280"),
    TEXT_COLOR: getColor("#4F4F4F", "#4F4F4F"),
    BACKGROUND_COLOR: getColor("#f8fbff", "#f8fbff"),
    INACTIVE_COLOR: getColor("#9CA3AF", "#9CA3AF"),
    BORDER_COLOR: getColor("#E5E7EB", "#E5E7EB"),
    PRIMARY_GRADIENT: GRADIENTS.primary,
    PRIMARY_SOFT_GRADIENT: GRADIENTS.primarySoft,
    PRIMARY_HEADER_GRADIENT: GRADIENTS.primaryHeader,
    PRIMARY_CARD_GRADIENT: GRADIENTS.primaryCard,
    PRIMARY_BUTTON_GRADIENT: GRADIENTS.primaryButton,
    WHITE_COLOR: getColor("#fff", "#fff"),
    TRANSPARENT: getColor("transparent", "transparent"),
    YELLOW_COLOR: getColor("#FFD400", "#FFD400"),
    NAPLES_YELLOW: getColor("#F7CD5A", "#F7CD5A"),
    ORANGE_COLOR: getColor("#FFBA49", "#FFBA49"),
    EMPTY_STARS_COLOR: getColor("#9B9B9B", "#9B9B9B"),
    CHAT_PRIMARY_COLOR: getColor("#062A22", "#062A22"),
    CHAT_SECONDARY_COLOR: getColor("#232928", "#232928"),
    RED: getColor("rgba(234,78,81,1)"),
    ERROR_COLOR: getColor("#EE6464", "#EE6464"),
    WHITE_OPACITY_COLOR: getColor("rgba(255,255,255,0.2)", "rgba(255,255,255,0.2)"),
    BLACK_OPACITY_COLOR: getColor("rgba(0,0,0,0.6)", "rgba(0,0,0,0.6)"),
    Header_Color: getColor("#FDF7EA"),
    Income_Icon_Card_Color: getColor("#4AA570"),
    Expense_Card_Color: getColor("#FD3C4A"),
    Green_Color: getColor("rgba(74,165, 122, 1)"),
    Blue_Color: getColor("rgba(46,120,246,1)"),
    Report_Chip_Color: getColor('#FCFCFC')
  };
  return colors;
};

export default useColors;
