// src/components/NoteList/NoteList.tsx
import { useState } from "react";
import css from "./NoteList.module.css";
import type { Note } from "../../types/note";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNote } from "../../services/noteService";

interface NoteListProps {
  items: Note[];
}

export default function NoteList({ items }: NoteListProps) {
  // Хуки всегда вызываем без условий
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const deleteMutation = useMutation<Note, Error, string>({
    mutationFn: (id) => deleteNote(id),
    onMutate: (id) => setDeletingId(id),
    onSettled: () => setDeletingId(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  // А вот условный рендер — пожалуйста
  if (!items.length) return null;

  return (
    <ul className={css.list}>
      {items.map((n) => (
        <li key={n.id} className={css.listItem}>
          <h2 className={css.title}>{n.title}</h2>
          <p className={css.content}>{n.content}</p>
          <div className={css.footer}>
            <span className={css.tag}>{n.tag}</span>
            <button
              type="button"
              className={css.button}
              onClick={() => deleteMutation.mutate(n.id)}
              disabled={deletingId === n.id || deleteMutation.isPending}
            >
              {deletingId === n.id ? "Deleting…" : "Delete"}
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
