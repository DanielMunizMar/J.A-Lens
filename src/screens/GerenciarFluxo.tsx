import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Modal, Pressable, TextInput, Alert, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { formatMoneyBR, parseMoneyBR } from '../extra/utils';

type Entry = { id: string; valor: number; descricao: string; formaPagamento?: string; createdAt: number };
type Exit = { id: string; valor: number; descricao: string; categoria?: string; createdAt: number };

const PAYMENTS = ['Dinheiro físico', 'Cartão de Crédito/Débito', 'Pix'];
const CATEGORIES = ['Transporte', 'Manutenção', 'Mercadoria', 'Serviços', 'Marketing', 'Equipe', 'Mensalidades'];

function formatarData(timestamp: number): string {
  const data = new Date(timestamp);
  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
}


export function GerenciarFluxo({ navigation }: any) {
  const [entradas, setEntradas] = useState<Entry[]>([]);
  const [saidas, setSaidas] = useState<Exit[]>([]);
  const [editingType, setEditingType] = useState<'entrada' | 'saida' | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formaPagamento, setFormaPagamento] = useState(PAYMENTS[0]);
  const [categoria, setCategoria] = useState(CATEGORIES[0]);
  const [pickerOpen, setPickerOpen] = useState(false);

  useFocusEffect(
    React.useCallback(() => {
      loadData();
      return () => { };
    }, [])
  );

  const loadData = async () => {
    const [eSnap, sSnap] = await Promise.all([
      getDocs(query(collection(db, COLLECTIONS.entradas), orderBy('createdAt', 'desc'))),
      getDocs(query(collection(db, COLLECTIONS.saidas), orderBy('createdAt', 'desc'))),
    ]);
    setEntradas(
      eSnap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : data.createdAt?.toMillis?.() || Date.now(),
        } as Entry;
      })
    );
    setSaidas(
      sSnap.docs.map(d => {
        const data = d.data() as any;
        return {
          id: d.id,
          ...data,
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : data.createdAt?.toMillis?.() || Date.now(),
        } as Exit;
      })
    );
  };

  const openEdit = (type: 'entrada' | 'saida', item: Entry | Exit) => {
    setEditingType(type);
    setEditingId(item.id);
    setValor(item.valor.toString());
    setDescricao(item.descricao);
    if (type === 'entrada' && 'formaPagamento' in item) {
      setFormaPagamento(item.formaPagamento || PAYMENTS[0]);
    } else if (type === 'saida' && 'categoria' in item) {
      setCategoria(item.categoria || CATEGORIES[0]);
    }
    setShowModal(true);
  };

  const saveEdit = async () => {
    const n = parseMoneyBR(valor);
    if (n <= 0) return Alert.alert('Validação', 'Informe um valor válido.');
    if (!descricao.trim()) return Alert.alert('Validação', 'Informe a descrição.');

    if (editingType === 'entrada' && editingId) {
      await updateDoc(doc(db, COLLECTIONS.entradas, editingId), {
        valor: n,
        descricao: descricao.trim(),
        formaPagamento,
      });
    } else if (editingType === 'saida' && editingId) {
      await updateDoc(doc(db, COLLECTIONS.saidas, editingId), {
        valor: n,
        descricao: descricao.trim(),
        categoria,
      });
    }

    setShowModal(false);
    Alert.alert('Sucesso', 'Alterações salvas.');
    loadData();
  };

  const deleteItem = async (type: 'entrada' | 'saida', id: string) => {
    Alert.alert('Confirmar', 'Deseja realmente deletar?', [
      { text: 'Cancelar', onPress: () => { } },
      {
        text: 'Deletar',
        onPress: async () => {
          const col = type === 'entrada' ? COLLECTIONS.entradas : COLLECTIONS.saidas;
          await deleteDoc(doc(db, col, id));
          Alert.alert('Sucesso', 'Item removido.');
          loadData();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        <Text style={styles.title}>Gerenciar Fluxo de Caixa: </Text>

        <View style={[styles.card, { marginBottom: 14 }]}>
          <Text style={styles.sectionTitle}>Entradas: </Text>
          {entradas.length === 0 ? (
            <Text style={styles.empty}>Nenhuma entrada registrada.</Text>
          ) : (
            entradas.map((e) => (
              <View key={e.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemValue}>{formatMoneyBR(e.valor)}</Text>
                  <Text style={styles.itemDesc}>{e.descricao}</Text>
                  <Text style={styles.itemMeta}>{e.formaPagamento}</Text>
                  <Text style={styles.itemData}>Criado em: {formatarData(e.createdAt)}</Text>
                </View>
                <View style={styles.itemButtons}>
                  <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.primaryBg }]} onPress={() => openEdit('entrada', e)}>
                    <Text style={styles.iconText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.error }]} onPress={() => deleteItem('entrada', e.id)}>
                    <Text style={styles.iconText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Saídas: </Text>
          {saidas.length === 0 ? (
            <Text style={styles.empty}>Nenhuma saída registrada.</Text>
          ) : (
            saidas.map((s) => (
              <View key={s.id} style={styles.itemRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemValue}>{formatMoneyBR(s.valor)}</Text>
                  <Text style={styles.itemDesc}>{s.descricao}</Text>
                  <Text style={styles.itemMeta}>{s.categoria}</Text>
                  <Text style={styles.itemData}>Criado em: {formatarData(s.createdAt)}</Text>
                </View>
                <View style={styles.itemButtons}>
                  <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.primaryBg }]} onPress={() => openEdit('saida', s)}>
                    <Text style={styles.iconText}>✎</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.iconButton, { backgroundColor: COLORS.error }]} onPress={() => deleteItem('saida', s.id)}>
                    <Text style={styles.iconText}>✕</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </View>
      </View>

      <Modal visible={showModal} transparent animationType="fade" onRequestClose={() => setShowModal(false)}>
        <Pressable style={styles.overlay} onPress={() => setShowModal(false)}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Editar {editingType === 'entrada' ? 'Entrada' : 'Saída'}</Text>

            <TextInput
              style={styles.input}
              placeholder="0,00"
              placeholderTextColor={COLORS.placeholder}
              value={valor}
              onChangeText={setValor}
              keyboardType="decimal-pad"
            />

            <TextInput
              style={styles.input}
              placeholder="Descrição"
              placeholderTextColor={COLORS.placeholder}
              value={descricao}
              onChangeText={setDescricao}
            />

            {editingType === 'entrada' ? (
              <TouchableOpacity style={styles.select} onPress={() => setPickerOpen(true)}>
                <Text style={styles.selectText}>{formaPagamento} ▼</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.select} onPress={() => setPickerOpen(true)}>
                <Text style={styles.selectText}>{categoria} ▼</Text>
              </TouchableOpacity>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.successLight }]} onPress={saveEdit}>
                <Text style={styles.buttonText}>SALVAR</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, { backgroundColor: COLORS.error }]} onPress={() => setShowModal(false)}>
                <Text style={styles.buttonText}>CANCELAR</Text>
              </TouchableOpacity>
            </View>

            <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
              <Pressable style={styles.overlay} onPress={() => setPickerOpen(false)}>
                <View style={styles.pickerModal}>
                  {(editingType === 'entrada' ? PAYMENTS : CATEGORIES).map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={styles.option}
                      onPress={() => {
                        if (editingType === 'entrada') {
                          setFormaPagamento(opt);
                        } else {
                          setCategoria(opt);
                        }
                        setPickerOpen(false);
                      }}
                    >
                      <Text style={styles.optionText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </Pressable>
            </Modal>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },
  container: { alignItems: 'center' },
  title: { alignSelf: 'flex-start', color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 22, marginBottom: 10 },
  card: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, borderWidth: 1, borderColor: COLORS.light, padding: 14, marginBottom: 12 },
  sectionTitle: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 18, marginBottom: 12 },
  itemRow: { flexDirection: 'row', paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.light, alignItems: 'center', justifyContent: 'space-between' },
  itemValue: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 16 },
  itemDesc: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', marginTop: 4 },

  itemData: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 12,
    marginTop: 2
  },

  itemMeta: { color: COLORS.placeholder, fontFamily: 'times', fontWeight: '700', fontSize: 12, marginTop: 2 },
  itemButtons: { flexDirection: 'row', gap: 8 },
  iconButton: { width: 36, height: 36, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  iconText: { color: COLORS.button, fontSize: 18, fontWeight: '700' },
  empty: { textAlign: 'center', color: COLORS.primary, fontFamily: 'times', fontWeight: '700', paddingVertical: 20 },
  overlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center' },
  modal: { width: '85%', backgroundColor: COLORS.card, borderRadius: 20, padding: 20 },
  modalTitle: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 20, marginBottom: 14, textAlign: 'center' },
  input: { backgroundColor: COLORS.fill, borderWidth: 1, borderColor: COLORS.focused, borderRadius: 12, padding: 12, marginBottom: 10, fontFamily: 'times', fontWeight: '700' },
  select: { backgroundColor: COLORS.primaryBg, borderRadius: 12, padding: 12, marginBottom: 10 },
  selectText: { color: COLORS.button, textAlign: 'center', fontFamily: 'times', fontWeight: '700' },
  modalButtons: { flexDirection: 'row', gap: 10, marginTop: 16 },
  button: { flex: 1, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  buttonText: { color: COLORS.button, fontFamily: 'times', fontWeight: '700' },
  pickerModal: { width: '80%', backgroundColor: COLORS.card, borderRadius: 14, padding: 10 },
  option: { paddingVertical: 12, borderBottomWidth: 0.5, borderBottomColor: COLORS.light },
  optionText: { textAlign: 'center', color: COLORS.primaryBg, fontFamily: 'times', fontWeight: '700' },
});
