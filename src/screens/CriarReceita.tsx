import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
    View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView,
    Modal, Pressable, FlatList, Alert, Image
} from 'react-native';
import { addDoc, collection, doc, getDoc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { nextSequentialNumber } from '../extra/firebase';
import { isValidDateBR, normalizeSearch, sanitizeFloatInput, sanitizeText } from '../extra/utils';

type Cliente = {
    id: string;
    nomeCompleto: string;
    cpf?: string;
    email?: string;
    dataNascimento?: string;
};

type ItemEstoque = {
    id: string;
    fotoUrl?: string;
    marca: string;
    tipoArmacao: string;
    formatoLente: string;
    cores: string;
};

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

const lensOptions = ['BIF. BIOVIS', 'BIF. KRIPTOX', 'BIF. ULTEX', 'PROGRESSIVAS', 'VISÃO SIMPLES', 'INCOLOR'];
const treatmentOptions = ['FOTOSENSÍVEL', 'ANTI-REFLEXO'];

const formatTreatmentLabel = (items: string[]) => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} e ${items[1]}`;
    return `${items.slice(0, -1).join(', ')} e ${items[items.length - 1]}`;
};

const calculateAge = (value?: string) => {
    if (!value || !isValidDateBR(value)) return '';
    const [day, month, year] = value.split('/').map(Number);
    const today = new Date();
    let age = today.getFullYear() - year;
    if (today.getMonth() + 1 < month || (today.getMonth() + 1 === month && today.getDate() < day)) {
        age -= 1;
    }
    return age >= 0 ? age.toString() : '';
};

const parseTreatments = (value: string) =>
    value
        .split(/,| e /)
        .map(item => item.trim())
        .filter(Boolean);

const formatStockLabel = (item: ItemEstoque) =>
    `${item.marca} • ${item.tipoArmacao} • ${item.formatoLente}`;

export function CriarReceita({ route, navigation }: any) {
    const editId = route?.params?.editId ?? null;
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [estoque, setEstoque] = useState<ItemEstoque[]>([]);
    const [clienteSearch, setClienteSearch] = useState('');
    const [clienteModalOpen, setClienteModalOpen] = useState(false);
    const [itemModalOpen, setItemModalOpen] = useState(false);
    const [selectedClienteId, setSelectedClienteId] = useState<string | null>(null);
    const [selectedItem, setSelectedItem] = useState<ItemEstoque | null>(null);
    const [imageErrorIds, setImageErrorIds] = useState<string[]>([]);
    const [idade, setIdade] = useState('');
    const [armacao, setArmacao] = useState('');
    const [odEsferico, setOdEsferico] = useState('');
    const [odCilindro, setOdCilindro] = useState('');
    const [odEixo, setOdEixo] = useState('');
    const [odDnp, setOdDnp] = useState('');
    const [oeEsferico, setOeEsferico] = useState('');
    const [oeCilindro, setOeCilindro] = useState('');
    const [oeEixo, setOeEixo] = useState('');
    const [oeDnp, setOeDnp] = useState('');
    const [adicao, setAdicao] = useState('');
    const [tipoLente, setTipoLente] = useState(lensOptions[0]);
    const [selectedTreatments, setSelectedTreatments] = useState<string[]>([]);
    const [centroOtico, setCentroOtico] = useState('');
    const [observacoes, setObservacoes] = useState('');
    const [loading, setLoading] = useState(false);

    const selectedCliente = clientes.find(c => c.id === selectedClienteId) || null;

    useEffect(() => {
        if (!selectedCliente) {
            setIdade('');
            return;
        }
        setIdade(calculateAge(selectedCliente.dataNascimento));
    }, [selectedCliente]);

    useEffect(() => {
        (async () => {
            const [cSnap, sSnap] = await Promise.all([
                getDocs(query(collection(db, COLLECTIONS.usuarios), orderBy('nomeCompleto', 'asc'))),
                getDocs(query(collection(db, COLLECTIONS.estoque), orderBy('marca', 'asc'))),
            ]);

            setClientes(
                cSnap.docs
                    .map(d => ({ id: d.id, ...(d.data() as any) } as Cliente))
                    .filter(u => !(u as any).authUid)
            );
            setEstoque(sSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as ItemEstoque)));
        })();
    }, []);

    useEffect(() => {
        if (!editId) return;
        (async () => {
            const snap = await getDoc(doc(db, COLLECTIONS.receitas, editId));
            if (!snap.exists()) return;
            const data = snap.data() as any;
            setSelectedClienteId(data.clienteId || null);
            setIdade(data.idade || '');
            setArmacao(data.armacao || '');
            setOdEsferico(data.odEsferico || '');
            setOdCilindro(data.odCilindro || '');
            setOdEixo(data.odEixo || '');
            setOdDnp(data.odDnp || '');
            setOeEsferico(data.oeEsferico || '');
            setOeCilindro(data.oeCilindro || '');
            setOeEixo(data.oeEixo || '');
            setOeDnp(data.oeDnp || '');
            setAdicao(data.adicao || '');
            setTipoLente(data.tipoLente || lensOptions[0]);
            setSelectedTreatments(parseTreatments(data.tratamento || ''));
            setCentroOtico(data.centroOtico || '');
            setObservacoes(data.observacoes || '');
        })();
    }, [editId]);

    const clientesFiltrados = useMemo(() => {
        const term = normalizeSearch(clienteSearch);
        if (!term) return clientes;
        return clientes.filter((c) => normalizeSearch(c.nomeCompleto).includes(term) || normalizeSearch(c.cpf || '').includes(term));
    }, [clientes, clienteSearch]);

    const selectItem = (item: ItemEstoque) => {
        setSelectedItem(item);
        setArmacao(formatStockLabel(item));
        setItemModalOpen(false);
    };

    const handleImageError = (id: string) => {
        setImageErrorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    const toggleTreatment = (treatment: string) => {
        setSelectedTreatments((prev) =>
            prev.includes(treatment) ? prev.filter((value) => value !== treatment) : [...prev, treatment]
        );
    };

    const salvar = async () => {
        if (!selectedCliente) return Alert.alert('Validação', 'Selecione o cliente.');
        if (!selectedItem && !armacao.trim()) return Alert.alert('Validação', 'Selecione ou informe uma armação do estoque.');
        if (!odEsferico.trim()) return Alert.alert('Validação', 'Informe OD Esférico.');
        if (!oeEsferico.trim()) return Alert.alert('Validação', 'Informe OE Esférico.');
        if (!centroOtico.trim()) return Alert.alert('Validação', 'Informe o centro ótico.');

        setLoading(true);

        try {
            const payload: Receita = {
                numero: 0,
                data: new Date().toISOString().slice(0, 10),
                cliente: selectedCliente.nomeCompleto,
                idade: idade || calculateAge(selectedCliente.dataNascimento),
                armacao: armacao || (selectedItem ? formatStockLabel(selectedItem) : ''),
                odEsferico: sanitizeFloatInput(odEsferico),
                odCilindro: sanitizeFloatInput(odCilindro),
                odEixo: sanitizeFloatInput(odEixo),
                odDnp: sanitizeFloatInput(odDnp),
                oeEsferico: sanitizeFloatInput(oeEsferico),
                oeCilindro: sanitizeFloatInput(oeCilindro),
                oeEixo: sanitizeFloatInput(oeEixo),
                oeDnp: sanitizeFloatInput(oeDnp),
                adicao: sanitizeText(adicao),
                tipoLente,
                tratamento: formatTreatmentLabel(selectedTreatments),
                centroOtico: sanitizeFloatInput(centroOtico),
                observacoes: sanitizeText(observacoes),
                clienteId: selectedCliente.id,
                createdAt: Date.now(),
            };

            if (editId) {
                const currentSnap = await getDoc(doc(db, COLLECTIONS.receitas, editId));
                const currentData = currentSnap.exists() ? (currentSnap.data() as any) : {};
                await updateDoc(doc(db, COLLECTIONS.receitas, editId), {
                    ...payload,
                    numero: currentData.numero || payload.numero,
                    createdAt: currentData.createdAt || payload.createdAt,
                });
                Alert.alert('Sucesso', 'Receita atualizada com sucesso.');
            } else {
                const numero = await nextSequentialNumber('receitas');
                await addDoc(collection(db, COLLECTIONS.receitas), { ...payload, numero });
                Alert.alert('Sucesso', `Receita Nº ${numero} salva com sucesso.`);
            }

            navigation.goBack();
        } catch (error: any) {
            Alert.alert('Erro', 'Não foi possível salvar a receita.');
        } finally {
            setLoading(false);
        }
    };

    function formatDriveUrl(url?: string): string {
        if (!url) return '';

        const match = url.match(/\/d\/([^/]+)/);

        if (match?.[1]) {
            return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1000`;
        }

        return url;
    }

    return (
        <ScrollView contentContainerStyle={styles.scrollContainer}>
            <View style={styles.card}>
                <StatusBar style="dark" />

                <Text style={styles.title}>{editId ? 'Editar Receita' : 'Criar Nova Receita'}</Text>

                <Text style={styles.label}>Buscar Cliente: </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Nome ou CPF"
                    placeholderTextColor={COLORS.placeholder}
                    value={clienteSearch}
                    onChangeText={setClienteSearch}
                />

                <Text style={styles.label}>Selecionar Cliente: </Text>
                <TouchableOpacity style={styles.select} onPress={() => setClienteModalOpen(true)}>
                    <Text style={styles.selectText}>{selectedCliente ? selectedCliente.nomeCompleto : 'Escolha um cliente'}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Idade: </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Idade"
                    placeholderTextColor={COLORS.placeholder}
                    value={idade}
                    editable={false}
                />

                <Text style={styles.label}>Armação: </Text>
                <TouchableOpacity style={styles.select} onPress={() => setItemModalOpen(true)}>
                    <Text style={styles.selectText}>{selectedItem ? formatStockLabel(selectedItem) : 'Escolha uma armação'}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>OD: </Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Esférico"
                        placeholderTextColor={COLORS.placeholder}
                        value={odEsferico}
                        onChangeText={(t) => setOdEsferico(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Cilindro"
                        placeholderTextColor={COLORS.placeholder}
                        value={odCilindro}
                        onChangeText={(t) => setOdCilindro(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Eixo"
                        placeholderTextColor={COLORS.placeholder}
                        value={odEixo}
                        onChangeText={(t) => setOdEixo(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="DNP"
                        placeholderTextColor={COLORS.placeholder}
                        value={odDnp}
                        onChangeText={(t) => setOdDnp(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                <Text style={styles.label}>OE: </Text>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Esférico"
                        placeholderTextColor={COLORS.placeholder}
                        value={oeEsferico}
                        onChangeText={(t) => setOeEsferico(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Cilindro"
                        placeholderTextColor={COLORS.placeholder}
                        value={oeCilindro}
                        onChangeText={(t) => setOeCilindro(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>
                <View style={styles.row}>
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="Eixo"
                        placeholderTextColor={COLORS.placeholder}
                        value={oeEixo}
                        onChangeText={(t) => setOeEixo(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                    <TextInput
                        style={[styles.input, styles.smallInput]}
                        placeholder="DNP"
                        placeholderTextColor={COLORS.placeholder}
                        value={oeDnp}
                        onChangeText={(t) => setOeDnp(sanitizeFloatInput(t))}
                        keyboardType="numbers-and-punctuation"
                    />
                </View>

                <Text style={styles.label}>Lente: </Text>
                <TouchableOpacity
                    style={styles.select}
                    onPress={() => setTipoLente(lensOptions[(lensOptions.indexOf(tipoLente) + 1) % lensOptions.length])}
                >
                    <Text style={styles.selectText}>{tipoLente}</Text>
                </TouchableOpacity>

                <Text style={styles.label}>Tratamentos: </Text>
                <View style={styles.treatmentContainer}>
                    {treatmentOptions.map((option) => {
                        const selectedTreatment = selectedTreatments.includes(option);
                        return (
                            <TouchableOpacity
                                key={option}
                                style={[styles.checkbox, selectedTreatment && styles.checkboxSelected]}
                                onPress={() => toggleTreatment(option)}
                            >
                                <Text
                                    style={[
                                        styles.checkboxText,
                                        selectedTreatment && styles.checkboxTextSelected,
                                    ]}
                                >
                                    {option}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <Text style={styles.label}>Centro Ótico: </Text>
                <TextInput
                    style={styles.input}
                    placeholder="Centro ótico"
                    placeholderTextColor={COLORS.placeholder}
                    value={centroOtico}
                    onChangeText={(t) => setCentroOtico(sanitizeFloatInput(t))}
                    keyboardType="numbers-and-punctuation"
                />

                <Text style={styles.label}>Observações: </Text>
                <TextInput
                    style={[styles.input, styles.inputMultiline]}
                    multiline
                    placeholder="Observações"
                    placeholderTextColor={COLORS.placeholder}
                    value={observacoes}
                    onChangeText={setObservacoes}
                    textAlignVertical="top"
                />

                <TouchableOpacity style={styles.button} onPress={salvar} disabled={loading}>
                    <Text style={styles.buttonText}>{editId ? 'Atualizar Receita' : 'Salvar Receita'}</Text>
                </TouchableOpacity>
            </View>

            <Modal visible={clienteModalOpen} transparent animationType="fade" onRequestClose={() => setClienteModalOpen(false)}>
                <Pressable style={styles.overlay} onPress={() => setClienteModalOpen(false)}>
                    <View style={styles.modal}>
                        <FlatList
                            data={clientesFiltrados}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={styles.option}
                                    onPress={() => {
                                        setSelectedClienteId(item.id);
                                        setClienteModalOpen(false);
                                    }}
                                >
                                    <Text style={styles.optionText}>{item.nomeCompleto}</Text>
                                    <Text style={styles.optionSubText}>{item.cpf || ''}</Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </Pressable>
            </Modal>

            <Modal visible={itemModalOpen} transparent animationType="fade" onRequestClose={() => setItemModalOpen(false)}>
                <Pressable style={styles.overlay} onPress={() => setItemModalOpen(false)}>
                    <View style={styles.modalLarge}>
                        <FlatList
                            data={estoque}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.stockItem} onPress={() => selectItem(item)}>
                                    {item.fotoUrl && !imageErrorIds.includes(item.id) ? (
                                        <Image
                                            style={styles.stockImage}
                                            source={{ uri: formatDriveUrl(item.fotoUrl) }}
                                            resizeMode="cover"
                                            onError={(e) => {
                                                console.log('Erro imagem:', item.fotoUrl);
                                                console.log(e.nativeEvent);
                                                handleImageError(item.id);
                                            }}
                                        />
                                    ) : (
                                        <View style={styles.placeholderBox}>
                                            <Text style={styles.placeholderText}>Sem imagem</Text>
                                        </View>
                                    )}
                                    <View style={styles.stockTextBlock}>
                                        <Text style={styles.stockTitle}>{item.marca}</Text>
                                        <Text style={styles.stockMeta}>{item.tipoArmacao}</Text>
                                        <Text style={styles.stockMeta}>{item.formatoLente}</Text>
                                    </View>
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
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.screen,
    padding: 16,
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.light,
    marginBottom: 40,
  },

  title: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    fontSize: 22,
    marginBottom: 14,
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

  inputMultiline: {
    minHeight: 70,
  },

  select: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },

  selectText: {
    color: COLORS.button,
    textAlign: 'center',
    fontFamily: 'times',
    fontWeight: '700',
  },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
  },

  smallInput: {
    minWidth: '48%',
    marginBottom: 10,
  },

  treatmentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  checkboxTextSelected: {
    color: COLORS.button,
  },

  checkbox: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.focused,
    backgroundColor: COLORS.fill,
  },

  checkboxSelected: {
    backgroundColor: COLORS.primaryBg,
    borderColor: COLORS.primaryBg,
    color: COLORS.button,
  },

  checkboxText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    textAlign: 'center',
  },

  button: {
    backgroundColor: COLORS.successLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
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
    width: '88%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 18,
    padding: 16,
  },

  modalLarge: {
    width: '94%',
    maxHeight: '80%',
    backgroundColor: COLORS.card,
    borderRadius: 18, padding: 16,
  },

  option: {
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  optionText: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  optionSubText: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    marginTop: 4,
  },

  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.light,
  },

  stockImage: {
    width: 80,
    height: 56,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.light,
  },

  placeholderBox: {
    width: 80,
    height: 56,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: COLORS.light,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
  },

  stockTextBlock: {
    flex: 1,
  },

  stockTitle: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  stockMeta: {
    color: COLORS.placeholder,
    fontFamily: 'times',
    fontWeight: '700',
    marginTop: 2,
  },
});
