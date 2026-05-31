import React, { useState } from 'react';
import { StyleSheet, View, ScrollView, Text, TextInput, TouchableOpacity, Modal, FlatList, Image } from 'react-native';
import { COLORS } from '../extra/colors';
import userPic from './../../assets/Images/userpic.png'

export function GerenciarUsuarios() {

  const [visivel, setVisivel] = useState(false);
  const [opcaoSelecionada, setOpcaoSelecionada] = useState('Nome');

  const dados = [
    { id: '1', label: 'Nome' },
    { id: '2', label: 'CPF' },
    { id: '3', label: 'E-mail' },
  ];

  const selecionar = (label: string) => {
    setOpcaoSelecionada(label);
    setVisivel(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.spacePrincipal}>

        <View style={styles.spaceTextPrincipal}>
          <Text style={textos.textPrincipal}>FILTRO</Text>
        </View>

        <View style={styles.spaceFilterOptions}>
          <Text style={textos.textFilter}>Filtrar por: </Text>
          <View style={styles.itemLista}>
            <TouchableOpacity style={styles.botaoAbreLista} onPress={() => setVisivel(!visivel)}>
              <Text style={textos.itensFilter}>{opcaoSelecionada + '▼'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {visivel && (
          <View style={styles.containerListaAbsoluta}>
            <FlatList
              data={dados}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.opcao} onPress={() => selecionar(item.label)}>
                  <Text style={textos.textoOpcao}>{item.label}</Text>
                </TouchableOpacity>
              )}
              // Garante que o scroll funcione sem sumir com a lista
              nestedScrollEnabled={true}
            />
          </View>
        )}

        <TextInput
          placeholder='Insira o filtro'
          style={styles.spaceInputerFilter}
        />
      </View>

      <View style={styles.spaceSecundary}>
        <View style={styles.spaceUserCard}>
          <Image style={styles.userPic}
            source={userPic}
          />

          <Text style={textos.textUserName}>NOME USUÁRIO</Text>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => console.log('DESCRIÇÃO APERTADA')}
          >
            <Text>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spaceUserCard}>
          <Image style={styles.userPic}
            source={userPic}
          />

          <Text style={textos.textUserName}>NOME USUÁRIO</Text>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => console.log('DESCRIÇÃO APERTADA')}
          >
            <Text>☰</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.spaceUserCard}>
          <Image style={styles.userPic}
            source={userPic}
          />

          <Text style={textos.textUserName}>NOME USUÁRIO</Text>

          <TouchableOpacity
            style={styles.optionsButton}
            onPress={() => console.log('DESCRIÇÃO APERTADA')}
          >
            <Text>☰</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
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
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    elevation: 5,
    borderColor: COLORS.focused
  },

  spaceTextPrincipal: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.focused,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 50,
    alignContent: 'center',
    alignSelf: 'center',
    marginVertical: 5,
    elevation: 5
  },

  spaceFilterOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: 10,
  },

  itemLista: {
    width: '60%'
  },

  botaoAbreLista: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: COLORS.light,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    elevation: 5
  },

  containerListaAbsoluta: {
    position: 'absolute',
    top: 140,
    right: 31,
    width: '56%',
    backgroundColor: COLORS.primaryBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.light,
    maxHeight: 150,
    elevation: 5,
    shadowColor: COLORS.light,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    zIndex: 999,
  },

  opcao: {
    padding: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  spaceInputerFilter: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.focused,
    backgroundColor: COLORS.fill,
    marginVertical: 10,
    padding: 10,
    borderRadius: 20,
    elevation: 5,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary
  },

  spaceSecundary: {
    width: '90%',
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 20,
    marginVertical: 20,
    elevation: 5,
    borderColor: COLORS.focused
  },

  spaceUserCard: {
    width: '100%',
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.primaryBg,
    borderRadius: 20,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 5,
    borderColor: COLORS.light
  },

  userPic: {
    height: 50,
    width: 50,
    margin: 10,
    borderRadius: 200,
    elevation: 5,
    borderWidth: 1,
    backgroundColor: COLORS.fill
  },

  optionsButton: {
    borderWidth: 1,
    height: 50,
    width: 45,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    elevation: 5,
    backgroundColor: COLORS.fill,
    borderColor: COLORS.focused
  }

});

export const textos = StyleSheet.create({
  textPrincipal: {
    fontSize: 25,
    fontFamily: 'times',
    fontWeight: 'bold',
    marginVertical: 10,
    color: COLORS.button
  },

  textFilter: {
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 18,
    color: COLORS.primary
  },

  itensFilter: {
    color: COLORS.button,
    fontFamily: 'times',
    fontSize: 18,
    fontWeight: '700'
  },

  textUserName: {
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.button,
    fontSize: 18
  },

  textoOpcao: {
    fontSize: 14,
    color: COLORS.button,
    fontWeight: 'bold',
    fontFamily: 'times',
    justifyContent: 'center',
    alignItems: 'center'
  },

});