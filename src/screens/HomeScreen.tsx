import { View, Text, StyleSheet, TouchableOpacity, ImageBackground, Image } from "react-native";
import item1 from './../../assets/Images/OP1.png'
import item2 from './../../assets/Images/OP2.png'
import item3 from './../../assets/Images/OP3.png'
import item4 from './../../assets/Images/OP4.png'
import item5 from './../../assets/Images/OP5.png'
import item6 from './../../assets/Images/OP6.png'
import item7 from './../../assets/Images/OP7.png'
import userPic from './../../assets/Images/userpic.png'
import UserLogo2 from './../../assets/Images/LOGO JA2.png'
import { COLORS } from '../extra/colors';

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <View style={styles.spaceHeader}>
        <View style={styles.spaceLogo}>
          <Image style={styles.userLogo2} source={UserLogo2}></Image>
        </View>

        <View style={styles.spaceUser}>
          <Image style={styles.userPic} source={userPic} />
        </View>
      </View>

      <View style={styles.spaceBody}>

        <View style={styles.spaceServicesText}>
          <Text style={styles.servicesText}>SERVIÇOS: </Text>
        </View>

        {/* ITEM 1 - GERENCIAR USUÁRIOS */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Gerenciar Usuários')}
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
            onPress={() => navigation.navigate('Histórico de Receitas')}
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
            onPress={() => navigation.navigate('Controle de Estoque')}
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
            onPress={() => navigation.navigate('Fluxo de Caixa')}
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
            onPress={() => navigation.navigate('Ordens de Serviço')}
          >
            <ImageBackground
              source={item6}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

        {/* ITEM 7 - */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Nova Venda')}
          >
            <ImageBackground
              source={item7}
              style={styles.imageItem}
              imageStyle={styles.imageItem}
            />
          </TouchableOpacity>

        </View>

      </View>


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
    elevation: 5
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
    marginTop: 10,
    width: '90%',
    height: 'auto',
    flexWrap: "wrap",
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
    elevation: 5
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
  }
})