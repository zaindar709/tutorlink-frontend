import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import React from 'react';
import RootNavigator from './src/navigations/RootNavigator/RootNavigator';

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
}
// export default function App() {
//   return (
//     <View style={{ flex: 1, backgroundColor: 'red', justifyContent: 'center', alignItems: 'center' }}>
//       <Text style={{ color: 'white', fontSize: 20 }}>Testing Connection</Text>
//     </View>
//   )
// }