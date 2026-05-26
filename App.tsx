import { View, Text, StyleSheet } from "react-native";
import GalleryScreen from "./src/screens/GalleryScreen";
import HomeScreen from "./src/screens/HomeScreen";
import LoginScreen from "./src/screens/LoginScreen";
import AddClientes from "./src/screens/AddClientes";

export default function App() {
  return (
    <View style={{flex:1}}>
      <AddClientes/>
    </View>
  )
}