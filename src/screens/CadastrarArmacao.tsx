import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  updateDoc
} from 'firebase/firestore';

import { COLORS } from '../extra/colors';
import { db } from '../extra/firebase';
import { COLLECTIONS } from '../extra/firebaseCollections';
import { sanitizeText } from '../extra/utils';

type Props = {
  navigation: any;
  route: {
    params?: {
      editId?: string;
    };
  };
};

type SelectProps = {
  label: string;
  value: string;
  onPress: () => void;
};

function Select({
  label,
  value,
  onPress
}: SelectProps) {
  return (
    <TouchableOpacity
      style={styles.select}
      onPress={onPress}
    >
      <Text style={styles.selectText}>
        {label}: {value}
      </Text>
    </TouchableOpacity>
  );
}

export function CadastrarArmacao({
  navigation,
  route
}: Props) {
  const editId = route?.params?.editId;
  const isEditing = !!editId;

  const [fotoUrl, setFotoUrl] = useState('');
  const [marca, setMarca] = useState('');
  const [tipoArmacao, setTipoArmacao] =
    useState('Acetato');
  const [formatoLente, setFormatoLente] =
    useState('Quadrado');
  const [genero, setGenero] =
    useState('Masculino');
  const [infantil, setInfantil] =
    useState('Não');
  const [quantidadeEstoque, setQuantidadeEstoque] =
    useState('1');
  const [cores, setCores] = useState('');
  const [descricao, setDescricao] =
    useState('');

  const tipoOptions = [
    'Acetato',
    'Parafusada',
    'Metal',
    'Nylon'
  ];

  const formatoOptions = [
    'Quadrado',
    'Redondo',
    'Aviador',
    'Retangular',
    'Ovalado',
    'Gatinho'
  ];

  useEffect(() => {
    if (!editId) return;

    const loadArmacao = async () => {
      try {
        const snap = await getDoc(
          doc(
            db,
            COLLECTIONS.estoque,
            editId
          )
        );

        if (!snap.exists()) {
          Alert.alert(
            'Erro',
            'Armação não encontrada.'
          );
          navigation.goBack();
          return;
        }

        const data = snap.data();

        setFotoUrl(data.fotoUrl ?? '');
        setMarca(data.marca ?? '');
        setTipoArmacao(
          data.tipoArmacao ?? 'Acetato'
        );
        setFormatoLente(
          data.formatoLente ?? 'Quadrado'
        );
        setGenero(
          data.genero ?? 'Masculino'
        );
        setInfantil(
          data.infantil ? 'Sim' : 'Não'
        );
        setQuantidadeEstoque(
          String(
            data.quantidadeEstoque ?? 0
          )
        );
        setCores(data.cores ?? '');
        setDescricao(
          data.descricao ?? ''
        );
      } catch (error) {
        console.error(error);

        Alert.alert(
          'Erro',
          'Falha ao carregar a armação.'
        );
      }
    };

    loadArmacao();
  }, [editId, navigation]);

  const salvar = async () => {
    try {
      const cleanMarca = sanitizeText(
        marca || ''
      );

      if (cleanMarca.length < 2) {
        Alert.alert(
          'Validação',
          'Informe a marca.'
        );
        return;
      }

      const qtd = Number.parseInt(
        quantidadeEstoque,
        10
      );

      const quantidadeFinal =
        Number.isNaN(qtd) || qtd < 0
          ? 0
          : qtd;

      const payload = {
        fotoUrl: fotoUrl.trim(),
        marca: cleanMarca,
        tipoArmacao,
        formatoLente,
        genero,
        infantil: infantil === 'Sim',
        quantidadeEstoque:
          quantidadeFinal,
        cores: sanitizeText(
          cores || ''
        ),
        descricao: sanitizeText(
          descricao || ''
        ),
        updatedAt: Date.now()
      };

      if (isEditing && editId) {
        await updateDoc(
          doc(
            db,
            COLLECTIONS.estoque,
            editId
          ),
          payload
        );

        Alert.alert(
          'Sucesso',
          'Armação atualizada.'
        );
      } else {
        await addDoc(
          collection(
            db,
            COLLECTIONS.estoque
          ),
          {
            ...payload,
            createdAt: Date.now()
          }
        );

        Alert.alert(
          'Sucesso',
          'Armação cadastrada.'
        );
      }

      navigation.goBack();
    } catch (error) {
      console.error(error);

      Alert.alert(
        'Erro',
        'Não foi possível salvar a armação.'
      );
    }
  };

  return (
    <ScrollView
      contentContainerStyle={
        styles.scrollContainer
      }
    >
      <View style={styles.card}>
        <StatusBar style="dark" />

        <Text style={styles.title}>
          {isEditing
            ? 'Editar Armação: '
            : 'Cadastrar Armação: '}
        </Text>

        <Text style={styles.label}>
          Foto URL:
        </Text>

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Foto URL"
          placeholderTextColor={COLORS.placeholder}
          value={fotoUrl}
          onChangeText={setFotoUrl}
          keyboardType="url"
          autoCapitalize="none"
          autoCorrect={false}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Marca: </Text>

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Marca"
          placeholderTextColor={COLORS.placeholder}
          value={marca}
          onChangeText={setMarca}
          multiline
          numberOfLines={4}
        />

        <Select
          label="Tipo"
          value={tipoArmacao}
          onPress={() => setTipoArmacao(tipoOptions[(tipoOptions.indexOf(tipoArmacao) + 1) % tipoOptions.length])}
        />

        <Select
          label="Formato"
          value={formatoLente}
          onPress={() =>
            setFormatoLente(
              formatoOptions[
              (
                formatoOptions.indexOf(
                  formatoLente
                ) + 1
              ) %
              formatoOptions.length
              ]
            )
          }
        />

        <Select
          label="Gênero"
          value={genero}
          onPress={() =>
            setGenero(
              genero === 'Masculino'
                ? 'Feminino'
                : 'Masculino'
            )
          }
        />

        <Select
          label="Infantil"
          value={infantil}
          onPress={() =>
            setInfantil(
              infantil === 'Não'
                ? 'Sim'
                : 'Não'
            )
          }
        />

        <Text style={styles.label}>
          Quantidade em estoque:
        </Text>

        <View style={styles.stepperRow}>
          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() =>
              setQuantidadeEstoque(
                prev =>
                  String(
                    Math.max(
                      0,
                      Number(prev) - 1
                    )
                  )
              )
            }
          >
            <Text
              style={styles.stepperText}
            >
              -
            </Text>
          </TouchableOpacity>

          <Text
            style={styles.quantityText}
          >
            {quantidadeEstoque}
          </Text>

          <TouchableOpacity
            style={styles.stepperButton}
            onPress={() =>
              setQuantidadeEstoque(
                prev =>
                  String(
                    Number(prev) + 1
                  )
              )
            }
          >
            <Text
              style={styles.stepperText}
            >
              +
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>
          Cores:
        </Text>

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Cores"
          placeholderTextColor={COLORS.placeholder}
          value={cores}
          onChangeText={setCores}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>
          Descrição:
        </Text>

        <TextInput
          style={[styles.input, styles.inputMultiline]}
          placeholder="Descrição"
          placeholderTextColor={COLORS.placeholder}
          value={descricao}
          onChangeText={setDescricao}
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity
          style={styles.button}
          onPress={salvar}
        >
          <Text
            style={styles.buttonText}
          >
            {isEditing
              ? 'ATUALIZAR ARMAÇÃO'
              : 'SALVAR ARMAÇÃO'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: COLORS.screen,
    padding: 16
  },

  card: {
    backgroundColor: COLORS.card,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.light,
    marginTop: 10,
    marginBottom: 30
  },

  title: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    fontFamily: 'times'
  },

  input: {
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    fontFamily: 'times',
    color: COLORS.primary,
    fontWeight: '700'
  },

  inputMultiline: {
    minHeight: 50
  },

  label: {
    color: COLORS.primary,
    fontWeight: '700',
    marginBottom: 6,
    fontFamily: 'times'
  },

  select: {
    backgroundColor: COLORS.primaryBg,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10
  },

  selectText: {
    color: COLORS.button,
    fontWeight: '700',
    fontFamily: 'times'
  },

  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent:
      'space-between',
    marginBottom: 10
  },

  stepperButton: {
    width: 52,
    height: 52,
    borderRadius: 12,
    backgroundColor: COLORS.primaryBg,
    justifyContent: 'center',
    alignItems: 'center',
    fontFamily: 'times'
  },

  stepperText: {
    color: COLORS.button,
    fontSize: 22,
    fontWeight: '700',
    fontFamily: 'times'
  },

  quantityText: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.primary,
    fontFamily: 'times'
  },

  button: {
    backgroundColor:
      COLORS.successLight,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10
  },

  buttonText: {
    color: COLORS.button,
    fontWeight: '700',
    fontFamily: 'times'
  },

  textWhite: {
    color: COLORS.button,
    fontFamily: 'times'
  }
});