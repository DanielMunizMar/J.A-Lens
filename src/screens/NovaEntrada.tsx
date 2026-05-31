import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, FlatList } from 'react-native';
import { COLORS } from '../extra/colors';

export function NovaEntrada() {

    const [visivel, setVisivel] = useState(false);
    const [opcaoSelecionada, setOpcaoSelecionada] = useState('Selecione');

    const dados = [
        { id: '1', label: 'Dinheiro Físico' },
        { id: '2', label: 'Cartão de Crétido/Débito' },
        { id: '3', label: 'Pix' },
    ];

    const selecionar = (label: string) => {
        setOpcaoSelecionada(label);
        setVisivel(false);
    };

    return (

        <View style={styles.container}>
            <Text style={styles.titulo}>Registrar Nova Entrada: </Text>
            <View style={styles.spacePrincipal}>
                <Text style={styles.textoPrincipalCard}>VALOR (R$) </Text>
                <TextInput
                    style={styles.inputer}
                    placeholder='0,00'
                />

                <Text style={styles.textoPrincipalCard}>DESCRIÇÃO / PRODUTO: </Text>
                <TextInput
                    style={styles.inputer}
                    placeholder='Digite aqui...'
                />

                <Text style={styles.textoPrincipalCard}>FORMA DE PAGAMENTO: </Text>
                <TouchableOpacity style={styles.botaoAbreLista} onPress={() => setVisivel(!visivel)}>
                    <Text style={styles.textoBotaoAbreLista}>{opcaoSelecionada + "▼"}</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                style={[styles.button, styles.buttonPositivo]}
                onPress={() => navigation.navigate('CONFIRMADO')}
            >
                <Text style={styles.textButton}>CONFIRMAR ENTRADA</Text>
            </TouchableOpacity>

            <TouchableOpacity
                style={[styles.button, styles.buttonNegativo]}
                onPress={() => navigation.navigate('CANCELADO')}
            >
                <Text style={styles.textButton}>CANCELAR</Text>
            </TouchableOpacity>



            {visivel && (
                <View style={styles.containerListaAbsoluta}>
                    <View style={styles.containerListaAbsolutaIntern}>
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
                </View>
            )}
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
        padding: 10
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

    botaoAbreLista: {
        width: '100%',
        height: 45,
        borderWidth: 1,
        borderColor: COLORS.light,
        borderRadius: 10,
        backgroundColor: COLORS.primaryBg,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',

    },

    textoBotaoAbreLista: {
        fontSize: 16,
        color: COLORS.button,
        fontWeight: 'bold',
        fontFamily: 'times',
    },

    inputer: {
        width: "100%",
        borderWidth: 1,
        borderRadius: 10,
        padding: 10,
        fontFamily: 'times',
        fontWeight: '700',
        borderColor: COLORS.focused,
        elevation: 5,
        backgroundColor: COLORS.fill,
        alignSelf: 'center',
        marginBottom: 8
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
        justifyContent: 'center',
        alignItems: 'center'
    },

    textButton: {
        fontSize: 20,
        fontFamily: 'times',
        fontWeight: 'bold',
        color: COLORS.button
    },

    buttonNegativo: {
        backgroundColor: COLORS.errorLight
    },

    buttonPositivo: {
        backgroundColor: COLORS.successLight
    },


    containerListaAbsoluta: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: COLORS.overlay,
        zIndex: 999,
        justifyContent: 'center',
        alignItems: 'center'
    },

    containerListaAbsolutaIntern: {
        width: '80%',
        backgroundColor: COLORS.card,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: COLORS.focused,
        elevation: 5,
        shadowColor: COLORS.overlay,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },

    opcao: {
        padding: 10,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.primaryBg,
        justifyContent: 'center',
        alignItems: 'center'
    },

    textoOpcao: {
        fontSize: 20,
        color: COLORS.primaryBg,
        fontWeight: 'bold',
        fontFamily: 'times'
    },

});