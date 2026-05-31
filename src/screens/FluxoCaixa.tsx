import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { COLORS } from '../extra/colors';

export function FluxoCaixa({ navigation }: { navigation: any }) {
    return (
        <View style={styles.container}>
            <Text style={styles.titulo}>Fluxo de Caixa: </Text>
            <View style={styles.spacePrincipal}>
                <View style={styles.spacePrincipalIntern}>
                    <View style={styles.spaceSaldo}>
                        <Text style={styles.textoPrincipalCard}>SALDO: </Text>
                        <Text style={styles.textoCard}>R$ (15.450,00)</Text>
                    </View>
                    <Text style={[styles.textoCard, styles.positivo]}>[▲] Entradas: (R$ 22.000) </Text>
                    <Text style={[styles.textoCard, styles.negativo]}>[▼] Saídas: (R$ 6.550) </Text>
                </View>
            </View>
            <Text style={styles.titulo}>Últimas Transações: </Text>
            <View style={styles.spacePrincipal}>
                <View style={styles.spacePrincipalIntern}>
                    <View style={styles.eachMoment}>
                        <Text style={styles.textoPrincipalCard}>HOJE, (DATA ATUAL): </Text>
                        <Text style={[styles.textoCard, styles.positivo]}>[▲](Venda Produto X + 1.200,00)</Text>
                        <Text style={[styles.textoCard, styles.negativo]}>[▼] (Mensalidade de água - 220) </Text>
                    </View>
                    <View style={styles.eachMoment}>
                        <Text style={styles.textoPrincipalCard}>ONTEM, (DATA): </Text>
                        <Text style={[styles.textoCard, styles.positivo]}>[▲](Venda Produto X + 700)</Text>
                        <Text style={[styles.textoCard, styles.negativo]}>[▼] (Mensalidade de luz - 400)</Text>
                    </View>
                    <View style={styles.eachMoment}>
                        <Text style={styles.textoPrincipalCard}>SEMANA PASSADA, (DATA): </Text>
                        <Text style={[styles.textoCard, styles.positivo]}>[▲](Venda Produto X + 1500)</Text>
                        <Text style={[styles.textoCard, styles.negativo]}>[▼] (Mensalidade de internet - 100)</Text>
                    </View>
                </View>
            </View>

            <TouchableOpacity
                style={[styles.button, styles.buttonPositivo]}
                onPress={() => navigation.navigate('Nova Entrada')}
            >
                <Text style={styles.textButton}>NOVA ENTRADA</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
                style={[styles.button, styles.buttonNegativo]}
                onPress={() => navigation.navigate('Nova Saida')}
            >
                <Text style={styles.textButton}>NOVA SAÍDA</Text>
            </TouchableOpacity>
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
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderColor: COLORS.light,
        elevation: 5,
    },

    spacePrincipalIntern: {
        padding: 5
    },

    spaceSaldo: {
        flexDirection: 'row'
    },

    eachMoment: {
        paddingBottom: 10
    },

    titulo: {
        fontSize: 18,
        fontWeight: '700',
        fontFamily: 'times',
        color: COLORS.primary,
        alignSelf: 'flex-start',
        marginLeft: 20,
        marginTop: 20,
        marginBottom: 5
    },

    textoPrincipalCard: {
        fontSize: 16,
        fontWeight: '700',
        fontFamily: 'times',
        color: COLORS.primary,
        padding: 5,
    },

    textoCard: {
        fontSize: 16,
        fontWeight: '500',
        fontFamily: 'times',
        color: COLORS.primaryBg,
        padding: 5,
    },

    negativo: {
        color: COLORS.error
    },

    positivo: {
        color: COLORS.success
    },

    button: {
        width: '70%',
        borderWidth: 1,
        marginTop: 20,
        borderColor: COLORS.light,
        borderRadius: 50,
        backgroundColor: COLORS.primaryBg,
        elevation: 5,
        height: 50,
        justifyContent:'center',
        alignItems:'center'
    },

    textButton:{
        fontSize:20,
        fontFamily:'times',
        fontWeight:'bold',
        color: COLORS.button
    },

    buttonNegativo:{
        backgroundColor: COLORS.errorLight
    },

    buttonPositivo:{
        backgroundColor: COLORS.successLight
    },
});