import { BoldOutlined, ItalicOutlined, UnderlineOutlined } from '@ant-design/icons';
import { useTranslate } from '@refinedev/core';
import Underline from '@tiptap/extension-underline';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from 'antd';
import { useEffect } from 'react';
import { sanitizeRichTextHtml } from './richTextSanitize.js';

export type TimciRichTextEditorProps = {
  value?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
  /** Minimum editor body height in pixels. */
  minHeight?: number;
};

const editorBodyStyle = `
.timci-rich-text-editor .tiptap {
  outline: none;
  min-height: inherit;
  color: var(--ant-color-text, inherit);
}
.timci-rich-text-editor.timci-rich-text-editor--disabled .tiptap {
  cursor: default;
}
.timci-rich-text-editor .tiptap p {
  margin: 0 0 0.5em;
}
.timci-rich-text-editor .tiptap p:last-child {
  margin-bottom: 0;
}
`;

/** WYSIWYG editor for Timci rich-text fields (bold, italic, underline, paragraphs). */
export function TimciRichTextEditor({
  value,
  onChange,
  disabled = false,
  minHeight = 96,
}: TimciRichTextEditorProps) {
  const translate = useTranslate();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        blockquote: false,
        codeBlock: false,
        horizontalRule: false,
        bulletList: false,
        orderedList: false,
        listItem: false,
        code: false,
        link: false,
        strike: false,
      }),
      Underline,
    ],
    content: value ?? '',
    editable: !disabled,
    onUpdate: ({ editor: ed }) => {
      onChange?.(sanitizeRichTextHtml(ed.getHTML()));
    },
  });

  useEffect(() => {
    if (!editor) return;
    editor.setEditable(!disabled);
  }, [disabled, editor]);

  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const next = value ?? '';
    if (next !== current) {
      editor.commands.setContent(next, { emitUpdate: false });
    }
  }, [editor, value]);

  if (!editor) return null;

  return (
    <div
      className={
        disabled
          ? 'timci-rich-text-editor timci-rich-text-editor--disabled'
          : 'timci-rich-text-editor'
      }
      style={{
        border: '1px solid var(--ant-color-border, #d9d9d9)',
        borderRadius: 6,
        background: disabled ? 'var(--ant-color-fill-alter, rgba(0, 0, 0, 0.02))' : undefined,
      }}
    >
      <style>{editorBodyStyle}</style>
      {!disabled && (
      <div
        role="toolbar"
        aria-label={translate('form.richText.toolbar')}
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 4,
          padding: 4,
          borderBottom: '1px solid var(--ant-color-border-secondary, #f0f0f0)',
        }}
      >
        <Button
          type={editor.isActive('bold') ? 'primary' : 'default'}
          size="small"
          icon={<BoldOutlined aria-hidden />}
          aria-label={translate('form.richText.bold')}
          aria-pressed={editor.isActive('bold')}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleBold().run()}
        />
        <Button
          type={editor.isActive('italic') ? 'primary' : 'default'}
          size="small"
          icon={<ItalicOutlined aria-hidden />}
          aria-label={translate('form.richText.italic')}
          aria-pressed={editor.isActive('italic')}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        />
        <Button
          type={editor.isActive('underline') ? 'primary' : 'default'}
          size="small"
          icon={<UnderlineOutlined aria-hidden />}
          aria-label={translate('form.richText.underline')}
          aria-pressed={editor.isActive('underline')}
          disabled={disabled}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        />
      </div>
      )}
      <div style={{ padding: 8, minHeight }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
