import { useEffect, useState } from "react";
import { Dimensions, ScaledSize } from "react-native";

const useOrientation = () => {
  const [orientation, setOrientation] = useState<"portrait" | "landscape">();
  const [changedWindow, setChangedWindow] = useState<ScaledSize>(
    Dimensions.get("window"),
  );

  useEffect(() => {
    const listener = Dimensions.addEventListener("change", (handler) => {
      setOrientation(
        handler.screen.width > handler.screen.height ? "landscape" : "portrait",
      );
      setChangedWindow(handler.window);
    });
    return () => {
      listener.remove();
    };
  }, []);

  return { orientation, changedWindow };
};

export default useOrientation;
