import { useTranslate } from '@refinedev/core';
import { Form, Select } from 'antd';

type Props = {
  disabled?: boolean;
};

/**
 * Entity channel for Timci document emission (none / unofficial X / official future).
 */
export function EntityDocumentEmissionFields({ disabled = false }: Props) {
  const translate = useTranslate();

  return (
    <Form.Item
      label={translate('create.entity.documentEmissionMode')}
      name="documentEmissionMode"
      extra={translate('create.entity.documentEmissionModeHelp')}
      initialValue="unofficial"
    >
      <Select
        disabled={disabled}
        aria-label={translate('create.entity.documentEmissionMode')}
        options={[
          { value: 'none', label: translate('documents.mode.none') },
          { value: 'unofficial', label: translate('documents.mode.unofficial') },
          {
            value: 'official',
            label: translate('documents.mode.official'),
            disabled: true,
          },
        ]}
      />
    </Form.Item>
  );
}
