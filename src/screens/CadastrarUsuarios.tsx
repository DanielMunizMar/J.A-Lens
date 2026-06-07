import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, Pressable, Modal, FlatList,
  TouchableOpacity, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { COLORS } from '../extra/colors';
import { auth, db, secondaryAuth } from '../extra/firebase';
import {
  formatCPF, formatPhone, isValidCPF, isValidEmail, isValidPhone,
  sanitizeText, onlyDigits, formatDate, isValidDateBR
} from '../extra/utils';
import { COLLECTIONS } from '../extra/firebaseCollections';

type UserType = 'funcionario' | 'cliente';

type Props = any;

const TYPE_OPTIONS: { label: string; value: UserType }[] = [
  { label: 'Funcionário', value: 'funcionario' },
  { label: 'Cliente', value: 'cliente' },
];

export function CadastrarUsuarios({ route, navigation }: Props) {
  const editId = route?.params?.userId ?? null;

  const [tipo, setTipo] = useState<UserType>('cliente');
  const [pickerOpen, setPickerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [nomeCompleto, setNomeCompleto] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [endereco, setEndereco] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    if (!editId) return;
    (async () => {
      const snap = await getDoc(doc(db, COLLECTIONS.usuarios, editId));
      if (!snap.exists()) return;

      const data = snap.data() as any;
      setTipo(data.tipoUsuario || 'cliente');
      setNomeCompleto(data.nomeCompleto || '');
      setEmail(data.email || '');
      setCpf(data.cpf || '');
      setTelefone(data.telefone || '');
      setEndereco(data.endereco || '');
      setDataNascimento(data.dataNascimento || '');
    })();
  }, [editId]);

  const currentLabel = useMemo(
    () => TYPE_OPTIONS.find(o => o.value === tipo)?.label ?? 'Selecione',
    [tipo]
  );

  const save = async () => {
    const cleanName = sanitizeText(nomeCompleto);
    const cleanEmail = email.trim().toLowerCase();
    const cleanCpf = formatCPF(cpf);
    const cleanPhone = formatPhone(telefone);
    const cleanAddress = sanitizeText(endereco);
    const cleanBirth = dataNascimento.trim();

    if (!isValidEmail(cleanEmail)) return setFeedback('Informe um e-mail válido.');
    if (tipo === 'funcionario' && senha.trim().length < 6 && !editId) {
      return setFeedback('A senha do funcionário precisa ter ao menos 6 caracteres.');
    }

    if (tipo === 'funcionario' && senha !== confirmarSenha && !editId) {
      return setFeedback('As senhas informadas não coincidem.');
    }

    if (tipo === 'cliente') {
      if (cleanName.length < 3) return setFeedback('Informe o nome completo.');
      if (!isValidCPF(cleanCpf)) return setFeedback('CPF inválido.');
      if (!isValidPhone(cleanPhone)) return setFeedback('Telefone inválido.');
      if (cleanAddress.length < 3) return setFeedback('Informe o endereço.');
      if (!isValidDateBR(cleanBirth)) return setFeedback('Data de nascimento inválida ou futura.');
    }

    setLoading(true);
    setFeedback(null);

    try {
      const base = {
        email: cleanEmail,
        tipoUsuario: tipo,
        updatedAt: Date.now(),
      } as any;

      if (tipo === 'cliente') {
        base.nomeCompleto = cleanName;
        base.cpf = cleanCpf;
        base.telefone = cleanPhone;
        base.endereco = cleanAddress;
        base.dataNascimento = formatDate(cleanBirth);
      }

      if (editId) {
        await updateDoc(doc(db, COLLECTIONS.usuarios, editId), base);
        setFeedback('Usuário atualizado com sucesso.');
      } else if (tipo === 'funcionario') {
        const cred = await createUserWithEmailAndPassword(
          secondaryAuth,
          cleanEmail,
          senha.trim()
        );

        await addDoc(collection(db, COLLECTIONS.usuarios), {
          ...base,
          authUid: cred.user.uid,
          statusAtivo: true,
          createdAt: Date.now(),
        });
        await secondaryAuth.signOut();
        setFeedback('Funcionário cadastrado com sucesso.');
      } else {
        await addDoc(collection(db, COLLECTIONS.usuarios), {
          ...base,
          statusAtivo: true,
          createdAt: Date.now(),
        });
        setFeedback('Cliente cadastrado com sucesso.');
      }

      if (!editId) {
        setNomeCompleto('');
        setEmail('');
        setCpf('');
        setTelefone('');
        setEndereco('');
        setDataNascimento('');
        setSenha('');
        setConfirmarSenha('');
        setTipo('cliente');
      }
    } catch (e: any) {
      setFeedback('Não foi possível salvar o cadastro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <StatusBar style="dark" />

        <View style={styles.card}>
          <Text style={styles.title}>{editId ? 'Editar Usuário' : 'Adicionar Usuário'}</Text>

          <Text style={styles.label}>Tipo de usuário:</Text>
          <TouchableOpacity style={styles.select} onPress={() => setPickerOpen(true)}>
            <Text style={styles.selectText}>{currentLabel} ▼</Text>
          </TouchableOpacity>

          {tipo === 'cliente' ? (
            <>
              <Text style={styles.label}>Nome Completo:</Text>
              <TextInput
                multiline
                style={[styles.input, styles.inputMultiline]}
                placeholder="Nome completo"
                placeholderTextColor={COLORS.placeholder}
                value={nomeCompleto}
                onChangeText={setNomeCompleto}
                autoCapitalize="words"
                textAlignVertical="top"
              />
            </>
          ) : null}

          <Text style={styles.label}>Email:</Text>
          <TextInput
            multiline
            style={[styles.input, styles.inputMultiline]}
            placeholder="E-mail"
            placeholderTextColor={COLORS.placeholder}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textAlignVertical="top"
          />

          {tipo === 'cliente' ? (
            <>
              <Text style={styles.label}>CPF:</Text>
              <TextInput
                style={styles.input}
                placeholder="CPF"
                placeholderTextColor={COLORS.placeholder}
                value={cpf}
                onChangeText={(t) => setCpf(formatCPF(t))}
                keyboardType="numeric"
              />

              <Text style={styles.label}>Telefone:</Text>
              <TextInput
                style={styles.input}
                placeholder="Telefone"
                placeholderTextColor={COLORS.placeholder}
                value={telefone}
                onChangeText={(t) => setTelefone(formatPhone(t))}
                keyboardType="phone-pad"
              />

              <Text style={styles.label}>Endereço:</Text>
              <TextInput
                multiline
                style={[styles.input, styles.inputMultiline]}
                placeholder="Endereço"
                placeholderTextColor={COLORS.placeholder}
                value={endereco}
                onChangeText={setEndereco}
                textAlignVertical="top"
              />

              <Text style={styles.label}>Data de Nascimento:</Text>
              <TextInput
                style={styles.input}
                placeholder="Data de nascimento (dd/mm/aaaa)"
                placeholderTextColor={COLORS.placeholder}
                value={dataNascimento}
                onChangeText={(g) => setDataNascimento(formatDate(g))}
                keyboardType="numeric"
              />
            </>
          ) : null}

          {tipo === 'funcionario' ? (
            <>
              <Text style={styles.label}>Senha:</Text>
              <TextInput
                style={styles.input}
                placeholder="Crie sua senha"
                placeholderTextColor={COLORS.placeholder}
                value={senha}
                onChangeText={setSenha}
                secureTextEntry
              />

              <Text style={styles.label}>Confirmar Senha:</Text>
              <TextInput
                style={[
                  styles.input,
                  confirmarSenha.length > 0 &&
                  senha !== confirmarSenha && {
                    borderColor: COLORS.error,
                  }
                ]}
                placeholder="Digite novamente a senha"
                placeholderTextColor={COLORS.placeholder}
                value={confirmarSenha}
                onChangeText={setConfirmarSenha}
                secureTextEntry
              />

              {confirmarSenha.length > 0 && senha !== confirmarSenha && (
                <Text style={{ color: COLORS.error, marginBottom: 10 }}>
                  As senhas não coincidem.
                </Text>
              )}
            </>
          ) : null}

          {feedback ? <Text style={styles.feedback}>{feedback}</Text> : null}

          <Pressable
            style={styles.button}
            onPress={save}
            disabled={
              loading ||
              (tipo === 'funcionario' &&
                senha.length > 0 &&
                senha !== confirmarSenha)
            }
          >
            {loading ? <ActivityIndicator color={COLORS.button} /> : <Text style={styles.buttonText}>{editId ? 'SALVAR ALTERAÇÕES' : 'CRIAR USUÁRIO'}</Text>}
          </Pressable>

          {editId ? (
            <Pressable style={[styles.button, styles.backButton]} onPress={() => navigation.goBack()}>
              <Text style={styles.buttonText}>CANCELAR</Text>
            </Pressable>
          ) : null}
        </View>

        <Modal visible={pickerOpen} transparent animationType="fade" onRequestClose={() => setPickerOpen(false)}>
          <Pressable style={styles.modalOverlay} onPress={() => setPickerOpen(false)}>
            <View style={styles.modalCard}>
              <FlatList
                data={TYPE_OPTIONS}
                keyExtractor={(item) => item.value}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.option}
                    onPress={() => {
                      setTipo(item.value);
                      setPickerOpen(false);
                    }}
                  >
                    <Text style={styles.optionText}>{item.label}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </Pressable>
        </Modal>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flexGrow: 1, backgroundColor: COLORS.screen, padding: 16 },
  container: { alignItems: 'center' },
  card: { width: '100%', backgroundColor: COLORS.card, borderRadius: 20, padding: 16, borderWidth: 1, borderColor: COLORS.light, elevation: 4 },
  title: { fontFamily: 'times', fontWeight: '700', fontSize: 22, color: COLORS.primary, marginBottom: 12 },

  input: {
    backgroundColor: COLORS.fill,
    borderWidth: 1,
    borderColor: COLORS.focused,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
  },

  select: { backgroundColor: COLORS.primaryBg, borderRadius: 12, padding: 14, marginBottom: 12 },
  selectText: { color: COLORS.button, fontFamily: 'times', fontWeight: '700', textAlign: 'center' },

  label: {
    color: COLORS.primary,
    fontFamily: 'times',
    fontWeight: '700',
    marginBottom: 6
  },

  inputMultiline: { minHeight: 56 },
  button: { backgroundColor: COLORS.primaryBg, borderRadius: 14, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  backButton: { backgroundColor: COLORS.errorLight },
  buttonText: { color: COLORS.button, fontFamily: 'times', fontWeight: '700' },
  feedback: { color: COLORS.error, fontFamily: 'times', fontWeight: '700', marginTop: 4 },
  modalOverlay: { flex: 1, backgroundColor: COLORS.overlay, justifyContent: 'center', alignItems: 'center' },
  modalCard: { width: '78%', backgroundColor: COLORS.card, borderRadius: 14, padding: 8 },
  option: { paddingVertical: 14, borderBottomWidth: 0.5, borderBottomColor: COLORS.light },
  optionText: { textAlign: 'center', color: COLORS.primaryBg, fontFamily: 'times', fontWeight: '700' },
});
