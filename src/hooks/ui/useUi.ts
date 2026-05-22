import useColors from "./useColors";
import useResp from "./useResp";
import useStyles from "./useStyles";

const useUi = () => {
  const resp = useResp();
  const colors = useColors();
  const appStyles = useStyles();

  return { resp, colors, appStyles };
};

export default useUi;
