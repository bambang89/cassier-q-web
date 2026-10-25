// Pengganti Alert.alert dari React Native: API yang sama (judul, pesan,
// tombol) supaya logika layar mobile bisa dipakai apa adanya. Dirender oleh
// <AlertHost /> di root.
export interface AlertButton {
  text: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

export interface AlertRequest {
  id: number;
  title: string;
  message?: string;
  buttons: AlertButton[];
}

type Listener = (queue: AlertRequest[]) => void;

let queue: AlertRequest[] = [];
let nextId = 1;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((listener) => listener(queue));
}

export const Alert = {
  alert(title: string, message?: string, buttons?: AlertButton[]) {
    queue = [...queue, { id: nextId++, title, message, buttons: buttons?.length ? buttons : [{ text: 'OK' }] }];
    emit();
  },
};

export function dismissAlert(id: number) {
  queue = queue.filter((item) => item.id !== id);
  emit();
}

export function subscribeAlerts(listener: Listener): () => void {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
}
