import { View, Text, StyleSheet } from "react-native";

export default function GalleryScreen() {
  return (
    <View style={styles.container}>
      <Text>GalleryScreen Page </Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightpink",
  },
})