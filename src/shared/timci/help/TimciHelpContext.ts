import { createContext, useContext } from 'react';

export type TimciHelpApi = {
  open: boolean;
  pinnedArticleId: string | null;
  openHelp: (articleId?: string) => void;
  closeHelp: () => void;
  pinArticle: (articleId: string) => void;
};

export const TimciHelpContext = createContext<TimciHelpApi | null>(null);

export function useTimciHelp(): TimciHelpApi {
  const value = useContext(TimciHelpContext);
  if (!value) throw new Error('useTimciHelp must be used within TimciHelpProvider');
  return value;
}
