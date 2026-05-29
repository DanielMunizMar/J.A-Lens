import { View, Text, StyleSheet, TouchableOpacity, ImageBackground } from "react-native";
import item1 from './../../assets/Images/OP1.png'
import item2 from './../../assets/Images/OP2.png'
import item3 from './../../assets/Images/OP3.png'
import item4 from './../../assets/Images/OP4.png'
import item5 from './../../assets/Images/OP5.png'
import item6 from './../../assets/Images/OP6.png'
import item7 from './../../assets/Images/OP7.png'

export default function HomeScreen({ navigation }: { navigation: any }) {
  return (
    <View style={styles.container}>
      <View style={styles.spaceHeader}>
        <View style={styles.spaceLogo}>

        </View>

        <View style={styles.spaceUser}>

        </View>
      </View>

      <View style={styles.spaceBody}>

        <View style={styles.spaceServicesText}>
          <Text style={styles.servicesText}>Serviços: </Text>
        </View>

        {/* ITEM 1 - GERENCIAR USUÁRIOS */}
        <View style={styles.spaceItem}>
          <TouchableOpacity
            style={styles.spaceInternItem}
            onPress={() => navigation.navigate('Gerenciar Usuarios')}
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
            onPress={() => navigation.navigate('Cadastrar Usuarios')}
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
            onPress={() => navigation.navigate('Cadastro Users')}
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
            onPress={() => navigation.navigate('Cadastro Users')}
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
            onPress={() => navigation.navigate('Cadastro Users')}
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
            onPress={() => navigation.navigate('Cadastro Users')}
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
            onPress={() => navigation.navigate('Cadastro Users')}
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
    backgroundColor: "lightblue",
    justifyContent: 'center',
    alignItems: 'center',
  },

  spaceHeader: {
    flex: 0,
    borderWidth: 1,
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
    borderRadius: 20

  },

  spaceUser: {
    borderWidth: 1,
    width: 70,
    height: 70,
    borderRadius: 200,
    marginRight: 5
  },

  spaceBody: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 10,
    borderWidth: 1,
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
    paddingLeft: 20
  },

  spaceItem: {
    flex: 0,
    borderWidth: 1,
    width: 150,
    margin: 5,
    height: 150,
    borderRadius: 20
  },

  spaceInternItem: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    justifyContent: 'center'
  },

  imageItem: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  }
})