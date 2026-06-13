import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView } from 'react-native';
import { collection, deleteDoc, doc, getDocs, orderBy, query } from 'firebase/firestore';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { normalizeSearch } from '../extra/utils';

type Receita = {
  id?: string;
  numero: number;
  data: string;
  cliente: string;
  idade: string;
  armacao: string;
  odEsferico: string;
  odCilindro: string;
  odEixo: string;
  odDnp: string;
  oeEsferico: string;
  oeCilindro: string;
  oeEixo: string;
  oeDnp: string;
  adicao: string;
  tipoLente: string;
  tratamento: string;
  centroOtico: string;
  observacoes: string;
  clienteId?: string;
  createdAt: number;
};

export function HistoricoReceitas({ navigation }: any) {
  const [receitas, setReceitas] = useState<Receita[]>([]);
  const [selected, setSelected] = useState<Receita | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [filterNumero, setFilterNumero] = useState('');
  const [filterData, setFilterData] = useState('');
  const [filterCliente, setFilterCliente] = useState('');

  const load = async () => {
    const rSnap = await getDocs(query(collection(db, COLLECTIONS.receitas), orderBy('createdAt', 'desc')));
    const loaded = rSnap.docs.map(d => {
      const data = d.data() as any;
      const convertDate = (dateField: any) => {
        if (typeof dateField === 'string') return dateField;
        if (dateField?.toDate) return dateField.toDate().toISOString().slice(0, 10);
        return new Date().toISOString().slice(0, 10);
      };
      return {
        id: d.id,
        ...data,
        numero: typeof data.numero === 'number' ? data.numero : data.numero?.toNumber?.() || 0,
        data: convertDate(data.data),
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : data.createdAt?.toMillis?.() || Date.now(),
      } as Receita;
    });
    setReceitas(loaded);
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
      setSelected(null);
      setDeleteConfirmOpen(false);
    }, [])
  );

  const filtered = useMemo(() => {
    return receitas.filter((r) => {
      const byNumber = filterNumero ? r.numero.toString().includes(filterNumero.trim()) : true;
      const byDate = filterData ? normalizeSearch(r.data).includes(normalizeSearch(filterData.trim())) : true;
      const byClient = filterCliente ? normalizeSearch(r.cliente).includes(normalizeSearch(filterCliente.trim())) : true;
      return byNumber && byDate && byClient;
    });
  }, [receitas, filterNumero, filterData, filterCliente]);

  const confirmDelete = async () => {
    if (!selected?.id) return;
    await deleteDoc(doc(db, COLLECTIONS.receitas, selected.id));
    setDeleteConfirmOpen(false);
    setSelected(null);
    await load();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.card}>
        <StatusBar style="dark" />

        <Text style={styles.title}>Histórico de Receitas</Text>

        <TouchableOpacity style={styles.buttonCreate} onPress={() => navigation.navigate('Criar Receita')}>
          <Text style={styles.buttonText}>Criar Nova Receita</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Filtrar por Nº</Text>
        <TextInput
          style={styles.input}
          placeholder="Número da receita"
          placeholderTextColor={COLORS.placeholder}
          value={filterNumero}
          onChangeText={setFilterNumero}
          keyboardType="numeric"
        />

        <Text style={styles.label}>Filtrar por Data</Text>
        <TextInput
          style={styles.input}
          placeholder="Data (aaaa-mm-dd)"
          placeholderTextColor={COLORS.placeholder}
          value={filterData}
          onChangeText={setFilterData}
        />

        <Text style={styles.label}>Filtrar por Cliente</Text>
        <TextInput
          style={styles.input}
          placeholder="Nome do cliente"
          placeholderTextColor={COLORS.placeholder}
          value={filterCliente}
          onChangeText={setFilterCliente}
        />
      </View>

      <View style={styles.card}>
        {filtered.length === 0 ? (
          <Text style={styles.empty}>Nenhuma receita encontrada.</Text>
        ) : (
          filtered.map((item) => (
            <View key={item.id ?? `${item.numero}-${item.createdAt}`} style={styles.recipeRow}>
              <View style={styles.recipeRow}>
                <View style={styles.recipeInfo}>

                  <Text style={styles.recipeText}>Nº <Text
                    style={styles.modalAwnser}
                  >{item.numero}</Text></Text>

                  <Text style={styles.recipeText}>Cliente: <Text
                    style={styles.modalAwnser}
                  >{item.cliente}</Text></Text>

                  <Text style={styles.recipeText}>Data: <Text
                    style={styles.modalAwnser}
                  >{item.data}</Text></Text>

                </View>

                <TouchableOpacity
                  style={styles.menuButton}
                  onPress={() => setSelected(item)}
                >
                  <Text style={styles.menuText}>☰</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </View>

      <Modal visible={!!selected && !deleteConfirmOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setSelected(null)}
      >
        <View style={styles.overlay}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
          />

          <View style={styles.modalCard}>
            <ScrollView
              style={{ flexGrow: 1 }}
              contentContainerStyle={styles.modalContent}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Text style={styles.modalTitle}>Receita Nº {selected?.numero}: </Text>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Cliente:</Text>
                <Text style={styles.detailValue}>{selected?.cliente}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Data:</Text>
                <Text style={styles.detailValue}>{selected?.data}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Idade:</Text>
                <Text style={styles.detailValue}>{selected?.idade}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Armação:</Text>
                <Text style={styles.detailValue}>{selected?.armacao}</Text>
              </View>
              <Text style={styles.section}>OD: </Text>

              <Text style={styles.detailLabel}>Esférico: <Text
                style={styles.modalAwnser}
              >{selected?.odEsferico}</Text></Text>

              <Text style={styles.detailLabel}>Cilindro: <Text
                style={styles.modalAwnser}
              >{selected?.odCilindro}</Text></Text>

              <Text style={styles.detailLabel}>Eixo: <Text
                style={styles.modalAwnser}
              >{selected?.odEixo}</Text></Text>

              <Text style={styles.detailLabel}>DNP: <Text
                style={styles.modalAwnser}
              >{selected?.odDnp}</Text></Text>


              <Text style={styles.section}>OE: </Text>

              <Text style={styles.detailLabel}>Esférico: <Text
                style={styles.modalAwnser}
              >{selected?.oeEsferico}</Text></Text>

              <Text style={styles.detailLabel}>Cilindro: <Text
                style={styles.modalAwnser}
              >{selected?.oeCilindro}</Text></Text>

              <Text style={styles.detailLabel}>Eixo: <Text
                style={styles.modalAwnser}
              >{selected?.oeEixo}</Text></Text>

              <Text style={styles.detailLabel}>DNP: <Text
                style={styles.modalAwnser}
              >{selected?.oeDnp}</Text></Text>

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Lente:</Text>
                <Text style={styles.detailValue}>{selected?.tipoLente}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Tratamentos:</Text>
                <Text style={styles.detailValue}>{selected?.tratamento}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Centro Ótico:</Text>
                <Text style={styles.detailValue}>{selected?.centroOtico}</Text>
              </View>
              <Text style={[styles.detailLabel, { marginTop: 10 }]}>
                Observações:
              </Text>

              <Text style={styles.observationText}>
                {selected?.observacoes || '-'}
              </Text>

              <TouchableOpacity
                style={[styles.modalButton, styles.editButton]}
                onPress={() => {
                  if (selected?.id) {
                    const id = selected.id;
                    setSelected(null);
                    navigation.navigate('Criar Receita', { editId: id });
                  }
                }}
              >
                <Text style={styles.modalButtonText}>Editar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={() => setDeleteConfirmOpen(true)}>
                <Text style={styles.modalButtonText}>Excluir</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={() => setSelected(null)}>
                <Text style={styles.modalButtonText}>Fechar</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setDeleteConfirmOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setDeleteConfirmOpen(false)}>
          <Pressable style={styles.modal} onPress={() => { }}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalText}>Deseja excluir a receita Nº {selected?.numero}?</Text>
            <TouchableOpacity style={[styles.modalButton, styles.deleteButton]} onPress={confirmDelete}>
              <Text style={styles.modalButtonText}>Confirmar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.modalButton, styles.closeButton]} onPress={() => setDeleteConfirmOpen(false)}>
              <Text style={styles.modalButtonText}>Cancelar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.screen,
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.light,
    padding: 14,
    marginBottom: 14,
  },

  title: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 10,
  },

  label: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 6,
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

  buttonCreate: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 16,
  },

  buttonText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
  },

  recipeText: {
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
  },

  rowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },

  menuButton: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
  },

  menuText: {
    color: COLORS.button,
    fontSize: 18,
    fontFamily: 'times',
    fontWeight: '700',
  },

  empty: {
    textAlign: 'center',
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    paddingVertical: 20,
  },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modal: {
    width: '95%',
    maxHeight: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
  },

  modalTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 10,
  },

  modalText: {
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 10,
  },

  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },

  detailLabel: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 14,
    width: '40%',
  },

  detailValue: {
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 12,
    width: '58%',
  },

  section: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 4,
  },

  modalButton: {
    backgroundColor: COLORS.primaryBg,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 10,
    alignItems: 'center',
  },

  modalButtonText: {
    textAlign: 'center',
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
  },

  editButton: {
    backgroundColor: COLORS.primaryBg,
  },

  deleteButton: {
    backgroundColor: COLORS.errorLight,
  },

  closeButton: {
    backgroundColor: COLORS.successLight,
  },

  recipeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  recipeInfo: {
    flex: 1,
  },

  modalAwnser: {
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 12,
  },

  modalCard: {
    width: '92%',
    maxHeight: '85%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
  },

  modalContent: {
    paddingBottom: 10,
  },

  observationText: {
    marginTop: 4,
    lineHeight: 22,
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 12,
    textAlign: 'justify',
  },
});
