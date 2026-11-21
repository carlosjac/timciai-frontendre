import { useTranslate } from '@refinedev/core';
import { Spin, Typography } from 'antd';
import { getDocument, GlobalWorkerOptions, type PDFDocumentLoadingTask } from 'pdfjs-dist';
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { useEffect, useRef, useState } from 'react';
import { translateEs } from '../../i18n/createI18nProvider.js';

GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

const FRAME_STYLE = {
  width: '100%',
  height: 'calc(100dvh - 220px)',
  minHeight: 320,
  overflowX: 'hidden',
  overflowY: 'auto',
  WebkitOverflowScrolling: 'touch',
  border: '1px solid var(--ant-color-border, #d9d9d9)',
  borderRadius: 8,
  background: 'var(--ant-color-bg-container)',
} as const;

type Phase = 'loading' | 'ready' | 'error';

function isStaleRender(error: unknown, cancelled: boolean, generation: number, current: number): boolean {
  if (cancelled || generation !== current) return true;
  if (error == null || typeof error !== 'object' || !('name' in error)) return false;
  const name = String(error.name);
  return name === 'RenderingCancelledException' || name === 'AbortException';
}

/**
 * Paints each PDF page on a canvas. Used where the browser cannot embed a PDF
 * (Android and iOS). The worker file is loaded only with this module.
 */
export default function MobileDocumentPdfPreview({ blob }: { blob: Blob }) {
  const translate = useTranslate();
  const frameRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>('loading');

  useEffect(() => {
    const frame = frameRef.current;
    const pages = pagesRef.current;
    if (!frame || !pages) return;

    let cancelled = false;
    let generation = 0;
    let activeTask: PDFDocumentLoadingTask | null = null;
    let lastWidth = -1;
    let timer = 0;

    const paint = async (width: number) => {
      const gen = ++generation;
      const previous = activeTask;
      activeTask = null;
      await previous?.destroy().catch(() => undefined);
      if (cancelled || gen !== generation) return;

      if (pages.childElementCount === 0) setPhase('loading');

      try {
        const data = new Uint8Array(await blob.arrayBuffer());
        if (cancelled || gen !== generation) return;
        const task = getDocument({ data });
        if (cancelled || gen !== generation) {
          await task.destroy().catch(() => undefined);
          return;
        }
        activeTask = task;
        const pdf = await task.promise;
        if (cancelled || gen !== generation) return;

        const scratch = document.createElement('div');
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        const pageWidth = Math.max(width - 16, 120);

        for (let i = 1; i <= pdf.numPages; i += 1) {
          if (cancelled || gen !== generation) return;
          const page = await pdf.getPage(i);
          const base = page.getViewport({ scale: 1 });
          const viewport = page.getViewport({ scale: (pageWidth / base.width) * pixelRatio });
          const canvas = document.createElement('canvas');
          const cssWidth = Math.floor(viewport.width / pixelRatio);
          const cssHeight = Math.floor(viewport.height / pixelRatio);
          canvas.width = Math.floor(viewport.width);
          canvas.height = Math.floor(viewport.height);
          canvas.style.width = `${cssWidth}px`;
          canvas.style.height = `${cssHeight}px`;
          canvas.style.display = 'block';
          canvas.style.margin = '8px auto';
          canvas.style.background = '#fff';
          canvas.setAttribute('role', 'img');
          canvas.setAttribute(
            'aria-label',
            translateEs('documents.previewPage').replaceAll('{{page}}', String(i)),
          );
          await page.render({ canvas, viewport }).promise;
          if (cancelled || gen !== generation) return;
          scratch.appendChild(canvas);
        }

        if (pdf.numPages === 0) {
          setPhase('error');
          return;
        }
        pages.replaceChildren(...scratch.childNodes);
        setPhase('ready');
      } catch (error) {
        if (isStaleRender(error, cancelled, gen, generation)) return;
        if (pages.childElementCount === 0) setPhase('error');
      }
    };

    const schedule = () => {
      const width = frame.clientWidth;
      if (width < 32 || Math.abs(width - lastWidth) < 8) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        lastWidth = frame.clientWidth;
        void paint(lastWidth);
      }, 80);
    };

    const observer = new ResizeObserver(schedule);
    observer.observe(frame);
    schedule();

    return () => {
      cancelled = true;
      generation += 1;
      observer.disconnect();
      window.clearTimeout(timer);
      const task = activeTask;
      activeTask = null;
      void task?.destroy().catch(() => undefined);
    };
  }, [blob]);

  return (
    <div ref={frameRef} style={FRAME_STYLE} aria-label={translate('documents.previewTitle')}>
      {phase === 'loading' ? (
        <div
          role="status"
          aria-label={translate('documents.previewLoading')}
          style={{ textAlign: 'center', padding: 48 }}
        >
          <Spin />
        </div>
      ) : null}
      {phase === 'error' ? (
        <Typography.Paragraph type="secondary" style={{ margin: 16 }}>
          {translate('documents.previewError')}
        </Typography.Paragraph>
      ) : null}
      <div ref={pagesRef} />
    </div>
  );
}
