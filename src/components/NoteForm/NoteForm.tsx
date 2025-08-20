import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import css from "./NoteForm.module.css";
import type { NoteTag } from "../../types/note";

interface NoteFormValues {
  title: string;
  content: string;
  tag: NoteTag | "";
}

interface NoteFormProps {
  onSubmit: (values: {
    title: string;
    content: string;
    tag: NoteTag;
  }) => Promise<void> | void;
  onCancel: () => void;
}

const TAGS: NoteTag[] = ["Todo", "Work", "Personal", "Meeting", "Shopping"];

const schema = Yup.object({
  title: Yup.string().min(3, "Min 3").max(50, "Max 50").required("Required"),
  content: Yup.string().max(500, "Max 500"),
  tag: Yup.mixed<NoteTag>()
    .oneOf(TAGS as readonly NoteTag[], "Invalid tag")
    .required("Required"),
});

export default function NoteForm({ onSubmit, onCancel }: NoteFormProps) {
  const initialValues: NoteFormValues = { title: "", content: "", tag: "" };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={async (vals, helpers) => {
        try {
          const payload = { ...vals, tag: vals.tag as NoteTag };
          await onSubmit(payload);
        } finally {
          helpers.setSubmitting(false);
        }
      }}
    >
      {({ isSubmitting, isValid }) => (
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
              disabled={isSubmitting || !isValid}
            >
              Create note
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
