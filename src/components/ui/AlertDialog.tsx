'use client';

import { Button } from './Button';
import { Modal } from './Modal';

export interface AlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  isDanger?: boolean;
  isConfirmLoading?: boolean;
}

export function AlertDialog({
  isOpen,
  onClose,
  title,
  description,
  confirmText = 'Konfirmasi',
  cancelText = 'Batal',
  onConfirm,
  isDanger = false,
  isConfirmLoading = false,
}: AlertDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} closeOnBackdropPress={!isConfirmLoading} size="sm">
      <h2 className="text-xl font-bold text-ink">{title}</h2>
      {description ? <p className="mt-2 whitespace-pre-line text-ink-2">{description}</p> : null}
      <div className="mt-5 flex justify-end gap-2">
        <Button variant="ghost" onClick={onClose} disabled={isConfirmLoading} className="min-w-[90px]">
          {cancelText}
        </Button>
        <Button
          variant={isDanger ? 'danger' : 'solid'}
          onClick={onConfirm}
          loading={isConfirmLoading}
          className="min-w-[90px]"
        >
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
