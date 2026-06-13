import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, FlatList, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, getDocs, orderBy, query, updateDoc, deleteDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { normalizeSearch, sanitizeSafeText, formatDateTimeBR } from '../extra/utils';
import { SchedulingDoc, SchedulingFilterField } from './scheduling/types';

type Agendamento = {
  id: string;
  clienteCpf: string;
  clienteEmail: string;
  clienteEndereco: string;
  clienteId: string;
  clienteNome: string;
  clienteTelefone: string;
  createdAt: number;
  dataAgendada: string;
  horaAgendada: string;
  observacoes: string;
  scheduledAt: number;
  status: string;
  updatedAt: number;
};

const FILTERS: SchedulingFilterField[] = ['Nome do Cliente', 'Data', 'Status'];

export function PastSchedulingsScreen() {
  const [items, setItems] = useState<SchedulingDoc[]>([]);
  const [filterField, setFilterField] = useState<SchedulingFilterField>('Nome do Cliente');
  const [filterText, setFilterText] = useState('');
  const [filterOpen, setFilterOpen] = useState(false);
  const [selected, setSelected] = useState<SchedulingDoc | null>(null);
  const [info, setInfo] = useState<Agendamento | null>(null);

  const handleDelete = async () => {
    if (!selected?.id) return;

    Alert.alert(
      "Confirmar Exclusão",
      "Deseja realmente excluir este agendamento?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Confirmar",
          style: "destructive",
          onPress: async () => {
            try {
              const docRef = doc(db, COLLECTIONS.agendamentos, selected.id);
              await deleteDoc(docRef);

              setSelected(null);

              Alert.alert("Sucesso", "Agendamento excluído com sucesso.");

              if (typeof load === 'function') {
                await load();
              }
            } catch (error) {
              console.error("Erro ao excluir agendamento:", error);
              Alert.alert("Erro", "Não foi possível excluir o agendamento.");
            }
          }
        }
      ]
    );
  };


  const load = useCallback(async () => {
    const snap = await getDocs(query(collection(db, COLLECTIONS.agendamentos), orderBy('scheduledAt', 'desc')));
    setItems(
      snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) } as SchedulingDoc))
        .filter((a) => a.status === 'Concluído' || a.status === 'Cancelado')
    );
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const filtered = useMemo(() => {
    const term = normalizeSearch(filterText);
    if (!term) return items;
    return items.filter((a) => {
      if (filterField === 'Nome do Cliente') return normalizeSearch(a.clienteNome).includes(term);
      if (filterField === 'Data') return normalizeSearch(a.dataAgendada).includes(term);
      return normalizeSearch(a.status).includes(term);
    });
  }, [items, filterField, filterText]);

  const remove = async () => {
    if (!selected) return;
    Alert.alert('Tem certeza que deseja excluir?', 'Esta ação não pode ser desfeita.', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: async () => {
          await updateDoc(doc(db, COLLECTIONS.agendamentos, selected.id), {
            status: 'Cancelado',
            updatedAt: Date.now(),
            canceledAt: Date.now(),
          });
          setSelected(null);
          await load();
        },
      },
    ]);
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.title}>Agendamentos Passados: </Text>

        <TouchableOpacity style={styles.select} onPress={() => setFilterOpen(true)}>
          <Text style={styles.selectText}>{filterField} ▼</Text>
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholderTextColor={COLORS.placeholder}
          value={filterText}
          onChangeText={(t) => setFilterText(sanitizeSafeText(t))}
          placeholder="Digite a busca"
        />

        {filtered.map((item) => (
          <View key={item.id} style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{item.clienteNome}</Text>
              <Text style={styles.meta}>{formatDateTimeBR(item.scheduledAt)} • {item.status}</Text>
            </View>
            <TouchableOpacity style={styles.menu} onPress={() => setSelected(item)}>
              <Text style={styles.menuText}>☰</Text>
            </TouchableOpacity>
          </View>
        ))}

        {filtered.length === 0 && <Text style={styles.empty}>Nenhum resultado encontrado.</Text>}
      </View>

      <Modal transparent visible={!!selected} animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.overlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modal} onPress={() => { }}>
            <ScrollView>
              <Text style={styles.modalTitle}>Detalhes: </Text>
              <Text style={styles.modalText}>Cliente: <Text
                style={styles.modalAwnser}
              >{selected?.clienteNome}</Text></Text>
              <Text style={styles.modalText}>Endereço do Cliente: <Text
                style={styles.modalAwnser}
              >{selected?.clienteEndereco}</Text></Text>
              <Text style={styles.modalText}>Data: <Text
                style={styles.modalAwnser}
              >{selected?.dataAgendada}</Text></Text>
              <Text style={styles.modalText}>Hora: <Text
                style={styles.modalAwnser}
              >{selected?.horaAgendada}</Text></Text>
              <Text style={styles.modalText}>Status: <Text
                style={styles.modalAwnser}
              >{selected?.status}</Text></Text>

              <TouchableOpacity
                style={[styles.infoBtn, { backgroundColor: COLORS.errorLight }]}
                onPress={handleDelete}
              >
                <Text style={[styles.infoText, { color: COLORS.fill }]}>EXCLUIR AGENDAMENTO</Text>
              </TouchableOpacity>

            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={filterOpen} animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setFilterOpen(false)}>
          <View style={styles.picker}>
            {FILTERS.map((opt) => (
              <TouchableOpacity key={opt} style={styles.pickerItem} onPress={() => { setFilterField(opt); setFilterOpen(false); }}>
                <Text style={styles.pickerText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light,
    marginBottom: 30
  },

  title: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12
  },

  select: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },

  selectText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
    textAlign: 'center'
  },

  input: {
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
    gap: 10
  },

  name: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700'
  },

  meta: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    marginTop: 2
  },

  menu: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center'
  },

  menuText: {
    color: COLORS.button,
    fontSize: 20,
    fontWeight: '700'
  },

  empty: {
    textAlign: 'center',
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    paddingVertical: 18
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16
  },

  modal: {
    width: '94%',
    maxHeight: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16
  },

  modalTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 10
  },

  modalText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 14,
  },

  modalAwnser: {
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 12,
  },

  modalBtn: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10
  },

  modalBtnText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700'
  },

  picker: {
    width: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10
  },

  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light
  },

  pickerText: {
    textAlign: 'center',
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '700'
  },

  infoBtn: {
    marginTop: 8,
    backgroundColor: COLORS.fill,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },

  infoText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700'
  },

});