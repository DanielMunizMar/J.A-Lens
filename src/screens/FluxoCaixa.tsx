import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { formatMoneyBR, monthKey, todayKey, formatMonthBR } from '../extra/utils';

type Entry = { valor: number; descricao: string; formaPagamento?: string; createdAt: number };
type Exit = { valor: number; descricao: string; categoria?: string; createdAt: number };

export function FluxoCaixa({ navigation }: any) {
  const [entradas, setEntradas] = useState<Entry[]>([]);
  const [saidas, setSaidas] = useState<Exit[]>([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        const [eSnap, sSnap] = await Promise.all([
          getDocs(query(collection(db, COLLECTIONS.entradas), orderBy('createdAt', 'desc'))),
          getDocs(query(collection(db, COLLECTIONS.saidas), orderBy('createdAt', 'desc'))),
        ]);
        setEntradas(
          eSnap.docs.map(d => {
            const data = d.data() as any;
            return {
              ...data,
              createdAt: typeof data.createdAt === 'number' ? data.createdAt : data.createdAt?.toMillis?.() || Date.now(),
            } as Entry;
          })
        );
        setSaidas(
          sSnap.docs.map(d => {
            const data = d.data() as any;
            return {
              ...data,
              createdAt: typeof data.createdAt === 'number' ? data.createdAt : data.createdAt?.toMillis?.() || Date.now(),
            } as Exit;
          })
        );
      })();
    }, [])
  );

  const todaySummary = useMemo(() => {
    const key = todayKey();
    const entradasDia = entradas.filter(i => new Date(i.createdAt).toISOString().slice(0, 10) === key).reduce((a, b) => a + Number(b.valor || 0), 0);
    const saidasDia = saidas.filter(i => new Date(i.createdAt).toISOString().slice(0, 10) === key).reduce((a, b) => a + Number(b.valor || 0), 0);
    return { entradasDia, saidasDia, saldoDia: entradasDia - saidasDia };
  }, [entradas, saidas]);

  const monthlySummary = useMemo(() => {
    const months = new Set([...entradas, ...saidas].map(i => monthKey(i.createdAt)));
    return Array.from(months).sort().reverse().slice(0, 6).map((m) => {
      const e = entradas.filter(i => monthKey(i.createdAt) === m).reduce((a, b) => a + Number(b.valor || 0), 0);
      const s = saidas.filter(i => monthKey(i.createdAt) === m).reduce((a, b) => a + Number(b.valor || 0), 0);
      return { m, e, s, saldo: e - s };
    });
  }, [entradas, saidas]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <StatusBar style="dark" /> 

        <Text style={styles.title}>Fluxo de Caixa: </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumo do dia: </Text>
          <Text style={styles.good}>Entradas: {formatMoneyBR(todaySummary.entradasDia)}</Text>
          <Text style={styles.bad}>Saídas: {formatMoneyBR(todaySummary.saidasDia)}</Text>
          <Text style={styles.balance}>Saldo: {formatMoneyBR(todaySummary.saldoDia)}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Resumo mensal: </Text>
          {monthlySummary.map((m) => (
            <View key={m.m} style={styles.monthRow}>
              <Text style={styles.monthText}>{formatMonthBR(m.m)}</Text>
              <Text style={styles.good}>{formatMoneyBR(m.e)}</Text>
              <Text style={styles.bad}>{formatMoneyBR(m.s)}</Text>
              <Text style={styles.balance}>{formatMoneyBR(m.saldo)}</Text>
            </View>
          ))}
          {monthlySummary.length === 0 ? <Text style={styles.empty}>Sem movimentações registradas.</Text> : null}
        </View>

        <TouchableOpacity style={[styles.button, styles.buttonGood]} onPress={() => navigation.navigate('Nova Entrada')}>
          <Text style={styles.buttonText}>NOVA ENTRADA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonBad]} onPress={() => navigation.navigate('Nova Saída')}>
          <Text style={styles.buttonText}>NOVA SAÍDA</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.button, styles.buttonEdit]} onPress={() => navigation.navigate('Gerenciar Fluxo')}>
          <Text style={styles.buttonText}>GERENCIAR ENTRADAS E SAÍDAS</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },
  container: { alignItems: 'center' },
  title: { alignSelf: 'flex-start', color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 22, marginBottom: 10 },
  card: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.light, padding: 14, marginBottom: 12 },
  sectionTitle: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 18, marginBottom: 8 },
  good: { color: COLORS.success, fontFamily: 'times', fontWeight: '700' },
  bad: { color: COLORS.error, fontFamily: 'times', fontWeight: '700' },
  balance: { color: COLORS.primaryBg, fontFamily: 'times', fontWeight: '700' },
  monthRow: { paddingVertical: 8, borderBottomWidth: 0.5, borderBottomColor: COLORS.light },
  monthText: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700' },
  empty: { textAlign: 'center', color: COLORS.primary, fontFamily: 'times', fontWeight: '700' },
  button: { width: '80%', borderRadius: 50, paddingVertical: 14, alignItems: 'center', marginTop: 12 },
  buttonGood: { backgroundColor: COLORS.successLight },
  buttonBad: { backgroundColor: COLORS.errorLight },
  buttonEdit: { backgroundColor: COLORS.primaryBg },
  buttonText: { color: COLORS.button, fontFamily: 'times', fontWeight: '700' },
});
