import { TimciRichTextView } from './TimciRichTextView.js';

export type TimciRichTextReadonlyFieldProps = {
  value?: string;
  minHeight?: number;
};

/** Read-only rich-text surface for Ant Design Form.Item (receives `value` from the form). */
export function TimciRichTextReadonlyField({
  value,
  minHeight = 96,
}: TimciRichTextReadonlyFieldProps) {
  return (
    <div
      className="timci-rich-text-readonly"
      style={{
        padding: 12,
        minHeight,
        border: '1px solid var(--ant-color-border, #d9d9d9)',
        borderRadius: 6,
        background: 'var(--ant-color-fill-alter, rgba(0, 0, 0, 0.02))',
        color: 'var(--ant-color-text, inherit)',
      }}
    >
      <TimciRichTextView html={value} />
    </div>
  );
}
