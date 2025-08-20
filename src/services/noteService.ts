import axios, { type AxiosInstance } from "axios";
import type { Note, NoteTag } from "../types/note";

const api: AxiosInstance = axios.create({
  baseURL: "https://notehub-public.goit.study/api",
});

const token = import.meta.env.VITE_NOTEHUB_TOKEN;
if (token) {
  api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
}

export interface FetchNotesParams {
  page?: number;
  perPage?: number;
  search?: string;
}

export interface FetchNotesResponse {
  notes: Note[];
  totalPages: number;
  page?: number;
  perPage?: number;
  totalItems?: number;
}

export interface CreateNoteParams {
  title: string;
  content: string;
  tag: NoteTag;
}

// Получить заметки (с пагинацией и поиском)
export async function fetchNotes({
  page = 1,
  perPage = 12,
  search = "",
}: FetchNotesParams = {}): Promise<FetchNotesResponse> {
  const res = await api.get<FetchNotesResponse>("/notes", {
    params: { page, perPage, ...(search ? { search } : {}) },
  });
  return res.data;
}

// Создать заметку
export async function createNote(payload: CreateNoteParams): Promise<Note> {
  const res = await api.post<{ data: Note }>("/notes", payload);
  return res.data.data;
}

// Удалить заметку
export async function deleteNote(id: string): Promise<Note> {
  const res = await api.delete<{ data: Note }>(`/notes/${id}`);
  return res.data.data;
}

export default api;
