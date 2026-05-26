import { View, Text, StyleSheet, Pressable } from "react-native";
import { COLORS } from "../extra/colors";

export default function AddClientes() {
  return (
    <View style={styles.container}>

          <View style={styles.spaceAddSquare}>
            <Pressable
              onPress={() => console.log('Botão clicado!')}
              style={styles.spaceAddButton}
            >
              <Text style={styles.addButton}>Adicionar Cliente</Text>
            </Pressable>
          </View>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.azulPrimal,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceAddSquare:{
    borderWidth: 1,
    width: '80%',
    backgroundColor:'#f1bc0e'
  },

  spaceAddButton: {
    borderWidth: 1,
    width: '100%'
  },

  addButton: {
    color: '#000000'
  }
})