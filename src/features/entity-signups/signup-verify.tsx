import { useEffect, useState, type ReactElement } from 'react';
import { useTranslate } from '@refinedev/core';
import { Alert, Typography, theme } from 'antd';
import { Link } from 'react-router';
import { TimciWordmark } from '../../app-shell/TimciBrand.js';
import { getV1Base } from '../../config.js';
import { timciFetch } from '../../shared/timci/http.js';
import { parseTimciHttpError } from '../../shared/timci/form/timciApiErrorParsing.js';

type VerifyStatus = 'loading' | 'verified' | 'invalid' | 'missing' | 'error';

/**
 * The token is removed from the address bar on the first read.
 * A module slot keeps it across the development double-mount so the request runs once.
 */
let stashedToken: string | null = null;
let verifyRequest: Promise<{ status: VerifyStatus; message: string }> | null = null;

function readTokenOnce(): string {
  const params = new URLSearchParams(window.location.search);
  if (params.has('token')) {
    const next = params.get('token') ?? '';
    if (next !== stashedToken) {
      stashedToken = next;
      verifyRequest = null;
    }
    params.delete('token');
    const search = params.toString();
    window.history.replaceState(
      window.history.state,
      '',
      `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`,
    );
  }

  return stashedToken ?? '';
}

function confirmToken(plainToken: string): Promise<{ status: VerifyStatus; message: string }> {
  const token = readTokenOnce() || plainToken;
  if (!verifyRequest) {
    verifyRequest = (async () => {
      if (!token) return { status: 'missing', message: '' };
      try {
        await timciFetch(`${getV1Base()}/public/entity-signups/verify`, {
          method: 'POST',
          body: JSON.stringify({ token }),
        });

        return { status: 'verified', message: '' };
      } catch (error) {
        const parsed = parseTimciHttpError(error);
        const invalid = parsed.items.some((item) => item.code === 'SIGNUP_VERIFICATION_INVALID');
        if (invalid) return { status: 'invalid', message: '' };

        const httpError = error as { statusCode?: number };
        return {
          status: 'error',
          message:
            typeof httpError.statusCode === 'number' && error instanceof Error ? error.message : '',
        };
      } finally {
        stashedToken = null;
      }
    })();
  }

  return verifyRequest;
}

export function SignupVerifyPage(): ReactElement {
  const translate = useTranslate();
  const { token } = theme.useToken();
  const pageStyle = { minHeight: '100vh', padding: 16, background: token.colorBgLayout };
  const [status, setStatus] = useState<VerifyStatus>('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const plainToken = readTokenOnce();
    let cancelled = false;
    void confirmToken(plainToken).then((result) => {
      if (cancelled) return;
      setStatus(result.status);
      setErrorMessage(result.message);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  const titleKey =
    status === 'verified'
      ? 'pages.signup.verifySuccessTitle'
      : status === 'invalid'
        ? 'pages.signup.verifyInvalidTitle'
        : status === 'missing'
          ? 'pages.signup.verifyMissingTitle'
          : status === 'error'
            ? 'pages.signup.verifyErrorTitle'
            : 'pages.signup.verifyTitle';

  return (
    <main style={pageStyle} aria-busy={status === 'loading'}>
      <div style={{ maxWidth: '40rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
          <Link to="/login" style={{ lineHeight: 0 }} aria-label="Timci">
            <TimciWordmark height={48} />
          </Link>
        </div>
        <Typography.Title level={2} data-timci-page-title={translate(titleKey)}>
          {translate(titleKey)}
        </Typography.Title>
        {status === 'loading' ? (
          <Typography.Paragraph>{translate('pages.signup.verifyLoading')}</Typography.Paragraph>
        ) : null}
        {status === 'verified' ? (
          <Typography.Paragraph>{translate('pages.signup.verifySuccessBody')}</Typography.Paragraph>
        ) : null}
        {status === 'invalid' ? (
          <Alert type="warning" showIcon message={translate('pages.signup.verifyInvalidBody')} />
        ) : null}
        {status === 'missing' ? (
          <Alert type="warning" showIcon message={translate('pages.signup.verifyMissingBody')} />
        ) : null}
        {status === 'error' ? (
          <Alert
            type="error"
            showIcon
            message={errorMessage || translate('pages.signup.verifyErrorBody')}
          />
        ) : null}
        {status !== 'loading' ? (
          <Typography.Paragraph style={{ marginTop: 16 }}>
            <Link to="/signup">{translate('pages.signup.verifyRetry')}</Link>
            {' · '}
            <Link to="/login">{translate('pages.signup.goLogin')}</Link>
          </Typography.Paragraph>
        ) : null}
      </div>
    </main>
  );
}
