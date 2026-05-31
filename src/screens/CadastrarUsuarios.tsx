import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, FlatList, TouchableWithoutFeedback, TextInput } from 'react-native';
import { COLORS } from '../extra/colors';

export function CadastrarUsuarios() {
  const [visivel, setVisivel] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('Selecione');

  const dados = [
    { id: '1', label: 'Funcionário' },
    { id: '2', label: 'Cliente' },
  ];

  const selecionar = (label: string) => {
    setOpcaoSelecionada(label);
    setVisivel(false);
  };

  return (
    // TouchableWithoutFeedback serve para fechar a lista ao tocar em qualquer lugar do fundo
    <TouchableWithoutFeedback onPress={() => setVisivel(false)}>
      <View style={styles.container}>
        <View style={styles.spacePrincipal}>
          <View style={styles.linhaCabecalho}>
            <Text style={styles.tituloText}>Adicionar Usuário: </Text>

            <TouchableOpacity style={styles.botaoAbreLista} onPress={() => setVisivel(!visivel)}>
              <Text style={styles.textoBotaoAbreLista}>{opcaoSelecionada + "▼"}</Text>
            </TouchableOpacity>

            {/* Renderização condicional sem usar o componente Modal */}
            {visivel && (
              <View style={styles.containerListaAbsoluta}>
                <FlatList
                  data={dados}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity style={styles.opcao} onPress={() => selecionar(item.label)}>
                      <Text style={styles.textoOpcao}>{item.label}</Text>
                    </TouchableOpacity>
                  )}
                  // Garante que o scroll funcione sem sumir com a lista
                  nestedScrollEnabled={true}
                />
              </View>
            )}
          </View>

          <View>
            {/* INPUTER NOME*/}
            <Text style={styles.textInputer}>Nome: </Text>
            <TextInput style={styles.inputerCreate}
              placeholder='Insira o nome'
            />
            {/* INPUTER EMAIL*/}
            <Text style={styles.textInputer}>E-mail: </Text>
            <TextInput style={styles.inputerCreate}
              placeholder='Insira o email'
            />
            {/* INPUTER NOME*/}
            <Text style={styles.textInputer}>CPF: </Text>
            <TextInput style={styles.inputerCreate}
              placeholder='Insira o CPF'
            />
            {/* INPUTER TELEFONE*/}
            <Text style={styles.textInputer}>Telefone: </Text>
            <TextInput style={styles.inputerCreate}
              placeholder='Insira o telefone'
            />
            {/* INPUTER NOME*/}
            <Text style={styles.textInputer}>Endereço: </Text>
            <TextInput style={styles.inputerCreate}
              placeholder='Insira o endereço'
            />

            <TouchableOpacity
              style={styles.createUserButton}
              onPress={() => console.log('USUÁRIO CRIADO')}
            >
              <Text style={styles.textCreateUserButton}>CRIAR USUÁRIO</Text>
            </TouchableOpacity>
          </View>

        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spacePrincipal: {
    width: '90%',
    marginTop: 20,
    height: 'auto',
    borderWidth: 1,
    padding: 10,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    zIndex: 10,
    elevation: 5,
    borderColor: COLORS.focused
  },

  linhaCabecalho: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
  },

  tituloText: {
    fontWeight: 'bold',
    fontSize: 20,
    color: COLORS.primary,
    fontFamily:'times'
  },
  
  botaoAbreLista: {
    width: '40%',
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 10,
  },

  textoBotaoAbreLista: {
    fontSize: 16,
    color: COLORS.button,
    fontWeight: 'bold',
    fontFamily:'times'
  },

  containerListaAbsoluta: {
    position: 'absolute',
    top: 50,
    right: 0,
    width: '30%',
    backgroundColor: COLORS.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.focused,
    maxHeight: 150,
    elevation: 5,
    shadowColor: COLORS.overlay,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },

  opcao: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.primaryBg,
  },

  textoOpcao: {
    fontSize: 12,
    color: COLORS.primaryBg,
    fontWeight: 'bold',
    fontFamily:'times'
  },

  inputerCreate: {
    borderWidth: 1,
    borderColor: COLORS.focused,
    marginVertical: 10,
    borderRadius: 10,
    backgroundColor: COLORS.fill,
    padding: 10,
    elevation: 5,
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily:'times'
  },

  textInputer: {
    fontWeight: '700',
    fontSize: 20,
    color: COLORS.primary,
    fontFamily:'times'
  },

  createUserButton: {
    width: '100%',
    marginVertical: 20,
    height: 50,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5
  },

  textCreateUserButton: {
    fontSize: 25,
    color: COLORS.card,
    fontWeight: 'bold',
    fontFamily: 'times',
  },

});
