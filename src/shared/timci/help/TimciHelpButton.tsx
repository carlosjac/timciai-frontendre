import { useState, type ReactElement } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { Button, Popover, Typography } from 'antd';
import { useTranslate } from '@refinedev/core';

/** Quiet help control: a small icon that opens the explanation on click. */
export function TimciHelpButton(props: { topic: string; text: string }): ReactElement {
  const translate = useTranslate();
  const [open, setOpen] = useState(false);

  return (
    <Popover
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      destroyOnHidden
      content={
        <Typography.Paragraph style={{ maxWidth: 'min(340px, calc(100vw - 16px))', marginBottom: 0 }}>{props.text}</Typography.Paragraph>
      }
    >
      <Button
        type="text"
        size="small"
        aria-label={translate('help.open', { topic: props.topic })}
        aria-expanded={open}
        aria-haspopup="dialog"
        icon={<QuestionCircleOutlined aria-hidden />}
        onMouseDown={(event) => event.stopPropagation()}
        style={{ width: 24, height: 24, color: 'inherit', opacity: 0.65 }}
      />
    </Popover>
  );
}
