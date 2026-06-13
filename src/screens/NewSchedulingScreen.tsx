import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  Modal, Pressable, FlatList, ScrollView, Alert
} from 'react-native';
import { addDoc, collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import {
  formatCPF, formatDate, formatTime, normalizeSearch,
  onlyDigits, parseBRDateTimeToTimestamp, sanitizeSafeText
} from '../extra/utils';
import { ClientDoc, ClientSearchField, SchedulingDoc } from './scheduling/types';
import { hasSchedulingConflict } from './scheduling/schedulingRules';

const SEARCH_FIELDS: ClientSearchField[] = ['Nome', 'E-mail', 'CPF'];

export function NewSchedulingScreen({ navigation, route }: any) {
  const schedulingToEdit = route.params?.schedulingToEdit as SchedulingDoc | undefined;
  const [clients, setClients] = useState<ClientDoc[]>([]);
  const [clientOpen, setClientOpen] = useState(false);
  const [searchField, setSearchField] = useState<ClientSearchField>('Nome');
  const [fieldOpen, setFieldOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  const [selectedClient, setSelectedClient] = useState<ClientDoc | null>(
    schedulingToEdit ? {
      id: schedulingToEdit.clienteId,
      nomeCompleto: schedulingToEdit.clienteNome,
      email: schedulingToEdit.clienteEmail,
      cpf: schedulingToEdit.clienteCpf,
      endereco: schedulingToEdit.clienteEndereco,
    } as any : null
  );
  const [dateBR, setDateBR] = useState(schedulingToEdit ? schedulingToEdit.dataAgendada : '');
  const [timeBR, setTimeBR] = useState(schedulingToEdit ? schedulingToEdit.horaAgendada : '');
  const [observacoes, setObservacoes] = useState(schedulingToEdit ? schedulingToEdit.observacoes || '' : '');
  const [saving, setSaving] = useState(false);





  React.useEffect(() => {
    (async () => {
      const snap = await getDocs(query(collection(db, COLLECTIONS.usuarios), orderBy('nomeCompleto', 'asc')));
      setClients(
        snap.docs
          .map((d) => ({ id: d.id, ...(d.data() as any) } as ClientDoc))
          .filter((u) => u.tipoUsuario === 'cliente' && u.statusAtivo !== false)
      );
    })();
  }, []);

  const filteredClients = useMemo(() => {
    const term = normalizeSearch(searchText);
    if (!term) return clients;

    return clients.filter((c) => {
      if (searchField === 'Nome') return normalizeSearch(c.nomeCompleto).includes(term);
      if (searchField === 'E-mail') return normalizeSearch(c.email).includes(term);
      return onlyDigits(c.cpf).includes(onlyDigits(searchText));
    });
  }, [clients, searchField, searchText]);

  const save = async () => {
    if (!selectedClient) return Alert.alert('Validação', 'Selecione um cliente.');
    if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(dateBR)) return Alert.alert('Validação', 'Informe uma data válida.');
    if (!/^(\d{2}):(\d{2})$/.test(timeBR)) return Alert.alert('Validação', 'Informe um horário válido.');

    const scheduledAt = parseBRDateTimeToTimestamp(dateBR, timeBR);
    if (scheduledAt <= Date.now()) return Alert.alert('Validação', 'A data/hora precisa ser futura.');

    setSaving(true);
    try {
      const snap = await getDocs(query(collection(db, COLLECTIONS.agendamentos), orderBy('scheduledAt', 'asc')));

      // Filtra conflitos ignorando o próprio documento se for uma edição
      const marked = snap.docs
        .map((d) => ({ id: d.id, ...(d.data() as any) }))
        .filter((a: any) => a.status === 'Marcado' && (schedulingToEdit ? a.id !== schedulingToEdit.id : true));

      if (hasSchedulingConflict(scheduledAt, marked as any)) {
        Alert.alert('Conflito de horário', 'Já existe um agendamento marcado dentro da janela de 1 hora.');
        return;
      }

      // 1. Objeto base com os dados do agendamento
      const dadosAgendamento = {
        clienteId: selectedClient.id,
        clienteNome: sanitizeSafeText(selectedClient.nomeCompleto),
        clienteEmail: sanitizeSafeText(selectedClient.email),
        clienteCpf: formatCPF(selectedClient.cpf),
        clienteEndereco: sanitizeSafeText(selectedClient.endereco || ''),
        clienteTelefone: selectedClient.telefone ? sanitizeSafeText(selectedClient.telefone) : '',
        dataAgendada: dateBR,
        horaAgendada: timeBR,
        scheduledAt,
        status: 'Marcado',
        observacoes: sanitizeSafeText(observacoes),
        updatedAt: Date.now(),
      };

      // 2. Gravação Condicional (if/else)
      if (schedulingToEdit) {
        // SE FOR EDIÇÃO: Atualiza o documento existente usando a referência correta
        await updateDoc(doc(db, COLLECTIONS.agendamentos, schedulingToEdit.id), dadosAgendamento);
        Alert.alert('Sucesso', 'Agendamento atualizado com sucesso.');
      } else {
        // SE FOR NOVO: Adiciona um novo documento incluindo a data de criação
        await addDoc(collection(db, COLLECTIONS.agendamentos), {
          ...dadosAgendamento,
          createdAt: Date.now(),
        });
        Alert.alert('Sucesso', 'Agendamento criado com sucesso.');
      }


      navigation.goBack();
    } finally {
      setSaving(false);
    }

  };

  const canSave = !!selectedClient && dateBR.length === 10 && timeBR.length === 5;

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <StatusBar style="dark" />
      <View style={styles.card}>
        <Text style={styles.title}>{schedulingToEdit ? 'Editar Agendamento:' : 'Marcar Agendamento:'}</Text>

        <Text style={styles.label}>Cliente: </Text>
        <TouchableOpacity style={styles.select} onPress={() => setClientOpen(true)}>
          <Text style={styles.selectText}>{selectedClient ? selectedClient.nomeCompleto : 'Selecionar cliente'}</Text>
        </TouchableOpacity>

        <Text style={styles.label}>Data: </Text>
        <TextInput
          style={styles.input}
          value={dateBR}
          onChangeText={(t) => setDateBR(formatDate(t))}
          placeholder="DD/MM/AAAA"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Hora: </Text>
        <TextInput
          style={styles.input}
          value={timeBR}
          onChangeText={(t) => setTimeBR(formatTime(t))}
          placeholder="HH:MM"
          keyboardType="numeric"
        />

        <Text style={styles.label}>Observações: </Text>
        <TextInput
          style={[styles.input, styles.multi]}
          value={observacoes}
          onChangeText={(t) => setObservacoes(t)}
          placeholder="Observações"
          multiline
        />

        <TouchableOpacity
          style={[styles.button, (!canSave || saving) && styles.buttonDisabled]}
          onPress={save}
          disabled={!canSave || saving}
        >
          <Text style={styles.buttonText}>
            {saving ? 'SALVANDO...' : schedulingToEdit ? 'SALVAR ALTERAÇÕES' : 'SALVAR AGENDAMENTO'}
          </Text>

        </TouchableOpacity>
      </View>

      <Modal transparent visible={clientOpen} animationType="fade" onRequestClose={() => setClientOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setClientOpen(false)}>
          <Pressable style={styles.modal} onPress={() => { }}>
            <Text style={styles.modalTitle}>Selecionar cliente</Text>

            <TouchableOpacity
              style={[styles.select, schedulingToEdit && { opacity: 0.6 }]}
              onPress={() => !schedulingToEdit && setClientOpen(true)}
              disabled={!!schedulingToEdit}
            >
              <Text style={styles.selectText}>{selectedClient ? selectedClient.nomeCompleto : 'Selecionar cliente'}</Text>
            </TouchableOpacity>


            <TextInput
              style={styles.input}
              value={searchText}
              onChangeText={(t) => setSearchText(sanitizeSafeText(t))}
              placeholder="Buscar"
            />

            <FlatList
              data={filteredClients}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.clientRow}
                  onPress={() => {
                    setSelectedClient(item);
                    setClientOpen(false);
                  }}
                >
                  <Text style={styles.clientName}>{item.nomeCompleto}</Text>
                  <Text style={styles.clientMeta}>{formatCPF(item.cpf)}</Text>
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={fieldOpen} animationType="fade" onRequestClose={() => setFieldOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setFieldOpen(false)}>
          <View style={styles.picker}>
            {SEARCH_FIELDS.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.pickerItem}
                onPress={() => {
                  setSearchField(opt);
                  setFieldOpen(false);
                }}
              >
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
  scroll: {
    flexGrow: 1,
    backgroundColor: COLORS.screen,
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light,
    marginBottom: 30,
  },

  title: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 12,
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

  multi: {
    minHeight: 70,
  },

  select: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },

  selectText: {
    color: COLORS.button,
    textAlign: 'center',
    fontFamily: 'times',
    fontWeight: '700',
  },

  button: {
    backgroundColor: COLORS.successLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },

  buttonDisabled: {
    opacity: 0.6,
  },

  buttonText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
  },

  overlay: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18,
  },

  modal: {
    width: '94%',
    maxHeight: '82%',
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

  clientRow: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  clientName: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  clientMeta: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    marginTop: 2,
  },

  picker: {
    width: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 14,
    padding: 10,
  },

  pickerItem: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  pickerText: {
    textAlign: 'center',
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '700',
  },
});