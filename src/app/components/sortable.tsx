"use client";

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useEffect, useState } from "react";

export default function Sortable({
  children,
  items,
  setItems,
  setDraggedId,
  hasDelay,
}: {
  children: React.ReactNode;
  items: any[];
  setItems: (items: any[]) => void;
  setDraggedId: (id: string | undefined) => void;
  hasDelay?: boolean;
}) {
  const [sortableItems, setSortableItems] = useState(items);

  useEffect(() => {
    setItems(sortableItems);
  }, [sortableItems]);

  const sensors = useSensors(
    useSensor(
      PointerSensor,
      hasDelay
        ? {
            // Add activation constraints
            activationConstraint: {
              // Delay in milliseconds
              delay: 500,
              // Optional: add tolerance for slight movements during the delay
              tolerance: 5,
            },
          }
        : {}
    ),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setSortableItems((sortableItems) => {
        const oldIndex = sortableItems.findIndex(
          (sortableItem) => sortableItem.id === active.id
        );
        const newIndex = sortableItems.findIndex(
          (sortableItem) => sortableItem.id === over?.id
        );

        return arrayMove(sortableItems, oldIndex, newIndex);
      });
    }
  };
  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={(event) => setDraggedId(event.active.id.toString())}
      onDragEnd={(event) => {
        handleDragEnd(event);
        setDraggedId(undefined);
      }}
    >
      <SortableContext
        items={sortableItems}
        strategy={verticalListSortingStrategy}
      >
        {children}
      </SortableContext>
    </DndContext>
  );
}
