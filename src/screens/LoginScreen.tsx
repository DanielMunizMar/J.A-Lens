import { View, Text, StyleSheet, Image, TextInput, Pressable } from "react-native";
import LogoJa from "./../../assets/Images/LOGO JA.jpg";
import { COLORS } from "../extra/colors";

export default function LoginScreen() {
  return (
    <View style={styles.container}>

      // LOGO
      <View style={styles.spaceLogo}>
        <Image source={LogoJa} style={styles.logo}></Image>
      </View>

      // LOGIN EMAIL
      <View style={styles.spaceInputer}>
        <TextInput
          placeholder="Email"
          style={styles.inputer}
          keyboardType="email-address"
        ></TextInput>
      </View>

      // SENHA
      <View style={styles.spaceInputer}>
        <TextInput
          placeholder="Senha"
          style={styles.inputer}
          secureTextEntry={true}
        ></TextInput>
      </View>

      <Pressable
        onPress={() => console.log('Botão clicado!')}
        style={styles.spaceButton}
      >
        <Text style={styles.TextButton}>Entrar</Text>
      </Pressable>

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

  spaceLogo: {
    elevation: 30,
    borderWidth: 1,
    borderColor: COLORS.branco,
    borderRadius: 200,
    marginBottom: 50
  },

  logo: {
    width: 340,
    height: 340,
    borderRadius: 200,
  },

  spaceInputer: {
    borderWidth: 1,
    width: '80%',
    padding: 10,
    backgroundColor: COLORS.branco,
    borderRadius: 20,
    borderColor: COLORS.cinzaQuente,
    marginBottom: 20,
    elevation: 5
  },

  inputer: {
    fontSize: 18,
    color: COLORS.azulPetroleo,
    fontFamily:'times'
  },

  spaceButton: {
    width: '80%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#058391',
    padding: 20,
    borderRadius: 20,
    borderColor: COLORS.azulTurqueza,
    borderWidth: 1,
    elevation: 5,
    marginTop: 20,
  },

  TextButton: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    fontFamily:'times',
  },
})