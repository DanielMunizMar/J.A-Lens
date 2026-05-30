import React from 'react';
import { View, StyleSheet } from 'react-native';
import { COLORS } from '../extra/colors';

export function ControleEstoque() {
    return (
        <View style={styles.container}>

        </View>
    );
}

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.greenScreen,
        justifyContent: 'center',
        alignItems: 'center',
    }
});