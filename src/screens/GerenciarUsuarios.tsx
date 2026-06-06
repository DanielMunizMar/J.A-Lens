import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, Modal,
  Pressable, ScrollView, Alert
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { normalizeSearch, onlyDigits, formatCPF, formatPhone, formatDate } from '../extra/utils';

type UserDoc = {
  id: string;
  nomeCompleto: string;
  email: string;
  cpf: string;
  telefone?: string;
  endereco?: string;
  dataNascimento?: string;
  tipoUsuario: 'funcionario' | 'cliente';
  statusAtivo: boolean;
  authUid?: string;
  createdAt?: number;
  updatedAt?: number;
};

export function GerenciarUsuarios({ navigation }: any) {
  const [usuarios, setUsuarios] = useState<UserDoc[]>([]);
  const [filtroTipo, setFiltroTipo] = useState<'Nome' | 'CPF' | 'E-mail'>('Nome');
  const [texto, setTexto] = useState('');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selected, setSelected] = useState<UserDoc | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleteText, setDeleteText] = useState('');

  const load = async () => {
    const snap = await getDocs(query(
      collection(db, COLLECTIONS.usuarios),
      orderBy('createdAt', 'desc')
    ));
    const filtered = snap.docs
      .map(d => ({ id: d.id, ...(d.data() as any) } as UserDoc))
      .filter(u => !u.authUid);
    setUsuarios(filtered);
  };

  useFocusEffect(
    React.useCallback(() => {
      load();
      setSelected(null);
    }, [])
  );

  const filtered = useMemo(() => {
    const term = normalizeSearch(texto);
    if (!term) return usuarios;

    return usuarios.filter((u) => {
      const name = normalizeSearch(u.nomeCompleto);
      const cpf = onlyDigits(u.cpf);
      const email = normalizeSearch(u.email);

      if (filtroTipo === 'Nome') return name.includes(term);
      if (filtroTipo === 'CPF') return cpf.includes(onlyDigits(texto));
      return email.includes(term);
    });
  }, [usuarios, texto, filtroTipo]);

  const removeUser = async () => {
    if (!selected) return;
    if (normalizeSearch(deleteText) !== normalizeSearch(selected.nomeCompleto)) {
      Alert.alert('Confirmação inválida', 'Digite exatamente o nome completo para confirmar.');
      return;
    }
    await deleteDoc(doc(db, COLLECTIONS.usuarios, selected.id));
    setDeleteConfirmOpen(false);
    setSelected(null);
    setDeleteText('');
    await load();
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.cardTop}>
          <Text style={styles.header}>FILTRO</Text>

          <View style={styles.filterRow}>
            <Text style={styles.label}>Filtrar por:</Text>
            <TouchableOpacity style={styles.select} onPress={() => setPickerOpen(true)}>
              <Text style={styles.selectText}>{filtroTipo} ▼</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Insira o filtro"
            placeholderTextColor={COLORS.placeholder}
            value={texto}
            onChangeText={setTexto}
          />
        </View>

        <View style={styles.spaceSecundary}>
          {filtered.map((item) => (
            <View key={item.id} style={styles.cardUser}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{item.nomeCompleto}</Text>
                <Text style={styles.userMeta}>{item.cpf}</Text>
              </View>

              <TouchableOpacity
                style={styles.menuButton}
                onPress={() => setSelected(item)}
              >
                <Text style={styles.menuText}>☰</Text>
              </TouchableOpacity>
            </View>
          ))}

          {filtered.length === 0 ? (
            <Text style={styles.empty}>Nenhum usuário encontrado.</Text>
          ) : null}
        </View>
      </View>

      <Modal visible={!!selected && !deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setSelected(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setSelected(null)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <Text style={styles.modalTitle}>{selected?.nomeCompleto}</Text>
            <Text style={styles.modalText}>E-mail: {selected?.email}</Text>
            <Text style={styles.modalText}>CPF: {selected?.cpf}</Text>
            <Text style={styles.modalText}>Telefone: {selected?.telefone || '-'}</Text>
            <Text style={styles.modalText}>Endereço: {selected?.endereco || '-'}</Text>
            <Text style={styles.modalText}>Nascimento: {selected?.dataNascimento || '-'}</Text>
            <Text style={styles.modalText}>Tipo: {selected?.tipoUsuario}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                if (selected) {
                  setSelected(null);
                  navigation.navigate('Cadastrar Usuários', { userId: selected.id });
                }
              }}
            >
              <Text style={styles.modalButtonText}>Editar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: COLORS.errorLight }]}
              onPress={() => setDeleteConfirmOpen(true)}
            >
              <Text style={styles.modalButtonText}>Excluir</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={deleteConfirmOpen} transparent animationType="fade" onRequestClose={() => setDeleteConfirmOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteConfirmOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalText}>Digite o nome completo abaixo para confirmar:</Text>
            <Text style={[styles.modalText, { fontWeight: '700', marginBottom: 6 }]}>{selected?.nomeCompleto}</Text>
            <TextInput style={styles.input} value={deleteText} onChangeText={setDeleteText} placeholder="Nome completo" placeholderTextColor={COLORS.placeholder} />
            <TouchableOpacity style={styles.modalButton} onPress={removeUser}>
              <Text style={styles.modalButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
          <View style={styles.modalCard}>
            {(['Nome', 'CPF', 'E-mail'] as const).map((opt) => (
              <TouchableOpacity key={opt} style={styles.option} onPress={() => { setFiltroTipo(opt); setPickerOpen(false); }}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },
  container: { 
    alignItems: 'center' 
  },

  cardTop: { 
    width: '100%', 
    backgroundColor: COLORS.card, 
    borderRadius: 20, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: COLORS.focused, 
    elevation: 4 
  },

  header: 
  { color: COLORS.button, 
    fontFamily: 'times', 
    fontWeight: '700', 
    fontSize: 24, 
    backgroundColor: COLORS.primaryBg, 
    textAlign: 'center', 
    borderRadius: 50, 
    paddingVertical: 8, 
    marginBottom: 10 
  },
  
  filterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  label: { fontFamily: 'times', color: COLORS.primary, fontWeight: '700', fontSize: 17 },
  select: { backgroundColor: COLORS.primaryBg, borderRadius: 10, paddingVertical: 12, paddingHorizontal: 14, minWidth: '55%' },
  selectText: { color: COLORS.button, textAlign: 'center', fontFamily: 'times', fontWeight: '700' },
  input: { backgroundColor: COLORS.fill, borderWidth: 1, borderColor: COLORS.focused, borderRadius: 14, padding: 12, color: COLORS.text, fontFamily: 'times', fontWeight: '700' },
  spaceSecundary: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.focused, marginTop: 16, marginBottom: 30 },
  cardUser: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.primaryBg, borderRadius: 16, padding: 12, marginBottom: 10 },
  userName: { color: COLORS.button, fontFamily: 'times', fontWeight: '700', fontSize: 18 },
  userMeta: { color: COLORS.button, opacity: 0.85, fontFamily: 'times', fontWeight: '700', fontSize: 12 },
  menuButton: { width: 44, height: 44, borderRadius: 10, backgroundColor: COLORS.fill, alignItems: 'center', justifyContent: 'center' },
  menuText: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  empty: { textAlign: 'center', color: COLORS.primary, fontFamily: 'times', fontWeight: '700', paddingVertical: 12 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', alignItems: 'center', padding: 18 },
  modalCard: { width: '92%', backgroundColor: COLORS.card, borderRadius: 18, padding: 14 },
  modalTitle: { fontFamily: 'times', fontSize: 20, fontWeight: '700', color: COLORS.primary, marginBottom: 10 },
  modalText: { fontFamily: 'times', fontWeight: '700', color: COLORS.primary, marginBottom: 6 },
  modalButton: { backgroundColor: COLORS.primaryBg, paddingVertical: 12, borderRadius: 12, marginTop: 10 },
  modalButtonText: { textAlign: 'center', color: COLORS.button, fontFamily: 'times', fontWeight: '700' },
  option: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.light },
  optionText: { textAlign: 'center', color: COLORS.primaryBg, fontFamily: 'times', fontWeight: '700' },
});
