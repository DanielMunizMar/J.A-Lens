import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { collection, getDocs, query, where } from 'firebase/firestore';

import { COLORS } from './src/extra/colors';
import { auth, db } from './src/extra/firebase';

import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import { GerenciarUsuarios } from './src/screens/GerenciarUsuarios';
import { CadastrarUsuarios } from './src/screens/CadastrarUsuarios';
import { HistoricoReceitas } from './src/screens/HistoricoReceitas';
import { CriarReceita } from './src/screens/CriarReceita';
import { ControleEstoque } from './src/screens/ControleEstoque';
import { FluxoCaixa } from './src/screens/FluxoCaixa';
import { GerenciarFluxo } from './src/screens/GerenciarFluxo';
import { NovaEntrada } from './src/screens/NovaEntrada';
import { NovaSaida } from './src/screens/NovaSaida';
import { CadastrarArmacao } from './src/screens/CadastrarArmacao';

const Stack = createNativeStackNavigator();

export default function App() {
  const [booting, setBooting] = useState(true);
  const [logged, setLogged] = useState(false);


  useEffect(() => {
    console.log('APP INICIOU');

    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log('AUTH STATE CHANGED');

      try {
        if (!user) {
          console.log('SEM USUARIO');

          setLogged(false);
          setBooting(false);
          return;
        }

        console.log('USUARIO LOGADO:', user.uid);

        const snap = await getDocs(
          collection(db, 'usuarios')
        );

        console.log('TOTAL DOCS:', snap.size);

        snap.forEach((d) => {
          console.log('ID:', d.id);
          console.log('DATA:', d.data());
        });

        console.log('DOCUMENTOS:', snap.size);

        snap.forEach((d) => {
          console.log('DOC:', d.id);
          console.log(d.data());
        });

        console.log('CONSULTA FINALIZADA');
        console.log('DOCUMENTOS:', snap.size);

        if (snap.empty) {
          console.log('FUNCIONARIO NÃO ENCONTRADO');

          await signOut(auth);
          setLogged(false);
        } else {
          console.log('FUNCIONARIO ENCONTRADO');

          setLogged(true);
        }
      } catch (error) {
        console.log('ERRO NO APP.TSX');
        console.log(error);
      } finally {
        console.log('FINALIZANDO BOOT');
        setBooting(false);
      }
    });

    return unsub;
  }, []);

  if (booting) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.screen }}>
        <ActivityIndicator size="large" color={COLORS.primaryBg} />
        <Text style={{ marginTop: 12, color: COLORS.primary, fontFamily: 'times', fontWeight: '700' }}>
          Carregando...
        </Text>
      </View>
    );
  }

  return (
    <NavigationContainer theme={{ ...DefaultTheme, colors: { ...DefaultTheme.colors, background: COLORS.screen } }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerTitleAlign: 'center',
          headerStyle: { backgroundColor: COLORS.card },
          headerTitleStyle: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700' },
          headerTintColor: COLORS.primary,
        }}
      >
        {!logged ? (
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
        ) : (
          <>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="Usuários" component={GerenciarUsuarios} />
            <Stack.Screen name="Cadastrar Usuários" component={CadastrarUsuarios} />
            <Stack.Screen name="Estoque" component={ControleEstoque} />
            <Stack.Screen name="Caixa" component={FluxoCaixa} />
            <Stack.Screen name="Gerenciar Fluxo" component={GerenciarFluxo} />
            <Stack.Screen name="Receitas" component={HistoricoReceitas} />
            <Stack.Screen name="Criar Receita" component={CriarReceita} />
            <Stack.Screen name="Nova Entrada" component={NovaEntrada} />
            <Stack.Screen name="Nova Saída" component={NovaSaida} />
            <Stack.Screen name="Cadastrar Armação" component={CadastrarArmacao} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
