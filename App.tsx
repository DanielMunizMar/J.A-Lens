import HomeScreen from "./src/screens/HomeScreen"; // TELA 0
import LoginScreen from "./src/screens/LoginScreen"; // TELA -01
import { GerenciarUsuarios } from "./src/screens/GerenciarUsuarios"; // TELA 01
import { CadastrarUsuarios } from "./src/screens/CadastrarUsuarios"; // TELA 01
import { NavigationContainer } from '@react-navigation/native' 
import { createNativeStackNavigator } from '@react-navigation/native-stack'
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
        />
        <Stack.Screen
          name="Gerenciar Usuarios"
          component={GerenciarUsuarios}
        />
        <Stack.Screen
          name="Cadastrar Usuarios"
          component={CadastrarUsuarios}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}