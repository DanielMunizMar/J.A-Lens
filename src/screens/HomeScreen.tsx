import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image, Modal, Pressable, Alert } from "react-native";
import item1 from './../../assets/Images/OP1.png'
import item2 from './../../assets/Images/OP2.png'
import item3 from './../../assets/Images/OP3.png'
import item4 from './../../assets/Images/OP4.png'
import item5 from './../../assets/Images/OP5.png'
import item6 from './../../assets/Images/OP6.png'
import userPic from './../../assets/Images/userpic.png'
import UserLogo2 from './../../assets/Images/logo_ja2.png'
import { COLORS } from '../extra/colors';
import { signOut } from 'firebase/auth';
import { auth } from '../extra/firebase';

export default function HomeScreen({ navigation }: { navigation: any }) {
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setShowLogoutModal(false);
    } catch (error: any) {
      Alert.alert('Erro', 'Erro ao deslogar: ' + error.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.spaceHeader}>
        <View style={styles.spaceLogo}>
          <Image style={styles.userLogo2} source={UserLogo2}></Image>
        </View>

        <TouchableOpacity style={styles.spaceUser} onPress={() => setShowLogoutModal(true)}>
          <Image style={styles.userPic} source={userPic} />
        </TouchableOpacity>
      </View>

      <View style={styles.spaceBody}>

        <View style={styles.spaceServicesText}>
          <Text style={styles.servicesText}>SERVIÇOS: </Text>
        </View>

        {/* ITEM 1 - GERENCIAR USUÁRIOS */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Usuários')}
          >
            <ImageBackground
              source={item1}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>
        </View>

        {/* ITEM 2 -  */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Cadastrar Usuários')}
          >
            <ImageBackground
              source={item2}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

        {/* ITEM 3 - */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Receitas')}
          >
            <ImageBackground
              source={item3}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

        {/* ITEM 4 - */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Estoque')}
          >
            <ImageBackground
              source={item4}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

        {/* ITEM 5 - */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Caixa')}
          >
            <ImageBackground
              source={item5}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

        {/* ITEM 6 - */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Agenda')}
          >
            <ImageBackground
              source={item6}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>
        </View>


      </View>

      <Modal visible={showLogoutModal} transparent animationType="fade" onRequestClose={() => setShowLogoutModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowLogoutModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Deslogar?</Text>
            <Text style={styles.modalMessage}>Tem certeza que deseja sair da aplicação?</Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.error }]} onPress={handleLogout}>
                <Text style={styles.modalButtonText}>SIM, DESLOGAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, { backgroundColor: COLORS.primaryBg }]} onPress={() => setShowLogoutModal(false)}>
                <Text style={styles.modalButtonText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </View >
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.screen,
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceHeader: {
    flex: 0,
    width: '90%',
    height: '10%',
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  spaceLogo: {
    width: 200,
    borderWidth: 1,
    marginLeft: 5,
    height: 70,
    borderRadius: 20,
    elevation: 5,
    borderColor: COLORS.light
  },

  userLogo2: {
    width: 200,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
    elevation: 5,
  },

  spaceUser: {
    borderWidth: 1,
    width: 70,
    height: 70,
    borderRadius: 200,
    marginRight: 5,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    backgroundColor: COLORS.fill
  },

  userPic: {
    height: 70,
    width: 70,
    margin: 10,
    borderRadius: 200,
    elevation: 5,
    borderWidth: 1,
    backgroundColor: COLORS.fill
  },

  spaceBody: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 20,
    width: '90%',
    height: 'auto',
    flexWrap: "wrap",
    alignItems: 'center',
    justifyContent: 'space-evenly'
  },

  spaceServicesText: {
    width: '100%',
    height: 'auto'
  },

  servicesText: {
    fontWeight: 'bold',
    fontSize: 20,
    paddingLeft: 20,
    color: COLORS.primary,
    fontFamily: 'times'
  },

  spaceItem: {
    flex: 0,
    borderWidth: 1,
    width: 150,
    margin: 5,
    height: 150,
    borderRadius: 20,
    borderColor: COLORS.focused,
    elevation: 5,
    backgroundColor: COLORS.fill
  },

  spaceInternItem: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center',
  },

  imageItem: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
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
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 22,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 16,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButtons: {
    width: '100%',
    gap: 10,
  },
  modalButton: {
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.button,
  },
})
