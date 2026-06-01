import React from 'react';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import { COLORS } from '../extra/colors';

export function HistoricoReceitas() {
    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.container}>
                <View style={styles.spacePrincipal}>

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
        height: 200,
        borderWidth: 1,
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderColor: COLORS.light,
        elevation: 5,
        marginTop: 30
    }
});