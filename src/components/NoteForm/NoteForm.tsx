import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import css from "./NoteForm.module.css";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createNote, type CreateNoteParams } from "../../services/noteService";
import type { Note, NoteTag } from "../../types/note";

const TAGS: NoteTag[] = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

const schema = Yup.object({
  title: Yup.string().min(3, "Min 3").max(50, "Max 50").required("Required"),
  content: Yup.string().max(500, "Max 500"),
  tag: Yup.mixed<NoteTag>().oneOf(TAGS, "Invalid tag").required("Required"),
});

interface NoteFormProps {
  onCancel: () => void; // лише закрити модалку
}

export default function NoteForm({ onCancel }: NoteFormProps) {
  const queryClient = useQueryClient();

  const createMutation = useMutation<Note, Error, CreateNoteParams>({
    mutationFn: (payload) => createNote(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notes"] });
      onCancel(); // закриваємо модалку після успіху
    },
  });

  return (
    <Formik
      initialValues={{ title: "", content: "", tag: "" as unknown as NoteTag }}
      validationSchema={schema}
      onSubmit={async (vals, helpers) => {
        try {
          await createMutation.mutateAsync({
            title: vals.title,
            content: vals.content,
            tag: vals.tag,
          });
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid }) => (
        // структура строго з ТЗ
        <Form className={css.form}>
          <div className={css.formGroup}>
            <label htmlFor="title">Title</label>
            <Field id="title" type="text" name="title" className={css.input} />
            <span className={css.error}>
              <ErrorMessage name="title" />
            </span>
          </div>

          <div className={css.formGroup}>
            <label htmlFor="content">Content</label>
            <Field
              id="content"
              as="textarea"
              name="content"
              rows={8}
              className={css.textarea}
            />
            <span className={css.error}>
              <ErrorMessage name="content" />
            </span>
          </div>

          <div className={css.formGroup}>
            <label htmlFor="tag">Tag</label>
            <Field id="tag" as="select" name="tag" className={css.select}>
              <option value="">Select tag</option>
              {TAGS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </Field>
            <span className={css.error}>
              <ErrorMessage name="tag" />
            </span>
          </div>

          <div className={css.actions}>
            <button
              type="button"
              className={css.cancelButton}
              onClick={onCancel}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={css.submitButton}
              disabled={isSubmitting || createMutation.isPending || !isValid}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
