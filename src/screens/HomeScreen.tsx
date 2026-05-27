import { View, Text, StyleSheet } from "react-native";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.spaceHeader}>
        <View style={styles.spaceLogo}>

        </View>

        <View style={styles.spaceUser}>

        </View>
      </View>

      <View style={styles.spaceBody}>

          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
          <View style={styles.spaceItem}>

          </View>
      </View>


    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "lightblue",
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceHeader: {
    flex: 0,
    borderWidth: 1,
    width: '90%',
    height: '10%',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  spaceLogo: {
    width: 200,
    borderWidth: 1,
    marginLeft: 5,
    height: 70,
    borderRadius: 20

  },

  spaceUser: {
    borderWidth: 1,
    width: 70,
    height: 70,
    borderRadius: 200,
    marginRight: 5
  },

  spaceBody: {
    flex: 0,
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
    width: '90%',
    height: '85%',
    flexWrap: "wrap",
    justifyContent: 'space-evenly'
  },

  spaceItem: {
    flex: 0,
    borderWidth: 1,
    width: '40%',
    margin: 5,
    height: 150,
    borderRadius: 20
  }
})