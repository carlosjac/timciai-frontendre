import { useTranslate } from '@refinedev/core';
import { Modal } from 'antd';

export type TimciActivateDeactivateConfirmModalProps = {
  open: boolean;
  title: string;
  okText: string;
  body: string;
  recordName?: string;
  isActive?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

export function TimciActivateDeactivateConfirmModal({
  open,
  title,
  okText,
  body,
  recordName,
  isActive,
  loading,
  onCancel,
  onConfirm,
}: TimciActivateDeactivateConfirmModalProps) {
  const translate = useTranslate();

  return (
    <Modal
      open={open}
      title={title}
      okText={okText}
      okButtonProps={{ danger: isActive, loading }}
      cancelText={translate('buttons.cancel')}
      onCancel={onCancel}
      onOk={onConfirm}
      destroyOnClose
    >
      <p>
        {recordName != null && recordName !== '' ? (
          <>
            <strong>«{recordName}»</strong>
            <br />
          </>
        ) : null}
        {body}
      </p>
    </Modal>
  );
}
