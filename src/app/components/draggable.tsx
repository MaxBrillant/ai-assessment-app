"use client";

import { useSortable } from "@dnd-kit/sortable";

export function Draggable({
  children,
  id,
}: {
  children: React.ReactNode;
  id: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        transition,
      }
    : undefined;

  return (
    <div key={id} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </div>
  );
}
