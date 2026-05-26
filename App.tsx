import { View, Text, StyleSheet } from "react-native";
import GalleryScreen from "./src/screens/GalleryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";

export default function App() {
  return (
    <View style={{flex:1}}>
      <LoginScreen/>
    </View>
  )
}