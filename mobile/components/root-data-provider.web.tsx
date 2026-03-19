import type { PropsWithChildren } from 'react';

import { AppDataProvider } from '@/providers/app-data-provider';

export function RootDataProvider({ children }: PropsWithChildren) {
  return <AppDataProvider>{children}</AppDataProvider>;
}
