import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable, FlatList, TextInput, ScrollView, Alert, Image } from 'react-native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { db } from '../extra/firebase';
import { normalizeSearch } from '../extra/utils';

type Armacao = {
  id: string;
  fotoUrl?: string;
  marca: string;
  tipoArmacao: string;
  formatoLente: string;
  genero: string;
  infantil: boolean;
  quantidadeEstoque: number;
  cores: string;
};

export function ControleEstoque({ navigation }: any) {
  const [items, setItems] = useState<Armacao[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const [info, setInfo] = useState<Armacao | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Armacao | null>(null);
  const [imageErrorIds, setImageErrorIds] = useState<string[]>([]);

  const [filterField, setFilterField] = useState<'Gênero' | 'Tipo de Armação' | 'Marca' | 'Infantil' | 'Formato'>('Marca');
  const [filterValue, setFilterValue] = useState('');

  const load = useCallback(async () => {
    try {
      const snap = await getDocs(
        query(
          collection(
            db,
            COLLECTIONS.estoque
          ),
          orderBy(
            'updatedAt',
            'desc'
          )
        )
      );

      setItems(
        snap.docs.map(
          d =>
          ({
            id: d.id,
            ...(d.data() as any)
          } as Armacao)
        )
      );
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Falha ao carregar estoque.'
      );
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const filtered = useMemo(() => {
    const term = normalizeSearch(filterValue);
    if (!term) return items;
    return items.filter((i) => {
      const map = {
        'Gênero': normalizeSearch(i.genero),
        'Tipo de Armação': normalizeSearch(i.tipoArmacao),
        'Marca': normalizeSearch(i.marca),
        'Infantil': i.infantil ? 'sim' : 'não',
        'Formato': normalizeSearch(i.formatoLente),
      } as const;
      return map[filterField].includes(term);
    });
  }, [items, filterField, filterValue]);

  const handleImageError = (id: string) => {
    setImageErrorIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const adjustQty = async (delta: number) => {
    if (!info) return;
    const next = Math.max(0, (info.quantidadeEstoque || 0) + delta);
    await updateDoc(doc(db, COLLECTIONS.estoque, info.id), { quantidadeEstoque: next, updatedAt: Date.now() });
    setInfo({ ...info, quantidadeEstoque: next });
    await load();
  };

  const remove = async () => {
    if (!deleteTarget) return;
    await deleteDoc(doc(db, COLLECTIONS.estoque, deleteTarget.id));
    setDeleteTarget(null);
    setInfo(null);
    await load();
  };

  function formatDriveUrl(url?: string): string {
    if (!url) return '';

    const match = url.match(/\/d\/([^/]+)/);

    if (match?.[1]) {
      const fileId = match[1];
      return `https://drive.google.com/uc?export=view&id=${fileId}`;
    }

    return url;
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);



  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.topCard}>
          <View style={styles.row}>
            <TouchableOpacity style={styles.actionBtn} onPress={() => setFilterOpen(true)}>
              <Text style={styles.actionText}>FILTRO</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Cadastrar Armação')}>
              <Text style={styles.actionText}>CADASTRAR ARMAÇÃO</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="Pesquisar..."
            placeholderTextColor={COLORS.placeholder}
            value={filterValue}
            onChangeText={setFilterValue}
          />
        </View>

        <View style={styles.listCard}>
          <Text style={styles.title}>Armações: </Text>
          {filtered.map((item) => (
            <View key={item.id} style={styles.itemCard}>
              {item.fotoUrl && !imageErrorIds.includes(item.id) ? (
                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() => setSelectedImage(formatDriveUrl(item.fotoUrl))}
                >
                  <Image
                    style={styles.itemImage}
                    source={{ uri: formatDriveUrl(item.fotoUrl) }}
                    resizeMode="cover"
                    onError={() => handleImageError(item.id)}
                  />
                </TouchableOpacity>
              ) : (
                <View style={styles.placeholderBox}>
                  <Text style={styles.placeholderText}>Sem imagem</Text>
                </View>
              )}
              <Text style={styles.itemTitle}>{item.marca}</Text>
              <Text style={styles.itemMeta}>Formato: {item.formatoLente}</Text>
              <Text style={styles.itemMeta}>Gênero: {item.genero}</Text>
              <Text style={styles.itemMeta}>Qtd: {item.quantidadeEstoque}</Text>

              <TouchableOpacity style={styles.infoBtn} onPress={() => setInfo(item)}>
                <Text style={styles.infoText}>INFORMAÇÕES</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </View>

      <Modal visible={!!info} transparent animationType="fade" onRequestClose={() => setInfo(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setInfo(null)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>

            {/* ScrollView adicionado para permitir a rolagem das informações */}
            <ScrollView
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 10 }}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator
            >
              <Text style={styles.modalTitle}>Detalhes da armação: </Text>
              <Text style={styles.modalText}>Marca: <Text style={styles.modalAwnser}>{info?.marca}</Text></Text>
              <Text style={styles.modalText}>Tipo: <Text style={styles.modalAwnser}>{info?.tipoArmacao}</Text></Text>
              <Text style={styles.modalText}>Formato: <Text style={styles.modalAwnser}>{info?.formatoLente}</Text></Text>
              <Text style={styles.modalText}>Gênero: <Text style={styles.modalAwnser}>{info?.genero}</Text></Text>
              <Text style={styles.modalText}>Infantil: <Text style={styles.modalAwnser}>{info?.infantil ? 'Sim' : 'Não'}</Text></Text>
              <Text style={styles.modalText}>Qtd. estoque: <Text style={styles.modalAwnser}>{info?.quantidadeEstoque}</Text></Text>
              <Text style={styles.modalText}>Cores: <Text style={styles.modalAwnser}>{info?.cores}</Text></Text>
              <Text style={styles.modalText}>Foto: <Text style={styles.modalAwnser}>{info?.fotoUrl || '-'}</Text></Text>

              <View style={styles.qtyRow}>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQty(-1)}><Text style={styles.qtyText}>-</Text></TouchableOpacity>
                <TouchableOpacity style={styles.qtyBtn} onPress={() => adjustQty(1)}><Text style={styles.qtyText}>+</Text></TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.infoBtn, { marginTop: 10, backgroundColor: COLORS.successLight }]}
                onPress={() => {
                  if (info?.id) {
                    const id = info.id;
                    setInfo(null);
                    navigation.navigate('Cadastrar Armação', { editId: id });
                  }
                }}
              >
                <Text style={[styles.infoText, { color: COLORS.fill }]}>EDITAR ARMAÇÃO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.infoBtn, { marginTop: 10, backgroundColor: COLORS.errorLight }]} onPress={() => setDeleteTarget(info)}>
                <Text style={[styles.infoText, { color: COLORS.fill }]}>REMOVER ARMAÇÃO</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.infoBtn, { marginTop: 10, backgroundColor: COLORS.errorLight }]} onPress={() => setInfo(null)}>
                <Text style={[styles.infoText, { color: COLORS.fill }]}>FECHAR</Text>
              </TouchableOpacity>
            </ScrollView>

          </Pressable>
        </Pressable>
      </Modal>


      <Modal visible={!!deleteTarget} transparent animationType="fade" onRequestClose={() => setDeleteTarget(null)}>
        <Pressable style={styles.modalOverlay} onPress={() => setDeleteTarget(null)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            <Text style={styles.modalTitle}>Confirmar exclusão</Text>
            <Text style={styles.modalText}>Esta ação remove a armação do estoque.</Text>
            <TouchableOpacity style={[styles.infoBtn, { backgroundColor: COLORS.errorLight }]} onPress={remove}>
              <Text style={styles.infoText}>CONFIRMAR</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal visible={filterOpen} transparent animationType="fade" onRequestClose={() => setFilterOpen(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setFilterOpen(false)}>
          <Pressable style={styles.modalCard} onPress={() => { }}>
            {(['Gênero', 'Tipo de Armação', 'Marca', 'Infantil', 'Formato'] as const).map((opt) => (
              <TouchableOpacity key={opt} style={styles.option} onPress={() => { setFilterField(opt); setFilterOpen(false); }}>
                <Text style={styles.optionText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={!!selectedImage}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <Pressable
          style={styles.imageModalOverlay}
          onPress={() => setSelectedImage(null)}
        >
          <Pressable style={styles.imageCard}>
            <Image
              source={{ uri: selectedImage || '' }}
              style={styles.fullscreenImage}
              resizeMode="contain"
            />
          </Pressable>
        </Pressable>
      </Modal>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },
  container: { alignItems: 'center' },
  topCard: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.light, marginBottom: 14 },

  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },

  actionBtn: {
    width: '48%',
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },

  actionText: {
    color: COLORS.button,
    fontFamily: 'times',
    fontWeight: '700',
    textAlign: 'center',
  },

  input: {
    marginTop: 10,
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 12,
    padding: 12,
    fontFamily: 'times',
    fontWeight: '700',
    color: COLORS.primary,
  },

  title: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700', fontSize: 20, marginBottom: 10 },
  listCard: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, padding: 14, borderWidth: 1, borderColor: COLORS.light, marginBottom: 20 },
  itemCard: { backgroundColor: COLORS.primaryBg, borderRadius: 16, padding: 12, marginBottom: 10 },

  itemImage: {
    width: '100%',
    aspectRatio: 1.5,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: COLORS.light
  },

  placeholderBox: { width: '100%', aspectRatio: 1.5, borderRadius: 12, marginBottom: 10, backgroundColor: COLORS.light, justifyContent: 'center', alignItems: 'center' },
  placeholderText: { color: COLORS.placeholder, fontFamily: 'times', fontWeight: '700' },
  itemTitle: { color: COLORS.button, fontFamily: 'times', fontWeight: '700', fontSize: 18 },
  itemMeta: { color: COLORS.button, fontFamily: 'times', fontWeight: '700' },
  infoBtn: { marginTop: 8, backgroundColor: COLORS.fill, borderRadius: 12, padding: 12, alignItems: 'center' },
  infoText: { color: COLORS.primary, fontFamily: 'times', fontWeight: '700' },

  modalOverlay: {
    height: '100%',
    backgroundColor: COLORS.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 18
  },

  modalCard: { 
  width: '92%', 
  height: '80%', 
  backgroundColor: COLORS.card, 
  borderRadius: 18, 
  padding: 16 
},

  modalTitle: { fontFamily: 'times', fontWeight: '700', fontSize: 20, color: COLORS.primary, marginBottom: 8 },

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

  qtyRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  qtyBtn: { flex: 1, backgroundColor: COLORS.primaryBg, borderRadius: 10, padding: 12, alignItems: 'center', marginHorizontal: 6 },
  qtyText: { color: COLORS.button, fontSize: 20, fontFamily: 'times', fontWeight: '700' },
  option: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.light },
  optionText: { textAlign: 'center', color: COLORS.primaryBg, fontFamily: 'times', fontWeight: '700' },

  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageCard: {
    width: '90%',
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },

  fullscreenImage: {
    width: '100%',
    height: 400, // ajuste conforme desejar
    borderRadius: 12,
  },
});
