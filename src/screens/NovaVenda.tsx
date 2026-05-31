import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../extra/colors';

export function NovaVenda() {
    return (
        <View style={styles.container}>
            <View style={styles.spacePrincipal}>
                
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
        borderRadius: 20,
        backgroundColor: COLORS.card,
        borderColor: COLORS.light,
        elevation: 5
    }
});