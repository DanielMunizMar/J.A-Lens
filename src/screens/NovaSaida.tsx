import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Pressable } from 'react-native';
import { addDoc, collection } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { db } from '../extra/firebase';
import { parseMoneyBR } from '../extra/utils';

const CATEGORIES = ['Transporte', 'Manutenção', 'Mercadoria', 'Serviços', 'Marketing', 'Equipe', 'Mensalidades', 'Outros'];

export function NovaSaida({ navigation }: any) {
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [picker, setPicker] = useState(false);

  const salvar = async () => {
    const n = parseMoneyBR(valor);
    if (n <= 0) return Alert.alert('Validação', 'Informe um valor válido.');
    if (!descricao.trim()) return Alert.alert('Validação', 'Informe a descrição.');

    await addDoc(collection(db, COLLECTIONS.saidas), {
      valor: n,
      descricao: descricao.trim(),
      categoria,
      dataCriacao: new Date().toISOString(),
      createdAt: Date.now(),
    });

    Alert.alert('Sucesso', 'Saída registrada com sucesso.');
    navigation.goBack();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <StatusBar style="dark" />

        <Text style={styles.title}>Registrar Nova Saída: </Text>

        <Text style={styles.label}>Valor: </Text>
        <TextInput
          multiline
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor={COLORS.placeholder}
          value={valor}
          onChangeText={setValor}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Descrição: </Text>
        <TextInput
          multiline
          style={styles.input}
          placeholder="Descrição"
          placeholderTextColor={COLORS.placeholder}
          value={descricao}
          onChangeText={setDescricao}
        />

        <Text style={styles.label}>Categoria: </Text>
        <TouchableOpacity style={styles.select} onPress={() => setPicker(true)}>
          <Text style={styles.selectText}>{categoria} ▼</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.ok]} onPress={salvar}>
          <Text style={styles.buttonText}>CONFIRMAR SAÍDA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.cancel]} onPress={() => navigation.goBack()}>
          <Text style={styles.buttonText}>CANCELAR</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={picker} transparent animationType="fade" onRequestClose={() => setPicker(false)}>
        <Pressable style={styles.overlay} onPress={() => setPicker(false)}>
          <View style={styles.modal}>
            {CATEGORIES.map((c) => (
              <TouchableOpacity key={c} style={styles.option} onPress={() => { setCategoria(c); setPicker(false); }}>
                <Text style={styles.optionText}>{c}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.screen,
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light,
  },

  title: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
  },

  input: {
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
  },

  label: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 6,
  },

  select: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  selectText: {
    color: COLORS.button,
    textAlign: 'center',
    fontFamily: 'times',
    fontWeight: '700',
  },

  button: {
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  ok: {
    backgroundColor: COLORS.successLight,
  },

  cancel: {
    backgroundColor: COLORS.errorLight,
  },

  buttonText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
  },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
  },

  modal: {
    width: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
  },

  option: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  optionText: {
    textAlign: 'center',
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '700',
  },
});
