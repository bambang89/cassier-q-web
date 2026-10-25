'use client';

import { useState } from 'react';
import type { RefObject } from 'react';
import { KeyboardSensor, PointerSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core';
import type { DragEndEvent, DragMoveEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';

import type { BlockType, StorefrontBlock } from '@/types/storefront';
import type { EditorDoc } from '@/features/storefront/types';
import { PALETTE_PREFIX, LAYER_PREFIX } from '@/features/storefront/constants';

/**
 * Seret & lepas di editor: blok baru dari palet (posisi jatuh dihitung dari
 * pointer), urutan lapisan, dan memindah blok di kanvas.
 */
export function useEditorDnd(
  docRef: RefObject<EditorDoc>,
  addBlock: (type: BlockType, index?: number) => void,
  setBlocks: (fn: (prev: StorefrontBlock[]) => StorefrontBlock[]) => void,
) {
  const [dragType, setDragType] = useState<BlockType | null>(null);
  const [dropIndex, setDropIndex] = useState<number | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragStart = (event: DragStartEvent) => {
    const id = String(event.active.id);
    setDragType(id.startsWith(PALETTE_PREFIX) ? (id.slice(PALETTE_PREFIX.length) as BlockType) : null);
  };

  const onDragMove = (event: DragMoveEvent) => {
    if (!String(event.active.id).startsWith(PALETTE_PREFIX)) return;
    const over = event.over;
    if (!over) return setDropIndex(null);
    const blocks = docRef.current.blocks;
    if (over.id === 'canvas') return setDropIndex(blocks.length);
    const index = blocks.findIndex((b) => b.id === over.id);
    if (index < 0) return setDropIndex(null);
    const start = event.activatorEvent as PointerEvent;
    const y = (start.clientY ?? NaN) + event.delta.y;
    const after = Number.isFinite(y) ? y > over.rect.top + over.rect.height / 2 : false;
    setDropIndex(index + (after ? 1 : 0));
  };

  const onDragEnd = (event: DragEndEvent) => {
    const activeId = String(event.active.id);
    const overId = event.over ? String(event.over.id) : null;
    const index = dropIndex;
    setDragType(null);
    setDropIndex(null);
    if (!overId) return;
    if (activeId.startsWith(PALETTE_PREFIX)) {
      addBlock(activeId.slice(PALETTE_PREFIX.length) as BlockType, index ?? docRef.current.blocks.length);
      return;
    }
    if (activeId.startsWith(LAYER_PREFIX)) {
      const from = activeId.slice(LAYER_PREFIX.length);
      const to = overId.slice(LAYER_PREFIX.length);
      if (from !== to) setBlocks((prev) => arrayMove(prev, prev.findIndex((b) => b.id === from), prev.findIndex((b) => b.id === to)));
      return;
    }
    if (activeId !== overId && overId !== 'canvas') {
      setBlocks((prev) => {
        const target = prev.findIndex((b) => b.id === overId);
        return prev[target]?.locked ? prev : arrayMove(prev, prev.findIndex((b) => b.id === activeId), target);
      });
    }
  };

  const onDragCancel = () => {
    setDragType(null);
    setDropIndex(null);
  };

  return { sensors, dragType, dropIndex, onDragStart, onDragMove, onDragEnd, onDragCancel };
}
