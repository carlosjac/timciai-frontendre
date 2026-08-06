import { lazy, type ComponentType, type LazyExoticComponent } from 'react';

/** Named-export page → `React.lazy` default for route code-splitting. */
export function lazyPage<T extends ComponentType<unknown>>(
  loader: () => Promise<Record<string, T>>,
  exportName: string,
): LazyExoticComponent<T> {
  return lazy(async () => {
    const mod = await loader();
    const Page = mod[exportName];
    if (Page == null) {
      throw new Error(`lazyPage: missing export "${exportName}"`);
    }
    return { default: Page };
  });
}
