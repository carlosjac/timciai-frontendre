import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { TimciHelpDrawer } from './TimciHelpDrawer.js';
import { TimciHelpContext, type TimciHelpApi } from './TimciHelpContext.js';

type Pin = { articleId: string; path: string };

export function TimciHelpProvider({ children }: { children: ReactNode }): ReactElement {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState<Pin | null>(null);
  const pinnedArticleId = pin && pin.path === pathname ? pin.articleId : null;

  const openHelp = useCallback(
    (articleId?: string) => {
      if (!articleId && open) {
        setOpen(false);
        return;
      }
      setPin(articleId ? { articleId, path: pathname } : null);
      setOpen(true);
    },
    [open, pathname],
  );

  const closeHelp = useCallback(() => {
    setOpen(false);
  }, []);

  const pinArticle = useCallback(
    (articleId: string) => {
      setPin({ articleId, path: pathname });
    },
    [pathname],
  );

  const value = useMemo<TimciHelpApi>(
    () => ({ open, pinnedArticleId, openHelp, closeHelp, pinArticle }),
    [closeHelp, open, openHelp, pinArticle, pinnedArticleId],
  );

  return (
    <TimciHelpContext.Provider value={value}>
      {children}
      <TimciHelpDrawer />
    </TimciHelpContext.Provider>
  );
}
