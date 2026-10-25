import type { AlertButton, AlertRequest, AlertListener } from '@/types/ui';

let queue: AlertRequest[] = [];
let nextId = 1;
const listeners = new Set<AlertListener>();

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

export function subscribeAlerts(listener: AlertListener): () => void {
  listeners.add(listener);
  listener(queue);
  return () => {
    listeners.delete(listener);
  };
}
