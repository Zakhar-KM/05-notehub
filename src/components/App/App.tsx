// src/components/App/App.tsx
import { useState } from "react";
import css from "./App.module.css";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  fetchNotes,
  deleteNote,
  createNote,
  type FetchNotesResponse,
  type CreateNoteParams,
} from "../../services/noteService";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import type { Note } from "../../types/note";
import Pagination from "../Pagination/Pagination";
import { useDebounce } from "use-debounce";
import SearchBox from "../SearchBox/SearchBox";

export default function App() {
  const queryClient = useQueryClient();

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const perPage = 12;
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading, isError, error } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ["notes", { page, perPage, search: debouncedSearch }],
    queryFn: () => fetchNotes({ page, perPage, search: debouncedSearch }),
    placeholderData: keepPreviousData,
  });

  const deleteMutation = useMutation<Note, Error, string>({
    mutationFn: (id) => deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  const createMutation = useMutation<Note, Error, CreateNoteParams>({
    mutationFn: (payload) => createNote(payload),
    onSuccess: () => {
      setIsModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ["notes"] });
    },
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1);
          }}
        />
        <>
          <Pagination
            currentPage={page}
            pageCount={data?.totalPages ?? 1}
            onPageChange={setPage}
          />
        </>
        <button
          className={css.button}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          Create note +
        </button>
      </header>

      <main>
        {isLoading && <p>Loading…</p>}

        {isError && (
          <p>
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}

        {data?.notes?.length ? (
          <>
            <NoteList
              items={data.notes}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </>
        ) : (
          !isLoading && <p>No notes yet</p>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <NoteForm
          onCancel={() => setIsModalOpen(false)}
          onSubmit={async (vals) => {
            await createMutation.mutateAsync(vals);
          }}
        />
      </Modal>
    </div>
  );
}
