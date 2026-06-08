import { StatusBar } from 'expo-status-bar';
import React, { useCallback, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Modal, Pressable, ScrollView, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {
    collection,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc,
} from 'firebase/firestore';

import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';

import {
    normalizeSearch,
    sanitizeSafeText,
    formatDateTimeBR,
} from '../extra/utils';

type SchedulingStatus =
    | 'Marcado'
    | 'Concluído'
    | 'Cancelado';

type SchedulingFilterField =
    | 'Nome do Cliente'
    | 'Data'
    | 'Status';

interface SchedulingDoc {
    id: string;

    clienteId: string;
    clienteNome: string;
    clienteEmail: string;
    clienteCpf: string;
    clienteEndereco: string;

    dataAgendada: string;
    horaAgendada: string;

    scheduledAt: number;

    status: SchedulingStatus;

    observacoes?: string;

    createdAt: number;
    updatedAt: number;
}

const FILTERS: SchedulingFilterField[] = [
    'Nome do Cliente',
    'Data',
    'Status',
];

export function FutureSchedulingsScreen({ navigation }: any) {
    const [items, setItems] = useState<SchedulingDoc[]>([]);

    const [filterField, setFilterField] = useState<SchedulingFilterField>('Nome do Cliente');

    const [filterText, setFilterText] = useState('');

    const [filterModalVisible, setFilterModalVisible] = useState(false);

    const [selectedItem, setSelectedItem] = useState<SchedulingDoc | null>(null);

    const loadData = useCallback(async () => {
        const snap = await getDocs(query(collection(db, COLLECTIONS.agendamentos), orderBy('scheduledAt', 'asc')));

        const loaded = snap.docs.map((d) => {
            const data = d.data() as any;
            return {
                id: d.id,
                ...data,
            } as SchedulingDoc;
        });

        setItems(loaded);
    }, []);

    useFocusEffect(useCallback(() => {
        loadData();
    }, [loadData])
    );

    const futureSchedulings = useMemo(() => {
        const now = Date.now();

        return items.filter(
            (item) =>
                item.status === 'Marcado' &&
                item.scheduledAt >= now
        );
    }, [items]);

    const filteredItems = useMemo(() => {
        const term = normalizeSearch(
            filterText
        );

        if (!term) {
            return futureSchedulings;
        }

        return futureSchedulings.filter(
            (item) => {
                switch (filterField) {
                    case 'Nome do Cliente':
                        return normalizeSearch(
                            item.clienteNome
                        ).includes(term);

                    case 'Data':
                        return normalizeSearch(
                            item.dataAgendada
                        ).includes(term);

                    case 'Status':
                        return normalizeSearch(
                            item.status
                        ).includes(term);

                    default:
                        return true;
                }
            }
        );
    }, [
        futureSchedulings,
        filterField,
        filterText,
    ]);

    const cancelScheduling = (
        item: SchedulingDoc
    ) => {
        Alert.alert(
            'Cancelar Agendamento',
            'Tem certeza que deseja cancelar?',
            [
                {
                    text: 'Não',
                    style: 'cancel',
                },
                {
                    text: 'Sim',
                    style: 'destructive',
                    onPress: async () => {
                        await updateDoc(
                            doc(
                                db,
                                COLLECTIONS.agendamentos,
                                item.id
                            ),
                            {
                                status: 'Cancelado',
                                canceledAt: Date.now(),
                                updatedAt: Date.now(),
                            }
                        );

                        setSelectedItem(null);

                        await loadData();
                    },
                },
            ]
        );
    };

    return (
        <ScrollView
            contentContainerStyle={
                styles.scrollContainer
            }
        >
            <StatusBar style="dark" />

            <View style={styles.card}>
                <Text style={styles.title}>Agendamentos Futuros: </Text>

                <TouchableOpacity
                    style={styles.filterButton}
                    onPress={() =>
                        setFilterModalVisible(true)
                    }
                >
                    <Text
                        style={styles.filterButtonText}
                    >
                        {filterField} ▼
                    </Text>
                </TouchableOpacity>

                <TextInput
                    style={styles.input}
                    placeholder="Pesquisar..."
                    value={filterText}
                    onChangeText={(text) =>
                        setFilterText(
                            sanitizeSafeText(text)
                        )
                    }
                />

                {filteredItems.length === 0 ? (
                    <Text style={styles.empty}>
                        Nenhum agendamento futuro
                        encontrado.
                    </Text>
                ) : (
                    filteredItems.map((item) => (
                        <View
                            key={item.id}
                            style={styles.row}
                        >
                            <View style={{ flex: 1 }}>
                                <Text style={styles.name}>
                                    {item.clienteNome}
                                </Text>

                                <Text style={styles.info}>
                                    {formatDateTimeBR(
                                        item.scheduledAt
                                    )}
                                </Text>
                            </View>

                            <TouchableOpacity
                                style={styles.menuButton}
                                onPress={() =>
                                    setSelectedItem(item)
                                }
                            >
                                <Text
                                    style={styles.menuText}
                                >
                                    ☰
                                </Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            {/* Modal Detalhes */}

            <Modal
                transparent
                visible={!!selectedItem}
                animationType="fade"
                onRequestClose={() =>
                    setSelectedItem(null)
                }
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() =>
                        setSelectedItem(null)
                    }
                >
                    <Pressable
                        style={styles.modal}
                        onPress={() => { }}
                    >
                        <ScrollView>
                            <Text style={styles.modalTitle}>Detalhes do Agendamento: </Text>

                            <Text style={styles.modalText}>Cliente:{' '} <Text
                                style={styles.modalAwnser}
                            >{selectedItem?.clienteNome}</Text>
                            </Text>

                            <Text style={styles.modalText}>Endereço:{' '}<Text
                                style={styles.modalAwnser}
                            >{selectedItem?.clienteEndereco}</Text>

                            </Text>

                            <Text style={styles.modalText}>
                                Data:{' '}<Text
                                    style={styles.modalAwnser}
                                >{selectedItem?.dataAgendada}</Text>

                            </Text>

                            <Text style={styles.modalText}>
                                Hora:{' '}<Text
                                    style={styles.modalAwnser}
                                >{selectedItem?.horaAgendada}</Text>

                            </Text>

                            <Text style={styles.modalText}>
                                Status:{' '}<Text
                                    style={styles.modalAwnser}
                                >{selectedItem?.status}</Text>

                            </Text>

                            {selectedItem?.observacoes ? (
                                <Text style={styles.modalText}>
                                    Observações:{' '}<Text
                                        style={styles.modalAwnser}
                                    >{selectedItem.observacoes}</Text>

                                </Text>
                            ) : null}

                            <TouchableOpacity
                                style={
                                    styles.cancelButton
                                }
                                onPress={() =>
                                    cancelScheduling(
                                        selectedItem!
                                    )
                                }
                            >
                                <Text
                                    style={
                                        styles.cancelButtonText
                                    }
                                >
                                    CANCELAR
                                    AGENDAMENTO
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.closeButton, { backgroundColor: COLORS.primaryBg, marginTop: 12 }]}
                                onPress={() => {
                                    const itemToEdit = selectedItem;
                                    setSelectedItem(null);
                                    navigation.navigate('Novo Agendamento' as never, { schedulingToEdit: itemToEdit } as never);
                                }}
                            >
                                <Text style={styles.closeButtonText}>EDITAR / ADIAR</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.closeButton}
                                onPress={() =>
                                    setSelectedItem(null)
                                }
                            >
                                <Text
                                    style={
                                        styles.closeButtonText
                                    }
                                >
                                    FECHAR
                                </Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </Pressable>
                </Pressable>
            </Modal>

            {/* Modal Filtro */}

            <Modal
                transparent
                visible={filterModalVisible}
                animationType="fade"
                onRequestClose={() =>
                    setFilterModalVisible(false)
                }
            >
                <Pressable
                    style={styles.overlay}
                    onPress={() =>
                        setFilterModalVisible(false)
                    }
                >
                    <View
                        style={styles.filterModal}
                    >
                        {FILTERS.map((item) => (
                            <TouchableOpacity
                                key={item}
                                style={
                                    styles.filterOption
                                }
                                onPress={() => {
                                    setFilterField(item);
                                    setFilterModalVisible(
                                        false
                                    );
                                }}
                            >
                                <Text
                                    style={
                                        styles.filterOptionText
                                    }
                                >
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
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
        padding: 16,
        borderWidth: 1,
        borderColor: COLORS.light,
    },

    title: {
        color: COLORS.primary,
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 12,
        fontFamily: 'times',
    },

    filterButton: {
        backgroundColor: COLORS.primaryBg,
        borderRadius: 12,
        padding: 12,
        marginBottom: 10,
    },

    filterButtonText: {
        color: COLORS.button,
        textAlign: 'center',
        fontWeight: '700',
        fontFamily: 'times',
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
    },

    name: {
        color: COLORS.primary,
        fontWeight: '700',
        fontFamily: 'times',
    },

    info: {
        color: COLORS.placeholder,
        marginTop: 3,
        fontFamily: 'times',
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
        fontSize: 20,
        fontWeight: '700',
        fontFamily: 'times',
    },

    empty: {
        textAlign: 'center',
        color: COLORS.placeholder,
        paddingVertical: 20,
        fontFamily: 'times',
    },

    overlay: {
        flex: 1,
        backgroundColor: COLORS.overlay,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },

    modal: {
        width: '92%',
        maxHeight: '85%',
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 16,
    },

    modalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: COLORS.primary,
        fontFamily: 'times',
        marginBottom: 10,
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


    cancelButton: {
        backgroundColor: COLORS.errorLight,
        borderRadius: 12,
        paddingVertical: 12,
        marginTop: 20,
        alignItems: 'center',
    },

    cancelButtonText: {
        color: COLORS.button,
        fontWeight: '700',
        fontFamily: 'times',
    },

    closeButton: {
        backgroundColor: COLORS.primaryBg,
        borderRadius: 12,
        paddingVertical: 12,
        marginTop: 10,
        alignItems: 'center',
    },

    closeButtonText: {
        color: COLORS.button,
        fontWeight: '700',
        fontFamily: 'times',
    },

    filterModal: {
        width: '80%',
        backgroundColor: COLORS.card,
        borderRadius: 18,
        padding: 10,
    },

    filterOption: {
        paddingVertical: 14,
        borderBottomWidth: 0.5,
        borderBottomColor: COLORS.light,
    },

    filterOptionText: {
        textAlign: 'center',
        color: COLORS.primaryBg,
        fontWeight: '700',
        fontFamily: 'times',
    },
});