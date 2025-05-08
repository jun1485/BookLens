import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { AppNavigation } from "./src/navigation";
import { ThemeContext } from "./src/utils/ThemeContext";
import { THEME } from "./src/utils/theme";

export default function App() {
  return (
    <ThemeContext.Provider value={THEME}>
      <SafeAreaProvider>
        <AppNavigation />
      </SafeAreaProvider>
    </ThemeContext.Provider>
  );
}
