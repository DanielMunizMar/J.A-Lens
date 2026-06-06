import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, doc, runTransaction } from 'firebase/firestore';
import { COLLECTIONS } from './firebaseCollections';

// use seu firebaseConfig já existente
import { firebaseConfig } from '../../firebaseConfig';

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// segunda instância para criar funcionários sem trocar a sessão do admin
const secondaryApp = getApps().some(a => a.name === 'secondary')
  ? getApps().find(a => a.name === 'secondary')!
  : initializeApp(firebaseConfig, 'secondary');

export const secondaryAuth = getAuth(secondaryApp);

export async function nextSequentialNumber(counterKey: string) {
  const ref = doc(db, COLLECTIONS.counters, 'global');
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() && typeof snap.data()?.[counterKey] === 'number'
      ? Number(snap.data()![counterKey])
      : 0;
    const next = current + 1;
    tx.set(ref, { [counterKey]: next }, { merge: true });
    return next;
  });
}