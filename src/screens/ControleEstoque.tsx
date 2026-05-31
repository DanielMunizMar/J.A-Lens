import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Image, ScrollView } from 'react-native';
import { COLORS } from '../extra/colors';
import ARMACAO from './../../assets/Images/ARMAÇÃO.png';

export function ControleEstoque() {
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.spacePrincipal}>
                    <View style={styles.spaceItens}>
                        <TouchableOpacity
                            style={styles.itens}
                            onPress={() => console.log("1")}
                        >
                            <Text style={styles.itensText}>FILTRO</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.itens}
                            onPress={() => console.log("2")}
                        >
                            <Text style={styles.itensText}>CADASTRAR ARMAÇÃO</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.spaceSecundary}>
                    <View style={styles.cardArmacao}>
                        <Image source={ARMACAO} style={styles.imageStatus} />
                        <View style={styles.textCards}>
                            <Text style={styles.textCardPrincipal}>Marca: <Text style={styles.textCardSecundary}>XXXXXXXX</Text></Text>
                            <Text style={styles.textCardPrincipal}>Formato: <Text style={styles.textCardSecundary}>XXXXXXXX</Text></Text>
                            <Text style={styles.textCardPrincipal}>Gênero: <Text style={styles.textCardSecundary}>XXXXXXXX</Text></Text>
                        </View>
                        <TouchableOpacity
                            style={styles.expandButton}
                            onPress={() => console.log('Funciona')}
                        >
                            <Text style={styles.textExpandButton}>INFORMAÇÕES</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </ScrollView>
    );
}

export const styles = StyleSheet.create({

    scrollContainer: {
        flexGrow: 1,
        backgroundColor: COLORS.screen,
    },

    container: {
        justifyContent: 'flex-start',
        alignItems: 'center',
    },

    spacePrincipal: {
        width: '90%',
        height: 'auto',
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderColor: COLORS.light,
        elevation: 5,
        marginTop: 30,
        marginBottom: 20
    },

    spaceItens: {
        flexDirection: 'row',
        padding: 10,
        justifyContent: 'space-between',
        alignItems: 'center'
    },

    itens: {
        width: 150,
        borderColor: COLORS.light,
        backgroundColor: COLORS.primaryBg,
        elevation: 5,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        borderRadius: 20,
        minHeight: 80,
        borderWidth: 1
    },

    itensText: {
        fontFamily: 'times',
        fontWeight: '700',
        fontSize: 18,
        color: COLORS.button,
        textAlign: 'center'
    },

    spaceSecundary: {
        width: '90%',
        height: "auto",
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderColor: COLORS.light,
        elevation: 5,
        marginBottom: 30
    },

    cardArmacao: {
        padding: 10,
    },

    imageStatus: {
        width: '100%',
        height: 200,
        borderRadius: 20,
        resizeMode: 'cover'
    },

    textCards: {
        marginVertical: 10
    },

    textCardPrincipal: {
        fontSize: 16,
        fontFamily: 'times',
        color: COLORS.primary,
        fontWeight: '700'
    },

    textCardSecundary: {
        color: COLORS.primaryBg,
        fontWeight: '500'
    },

    expandButton: {
        padding: 10,
        borderRadius: 50,
        borderWidth: 1,
        borderColor: COLORS.light,
        backgroundColor: COLORS.primaryBg,
        width: '50%',
        marginLeft: '25%',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5
    },

    textExpandButton: {
        fontWeight: '700',
        fontFamily: 'times',
        color: COLORS.button,
        fontSize: 18
    }
});