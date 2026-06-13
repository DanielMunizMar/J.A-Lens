import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, Image, TextInput, Pressable, KeyboardAvoidingView,
  Platform, ActivityIndicator
} from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { COLORS } from '../extra/colors';
import { auth } from '../extra/firebase';
import { isValidEmail } from '../extra/utils';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const entrar = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanSenha = senha.trim();

    if (!isValidEmail(cleanEmail)) return setFeedback('Informe um e-mail válido.');
    if (cleanSenha.length < 6) return setFeedback('A senha precisa ter no mínimo 6 caracteres.');

    setLoading(true);
    setFeedback(null);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        cleanEmail,
        cleanSenha
      );

      console.log('LOGIN OK');
      console.log(userCredential.user.uid);

    } catch (e) {
      console.log(e);
      setFeedback('Falha no login. Verifique e-mail, senha e perfil ativo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <View style={styles.spaceLogo}>
        <StatusBar style="dark" />

        <Image source={require('../../assets/Images/logo_ja.jpg')} style={styles.logo} />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Acesso de Funcionário</Text>

        <TextInput
          placeholder="Email"
          placeholderTextColor={COLORS.placeholder}
          style={styles.input}
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          placeholder="Senha"
          placeholderTextColor={COLORS.placeholder}
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />

        {feedback ? <Text style={styles.error}>{feedback}</Text> : null}

        <Pressable style={styles.button} onPress={entrar} disabled={loading}>
          {loading ? <ActivityIndicator color={COLORS.button} /> : <Text style={styles.buttonText}>Entrar</Text>}
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  spaceLogo: {
    borderRadius: 160,
    overflow: 'hidden',
    marginBottom: 24,
    borderWidth: 1,
    borderColor: COLORS.light,
    elevation: 5,
    backgroundColor: COLORS.card,
  },

  logo: {
    width: 220,
    height: 220,
  },

  card: {
    width: '100%',
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.light,
    elevation: 4,
  },

  title: {
    fontFamily: 'times',
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 14,
    textAlign: 'center',
  },

  input: {
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  button: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonText: {
    color: COLORS.button,
    fontSize: 18,
    fontFamily: 'times',
    fontWeight: '700',
  },

  error: {
    color: COLORS.error,
    marginBottom: 10,
    fontFamily: 'times',
    fontWeight: '700',
  },
});
