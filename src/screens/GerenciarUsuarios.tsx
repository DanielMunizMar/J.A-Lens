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

  const selecionar = (label) => {
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
          <View style={textos.itensFilter}>
            <TouchableOpacity style={styles.botaoAbreLista} onPress={() => setVisivel(!visivel)}>
              <Text style={styles.textoBotaoAbreLista}>{opcaoSelecionada + '▼'}</Text>
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
                  <Text style={styles.textoOpcao}>{item.label}</Text>
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

          <View style={styles.spaceUserName}>
            <Text style={textos.textUserName}>NOME USUÁRIO</Text>
          </View>

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

          <View style={styles.spaceUserName}>
            <Text style={textos.textUserName}>NOME USUÁRIO</Text>
          </View>

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

          <View style={styles.spaceUserName}>
            <Text style={textos.textUserName}>NOME USUÁRIO</Text>
          </View>

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
    backgroundColor: COLORS.yellowScreen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spacePrincipal: {
    width: '90%',
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.yellowPrimary,
    borderRadius: 20,
    padding: 20
  },

  spaceTextPrincipal: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.yellowBody,
    backgroundColor: COLORS.yellowAccent,
    borderRadius: 50,
    alignContent: 'center',
    alignSelf: 'center',
    marginVertical: 5,
    elevation: 5
  },

  spaceFilterOptions: {
    flexDirection: 'row',
    alignContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    padding: 10
  },

  itensFilter:{
    width:'60%',
    
  },

  spaceInputerFilter: {
    width: '100%',
    borderWidth: 1,
    borderColor: COLORS.yellowBody,
    backgroundColor: COLORS.yellowAccent,
    marginVertical: 10,
    padding: 10,
    borderRadius: 20,
    elevation: 5
  },

  spaceSecundary: {
    width: '90%',
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.yellowPrimary,
    borderRadius: 20,
    padding: 20,
    marginVertical: 20
  },

  spaceUserCard: {
    width: '100%',
    height: 'auto',
    borderWidth: 1,
    backgroundColor: COLORS.yellowLabel,
    borderRadius: 20,
    marginVertical: 5,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  userPic: {
    height: 50,
    width: 50,
    margin: 10,
    borderRadius: 200,
    elevation: 5,
    borderWidth: 1
  },

  spaceUserName: {

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
    backgroundColor: COLORS.yellowAccent,
  }

});

export const textos = StyleSheet.create({
  textPrincipal: {
    fontSize: 25,
    fontFamily: 'times',
    fontWeight: 'bold',
    marginVertical: 10
  },

  textFilter: {
    fontFamily: 'times',
    fontWeight: '700',

  },

  textUserName: {
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.yellowAccent,
    fontSize: 18
  }


});