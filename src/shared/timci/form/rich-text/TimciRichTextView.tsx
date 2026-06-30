import { sanitizeRichTextHtml } from './richTextSanitize.js';

export type TimciRichTextViewProps = {
  html?: string | null;
};

const viewStyle = `
.timci-rich-text-view p {
  margin: 0 0 0.5em;
}
.timci-rich-text-view p:last-child {
  margin-bottom: 0;
}
`;

/** Renders sanitized rich-text HTML; plain-text legacy values use pre-wrap. */
export function TimciRichTextView({ html }: TimciRichTextViewProps) {
  if (html == null || html === '') {
    return <span>—</span>;
  }

  const safe = sanitizeRichTextHtml(html);
  const looksLikeHtml = /<[a-z][\s\S]*>/i.test(safe);

  if (!looksLikeHtml) {
    return <span style={{ whiteSpace: 'pre-wrap' }}>{safe}</span>;
  }

  return (
    <>
      <style>{viewStyle}</style>
      <div
        className="timci-rich-text-view"
        style={{ whiteSpace: 'pre-wrap' }}
        dangerouslySetInnerHTML={{ __html: safe }}
      />
    </>
  );
}
