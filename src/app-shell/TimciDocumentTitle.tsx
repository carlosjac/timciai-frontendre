import { useParsed } from '@refinedev/core';
import { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router';
import { readVisiblePageTitle, timciDocumentTitle } from './timciDocumentTitle.js';

/**
 * Sets the browser tab title from the screen heading, or from the route when
 * that heading is not on screen yet.
 */
export function TimciDocumentTitle() {
  const location = useLocation();
  const { action, resource } = useParsed();
  const resourceName = resource?.name;
  const pathname = location.pathname;

  useLayoutEffect(() => {
    const visible = readVisiblePageTitle(document);
    document.title = timciDocumentTitle(pathname, resourceName, action, visible);
  }, [action, pathname, resourceName]);

  useEffect(() => {
    const root = document.getElementById('root');
    if (!root) return;

    const apply = () => {
      const next = timciDocumentTitle(pathname, resourceName, action, readVisiblePageTitle(root));
      if (document.title !== next) document.title = next;
    };

    apply();
    const observer = new MutationObserver(apply);
    observer.observe(root, { childList: true, subtree: true, characterData: true });
    return () => observer.disconnect();
  }, [action, pathname, resourceName]);

  return null;
}
