import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Modal, Pressable,
  ScrollView, FlatList, Alert, TextInput
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import {
  formatDate, formatTime, formatDateTimeBR,
  normalizeSearch, onlyDigits, parseBRDateTimeToTimestamp,
  sameLocalDay, sanitizeSafeText
} from '../extra/utils';
import { ClientDoc, SchedulingDoc, SchedulingStatus } from './scheduling/types';
import { hasSchedulingConflict, isOverduePending } from './scheduling/schedulingRules';

const YEARS = Array.from({ length: 31 }, (_, i) => new Date().getFullYear() - 15 + i);

function dayKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
}

export function SchedulingScreen({ navigation }: any) {
  const now = Date.now();
  const today = new Date();

  const [items, setItems] = useState<SchedulingDoc[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(today);
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth());
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [yearOpen, setYearOpen] = useState(false);

  const [detailsItem, setDetailsItem] = useState<SchedulingDoc | null>(null);
  const [rescheduleItem, setRescheduleItem] = useState<SchedulingDoc | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleTime, setRescheduleTime] = useState('');

  const load = useCallback(async () => {
    const snap = await getDocs(query(collection(db, COLLECTIONS.agendamentos), orderBy('scheduledAt', 'asc')));
    const loaded = snap.docs.map((d) => {
      const data = d.data() as any;
      return {
        id: d.id,
        clienteId: data.clienteId ?? '',
        clienteNome: data.clienteNome ?? '',
        clienteEmail: data.clienteEmail ?? '',
        clienteCpf: data.clienteCpf ?? '',
        clienteEndereco: data.clienteEndereco ?? '',
        clienteTelefone: data.clienteTelefone ?? '',
        dataAgendada: data.dataAgendada ?? '',
        horaAgendada: data.horaAgendada ?? '',
        scheduledAt: typeof data.scheduledAt === 'number' ? data.scheduledAt : Date.now(),
        status: data.status ?? 'Marcado',
        observacoes: data.observacoes ?? '',
        createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
        updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
        concludedAt: data.concludedAt,
        canceledAt: data.canceledAt,
        rescheduledAt: data.rescheduledAt,
      } as SchedulingDoc;
    });
    setItems(loaded);
  }, []);

  useFocusEffect(useCallback(() => {
    load();
  }, [load]));

  const pendingItems = useMemo(
    () => items.filter((a) => isOverduePending(a, Date.now())),
    [items]
  );

  const monthItems = useMemo(
    () => items.filter((a) => {
      const d = new Date(a.scheduledAt);
      return d.getFullYear() === calendarYear && d.getMonth() === calendarMonth;
    }),
    [items, calendarYear, calendarMonth]
  );

  const markedDays = useMemo(() => {
    const set = new Set<number>();
    monthItems.forEach((a) => {
      if (a.status === 'Marcado') set.add(new Date(a.scheduledAt).getDate());
    });
    return set;
  }, [monthItems]);

  const selectedItems = useMemo(
    () => items.filter((a) => sameLocalDay(a.scheduledAt, selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate())),
    [items, selectedDate]
  );

  const moveMonth = (delta: number) => {
    const next = new Date(calendarYear, calendarMonth + delta, 1);
    setCalendarMonth(next.getMonth());
    setCalendarYear(next.getFullYear());
    setSelectedDate(new Date(next.getFullYear(), next.getMonth(), 1));
  };

  const openReschedule = (item: SchedulingDoc) => {
    setRescheduleItem(item);
    setRescheduleDate(item.dataAgendada);
    setRescheduleTime(item.horaAgendada);
  };

  const finalizeScheduling = async (id: string, status: SchedulingStatus) => {
    try {
      await updateDoc(doc(db, COLLECTIONS.agendamentos, id), {
        status,
        updatedAt: Date.now(),
      });

      setItems(prevItems => prevItems.map(item =>
        item.id === id ? { ...item, status, updatedAt: Date.now() } : item
      ));

      await load();
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível atualizar o agendamento.');
      console.error(error);
    }
  };

  const confirmCancel = (item: SchedulingDoc) => {
    Alert.alert('Confirmar cancelamento', 'Tem certeza que deseja cancelar?', [
      { text: 'Não', style: 'cancel' },
      {
        text: 'Sim',
        style: 'destructive',
        onPress: () => finalizeScheduling(item.id, 'Cancelado'),
      },
    ]);
  };

  const saveReschedule = async () => {
    if (!rescheduleItem) return;

    const cleanDate = formatDate(rescheduleDate);
    const cleanTime = formatTime(rescheduleTime);

    if (!/^(\d{2})\/(\d{2})\/(\d{4})$/.test(cleanDate)) {
      Alert.alert('Validação', 'Informe uma data válida.');
      return;
    }
    if (!/^(\d{2}):(\d{2})$/.test(cleanTime)) {
      Alert.alert('Validação', 'Informe um horário válido.');
      return;
    }

    const candidateAt = parseBRDateTimeToTimestamp(cleanDate, cleanTime);
    if (candidateAt <= Date.now()) {
      Alert.alert('Validação', 'A nova data/hora precisa ser futura.');
      return;
    }

    const marked = items.filter((a) => a.status === 'Marcado');
    if (hasSchedulingConflict(candidateAt, marked, rescheduleItem.id)) {
      Alert.alert('Conflito de horário', 'Existe outro agendamento dentro da janela de 1 hora.');
      return;
    }

    await updateDoc(doc(db, COLLECTIONS.agendamentos, rescheduleItem.id), {
      dataAgendada: cleanDate,
      horaAgendada: cleanTime,
      scheduledAt: candidateAt,
      status: 'Marcado',
      updatedAt: Date.now(),
      rescheduledAt: Date.now(),
    });

    setRescheduleItem(null);
    await load();
  };

  const renderCalendar = () => {
    const first = new Date(calendarYear, calendarMonth, 1);
    const startWeekDay = (first.getDay() + 6) % 7; // segunda = 0
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cells: Array<number | null> = [];

    for (let i = 0; i < startWeekDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    return (
      <View style={styles.calendar}>
        <View style={styles.calendarHeader}>
          <TouchableOpacity onPress={() => moveMonth(-1)} style={styles.navBtn}><Text style={styles.navText}>{'<'}</Text></TouchableOpacity>
          <TouchableOpacity onPress={() => setYearOpen(true)} style={styles.yearBtn}>
            <Text style={styles.yearText}>{new Date(calendarYear, calendarMonth).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => moveMonth(1)} style={styles.navBtn}><Text style={styles.navText}>{'>'}</Text></TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map((w) => (
            <Text key={w} style={styles.weekText}>{w}</Text>
          ))}
        </View>

        <View style={styles.daysGrid}>
          {cells.map((day, idx) => {
            if (!day) return <View key={`empty-${idx}`} style={styles.dayCell} />;
            const selected = dayKey(selectedDate) === dayKey(new Date(calendarYear, calendarMonth, day));
            const marked = markedDays.has(day);

            return (
              <TouchableOpacity
                key={day}
                style={[styles.dayCell, selected && styles.dayCellSelected]}
                onPress={() => setSelectedDate(new Date(calendarYear, calendarMonth, day))}
              >
                <Text style={[styles.dayText, selected && styles.dayTextSelected]}>{day}</Text>
                {marked ? <View style={styles.dot} /> : <View style={styles.dotSpacer} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <StatusBar style="dark" />

      {pendingItems.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Atendimentos pendentes: </Text>
          {pendingItems.map((item) => (
            <View key={item.id} style={styles.pendingRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.clienteNome}</Text>
                <Text style={styles.itemMeta}>{formatDateTimeBR(item.scheduledAt)}</Text>
              </View>

              <View style={styles.quickActions}>
                <TouchableOpacity style={[styles.squareBtn, { backgroundColor: COLORS.successLight }]} onPress={() => finalizeScheduling(item.id, 'Concluído')}>
                  <Text style={styles.squareBtnText}>✔</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.squareBtn, { backgroundColor: COLORS.warning }]} onPress={() => openReschedule(item)}>
                  <Text style={styles.squareBtnText}>🕖</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.squareBtn, { backgroundColor: COLORS.errorLight }]} onPress={() => confirmCancel(item)}>
                  <Text style={styles.squareBtnText}>X</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      )}

      <View>
        <View style={styles.buttonOne}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionCenter]} onPress={() => navigation.navigate('Novo Agendamento')}>
            <Text style={styles.actionText}>Marcar Agendamento</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.buttonSecond}>
          <TouchableOpacity style={[styles.actionBtn, styles.actionSide]} onPress={() => navigation.navigate('Agendamentos Passados')}>
            <Text style={styles.actionText}>Agendamentos Passados</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.actionBtn, styles.actionSide]} onPress={() => navigation.navigate('Agendamentos Futuros')}>
            <Text style={styles.actionText}>Agendamentos Futuros</Text>
          </TouchableOpacity>
        </View>

      </View>

      {renderCalendar()}

      <View style={[styles.card, { marginBottom: 30 }]}>
        <Text style={styles.sectionTitle}>Agenda do dia selecionado: </Text>
        {selectedItems.length === 0 ? (
          <Text style={styles.empty}>Nenhum agendamento para este dia!</Text>
        ) : (
          selectedItems.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemTitle}>{item.clienteNome}</Text>
                <Text style={styles.itemMeta}>{item.horaAgendada} • {item.status}</Text>
              </View>
              <TouchableOpacity style={styles.menuBtn} onPress={() => setDetailsItem(item)}>
                <Text style={styles.menuText}>☰</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </View>

      <Modal transparent visible={!!detailsItem} animationType="fade" onRequestClose={() => setDetailsItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setDetailsItem(null)}>
          <Pressable style={styles.modal} onPress={() => { }}>
            <ScrollView>

              <Text style={styles.modalTitle}>Detalhes do agendamento:</Text>

              <Text style={styles.modalText}>Cliente:<Text
                style={styles.modalAwnser}
              >{detailsItem?.clienteNome}</Text> </Text>

              <Text style={styles.modalText}>Endereço do Cliente: <Text
                style={styles.modalAwnser}
              >{detailsItem?.clienteEndereco}</Text></Text>

              <Text style={styles.modalText}>Data: <Text
                style={styles.modalAwnser}
              >{detailsItem?.dataAgendada}</Text></Text>

              <Text style={styles.modalText}>Hora: <Text
                style={styles.modalAwnser}
              >{detailsItem?.horaAgendada}</Text></Text>

              <Text style={styles.modalText}>Status: <Text
                style={styles.modalAwnser}
              >{detailsItem?.status}</Text></Text>

              {!!detailsItem?.observacoes && <Text style={styles.modalText}>Obs.: <Text
                style={styles.modalAwnser}
              >{detailsItem.observacoes}</Text></Text>}

              <TouchableOpacity style={styles.modalBtn} onPress={() => setDetailsItem(null)}>
                <Text style={styles.modalBtnText}>FECHAR</Text>
              </TouchableOpacity>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={!!rescheduleItem} animationType="fade" onRequestClose={() => setRescheduleItem(null)}>
        <Pressable style={styles.overlay} onPress={() => setRescheduleItem(null)}>
          <Pressable style={styles.modal} onPress={() => { }}>
            <ScrollView>
              <Text style={styles.modalTitle}>Adiantar agendamento: </Text>

              <Text style={styles.modalText}>Data: </Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={COLORS.placeholder}
                value={rescheduleDate}
                onChangeText={(t) => setRescheduleDate(formatDate(t))}
                placeholder="DD/MM/AAAA"
                keyboardType="numeric"
              />

              <Text style={styles.modalText}>Horas: </Text>
              <TextInput
                style={styles.input}
                placeholderTextColor={COLORS.placeholder}
                value={rescheduleTime}
                onChangeText={(t) => setRescheduleTime(formatTime(t))}
                placeholder="HH:MM"
                keyboardType="numeric"
              />
              <View style={styles.modalActions}>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.successLight }]} onPress={saveReschedule}>
                  <Text style={styles.modalBtnText}>SALVAR</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalBtn, { backgroundColor: COLORS.errorLight }]} onPress={() => setRescheduleItem(null)}>
                  <Text style={styles.modalBtnText}>CANCELAR</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={yearOpen} animationType="fade" onRequestClose={() => setYearOpen(false)}>
        <Pressable style={styles.overlay} onPress={() => setYearOpen(false)}>
          <View style={styles.yearModal}>
            <FlatList
              data={YEARS}
              keyExtractor={(i) => String(i)}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.yearItem}
                  onPress={() => {
                    setCalendarYear(item);
                    setYearOpen(false);
                  }}
                >
                  <Text style={styles.yearItemText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
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
    gap: 12,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.light,
  },

  sectionTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 18,
    marginBottom: 10,
  },

  buttonOne: {
    width: '100%',
    marginBottom: 12,
  },

  buttonSecond: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 8,
  },

  actionBtn: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.light,
    elevation: 5,
  },

  actionSide: {
    backgroundColor: COLORS.primaryBg,
    width: '46%',
    borderBlockColor: COLORS.primaryBg,
    elevation: 5,
  },

  actionCenter: {
    backgroundColor: COLORS.primaryBg,
  },

  actionText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
    textAlign: 'center',
  },

  calendar: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.light,
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  navBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  navText: {
    color: COLORS.button,
    fontSize: 22,
    fontWeight: '700',
  },

  yearBtn: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 8,
  },

  yearText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    textTransform: 'capitalize',
  },

  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },

  weekText: {
    flex: 1,
    textAlign: 'center',
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  dayCell: {
    width: '14.2857%',
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },

  dayCellSelected: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
  },

  dayText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  dayTextSelected: {
    color: COLORS.button,
  },

  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: COLORS.primaryBg,
    marginTop: 3,
  },

  dotSpacer: {
    height: 7,
    marginTop: 3,
  },

  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
    gap: 10,
  },

  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
    gap: 10,
  },

  itemTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  itemMeta: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    marginTop: 2,
  },

  quickActions: {
    flexDirection: 'row',
    gap: 8,
  },

  squareBtn: {
    width: 38,
    height: 38,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  squareBtnText: {
    color: COLORS.button,
    fontWeight: '700',
  },

  menuBtn: {
    width: 42,
    height: 42,
    borderRadius: 10,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },

  menuText: {
    color: COLORS.button,
    fontSize: 20,
    fontWeight: '700',
  },

  empty: {
    textAlign: 'center',
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    paddingVertical: 18,
  },

  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },

  modal: {
    width: '94%',
    maxHeight: '86%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
  },

  modalTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 20,
    marginBottom: 12,
  },

  modalAwnser: {
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '500',
    fontSize: 14,
    marginBottom: 12,
  },

  modalText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 8,
    fontSize: 14,
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

  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },

  modalBtn: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 10,
  },

  modalBtnText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
  },

  yearModal: {
    width: '80%',
    maxHeight: '70%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 12,
  },

  yearItem: {
    paddingVertical: 14,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
    alignItems: 'center',
  },

  yearItemText: {
    color: COLORS.primaryBg,
    fontFamily: 'times',
    fontWeight: '700',
  },
});
