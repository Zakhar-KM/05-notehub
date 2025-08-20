import { useState } from "react";
import css from "./App.module.css";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  fetchNotes,
  type FetchNotesResponse,
} from "../../services/noteService";
import NoteList from "../NoteList/NoteList";
import Modal from "../Modal/Modal";
import NoteForm from "../NoteForm/NoteForm";
import Pagination from "../Pagination/Pagination";
import SearchBox from "../SearchBox/SearchBox";
import { useDebounce } from "use-debounce";

export default function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // пагінація + пошук
  const [page, setPage] = useState(1); // 1-based
  const perPage = 12;
  const [search, setSearch] = useState("");
  const [debouncedSearch] = useDebounce(search, 500);

  // список нотаток
  const { data, isLoading, isError, error } = useQuery<
    FetchNotesResponse,
    Error
  >({
    queryKey: ["notes", { page, perPage, search: debouncedSearch }],
    queryFn: () => fetchNotes({ page, perPage, search: debouncedSearch }),
    placeholderData: keepPreviousData, // v5
  });

  return (
    <div className={css.app}>
      <header className={css.toolbar}>
        <SearchBox
          value={search}
          onChange={(v) => {
            setSearch(v);
            setPage(1); // новий пошук — з першої сторінки
          }}
        />

        {(data?.totalPages ?? 0) > 1 && (
          <Pagination
            currentPage={page}
            pageCount={data!.totalPages}
            onPageChange={setPage}
          />
        )}

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
          <NoteList items={data.notes} />
        ) : (
          !isLoading && <p>No notes yet</p>
        )}
      </main>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        {/* форма сама викликає мутацію через TanStack Query */}
        <NoteForm onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
}
