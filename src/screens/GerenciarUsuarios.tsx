import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Modal, FlatList } from 'react-native';
import { COLORS } from '../extra/colors';

export function GerenciarUsuarios() {
  const [visivel, setVisivel] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('Opções');

  const dados = [
    { id: '1', label: 'Opção 1' },
    { id: '2', label: 'Opção 2' },
    { id: '3', label: 'Opção 3' },
  ];

  function selecionar(label) {
    setOpcaoSelecionada(label);
    setVisivel(false)
  }

  return (
    <View style={styles.container}>
      <View style={styles.spaceSecundary}>
        <ScrollView>
          <Text style={styles.tituloText}>Filtro: </Text>

          <View style={styles.filterItens}>
            <TextInput
              style={styles.inputerFilter}
              placeholder='Insira o nome do usuário'
            />
            <TouchableOpacity style={styles.botaoAbreLista} onPress={() => setVisivel(true)}>
              <Text style={styles.textoBotaoAbreLista}>{opcaoSelecionada}</Text>
              <Text style={styles.seta}>▼</Text>
            </TouchableOpacity>

          </View>

          <View style={styles.spaceUsers}>

          </View>
        </ScrollView>
      </View>
    </View>
  );
}


export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cinzaQuente,
    justifyContent: 'center',
    alignItems: 'center',
  },

  tituloText: {
    fontWeight: '700',
    fontSize: 20,
  },

  spaceSecundary: {
    flex: 1,
    width: '90%',
    marginTop: 20,
    height: 'auto',
    borderWidth: 1,
    padding: 10,
    backgroundColor: COLORS.amareloQueimado,
    borderRadius: 20
  },

  filterItens: {
    marginVertical: 8,
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between'
  },

  inputerFilter: {
    borderWidth: 1,
    width: '60%',
    borderRadius: 10,
    backgroundColor: COLORS.branco
  },

  botaoAbreLista: {
    width: '30%',
    height: 45,
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 10,
    backgroundColor: '#fff',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  textoBotaoAbreLista: {
    fontSize: 14,
    color: '#333',
  },

  spaceUsers: {
    height: 40,
    borderWidth: 1
  }
});