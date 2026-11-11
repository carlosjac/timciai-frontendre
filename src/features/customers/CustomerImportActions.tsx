import { useState } from 'react';
import { useTranslate } from '@refinedev/core';
import { Button, DatePicker, Form, Modal, Space, Typography, Upload } from 'antd';
import { DownloadOutlined, UploadOutlined } from '@ant-design/icons';
import dayjs, { type Dayjs } from 'dayjs';
import { useNavigate } from 'react-router';
import { antdDatePickerLocaleEs } from '../../shared/timci/antdPickerLocaleEs.js';
import {
  downloadCustomerImportTemplate,
  enqueueCustomerImport,
} from '../../shared/timci/importJobsApi.js';
import { useUserPreferences } from '../preferences/useUserPreferences.js';
import { useTimciNotify } from '../../shared/timci/notifyTimci.js';

type Props = {
  tenantId: string | null;
};

export function CustomerImportActions({ tenantId }: Props) {
  const translate = useTranslate();
  const navigate = useNavigate();
  const notify = useTimciNotify();
  const { dateFormat } = useUserPreferences();
  const [downloading, setDownloading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [openingDate, setOpeningDate] = useState<Dayjs>(() => dayjs());
  const [uploading, setUploading] = useState(false);
  const disabled = !tenantId;

  async function handleDownload(): Promise<void> {
    if (!tenantId) return;
    setDownloading(true);
    try {
      await downloadCustomerImportTemplate(tenantId);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : translate('pages.customers.import.downloadError'));
    } finally {
      setDownloading(false);
    }
  }

  async function handleSubmit(): Promise<void> {
    if (!tenantId || !file) return;
    setUploading(true);
    try {
      const { jobId } = await enqueueCustomerImport(
        tenantId,
        file,
        (openingDate ?? dayjs()).format('YYYY-MM-DD'),
      );
      setModalOpen(false);
      setFile(null);
      setOpeningDate(dayjs());
      navigate(`/customers/import-jobs/${encodeURIComponent(jobId)}`);
    } catch (e) {
      notify.error(e instanceof Error ? e.message : translate('pages.customers.import.uploadError'));
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <Button
        icon={<UploadOutlined aria-hidden />}
        disabled={disabled}
        onClick={() => setModalOpen(true)}
      >
        {translate('pages.customers.import.upload')}
      </Button>
      <Modal
        title={translate('pages.customers.import.modalTitle')}
        open={modalOpen}
        onCancel={() => {
          if (uploading) return;
          setModalOpen(false);
        }}
        onOk={() => void handleSubmit()}
        okText={translate('pages.customers.import.submit')}
        cancelText={translate('pages.customers.import.cancel')}
        okButtonProps={{ disabled: !file, loading: uploading }}
        destroyOnHidden
      >
        <Form layout="vertical" requiredMark={false} onFinish={() => undefined}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <Typography.Paragraph style={{ marginBottom: 0 }}>
              {translate('pages.customers.import.modalHint')}
            </Typography.Paragraph>
            <Button
              icon={<DownloadOutlined aria-hidden />}
              loading={downloading}
              disabled={disabled}
              onClick={() => void handleDownload()}
            >
              {translate('pages.customers.import.downloadTemplate')}
            </Button>
            <Form.Item
              label={translate('pages.customers.import.openingDate')}
              tooltip={translate('pages.customers.import.openingDateHelp')}
              extra={
                <span id="timci-customer-import-date-help">
                  {translate('pages.customers.import.openingDateHelp')}
                </span>
              }
              htmlFor="timci-customer-import-date"
              style={{ marginBottom: 0 }}
            >
              <DatePicker
                id="timci-customer-import-date"
                locale={antdDatePickerLocaleEs}
                format={dateFormat}
                value={openingDate}
                onChange={(v) => setOpeningDate(v ?? dayjs())}
                style={{ width: '100%' }}
                allowClear={false}
                placeholder={translate('pages.customers.import.openingDatePlaceholder')}
                aria-describedby="timci-customer-import-date-help"
              />
            </Form.Item>
            <Typography.Paragraph type="secondary" style={{ marginBottom: 0 }}>
              {translate('pages.customers.import.saldoColumnsHint')}
            </Typography.Paragraph>
            <Upload
              accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              maxCount={1}
              beforeUpload={(next) => {
                setFile(next);
                return false;
              }}
              onRemove={() => setFile(null)}
              fileList={
                file
                  ? [{ uid: 'import', name: file.name, status: 'done' as const }]
                  : []
              }
            >
              <Button icon={<UploadOutlined aria-hidden />}>
                {translate('pages.customers.import.chooseFile')}
              </Button>
            </Upload>
          </Space>
        </Form>
      </Modal>
    </>
  );
}
