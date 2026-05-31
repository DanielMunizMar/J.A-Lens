import HomeScreen from "./src/screens/HomeScreen"; // TELA 0
import LoginScreen from "./src/screens/LoginScreen"; // TELA -01
import { GerenciarUsuarios } from "./src/screens/GerenciarUsuarios"; // TELA 01
import { CadastrarUsuarios } from "./src/screens/CadastrarUsuarios"; // TELA 02
import { HistoricoReceitas} from "./src/screens/HistoricoReceitas"; // TELA 03
import { ControleEstoque } from "./src/screens/ControleEstoque"; // TELA 04
import { FluxoCaixa} from "./src/screens/FluxoCaixa"; // TELA 05
import { OrdensServico } from "./src/screens/OrdensServico"; //TELA 06
import { NovaVenda} from "./src/screens/NovaVenda"; // TELA 07
import { NavigationContainer } from '@react-navigation/native' 
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { NovaEntrada } from "./src/screens/NovaEntrada";
import { NovaSaida } from "./src/screens/NovaSaida";
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
          name="Gerenciar Usuários"
          component={GerenciarUsuarios}
        />
        <Stack.Screen
          name="Cadastrar Usuários"
          component={CadastrarUsuarios}
        />
        <Stack.Screen
          name="Histórico de Receitas"
          component={HistoricoReceitas}
        />
        <Stack.Screen
          name="Controle de Estoque"
          component={ControleEstoque}
        />
        <Stack.Screen
          name="Fluxo de Caixa"
          component={FluxoCaixa}
        />
        <Stack.Screen
          name="Ordens de Serviço"
          component={OrdensServico}
        />
        <Stack.Screen
          name="Nova Venda"
          component={NovaVenda}
        />
        <Stack.Screen
          name="Nova Entrada"
          component={NovaEntrada}
        />
        <Stack.Screen
          name="Nova Saida"
          component={NovaSaida}
        />
      </Stack.Navigator>
    </NavigationContainer>
  )
}