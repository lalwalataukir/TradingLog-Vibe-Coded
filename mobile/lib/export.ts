import { File, Paths } from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';

import { serializeTradesCsv, stringifyJsonBackup, type BackupPayload } from '@/lib/export-helpers';

export async function exportJsonBackup(payload: BackupPayload) {
  const file = new File(Paths.document, `tradelog-backup-${Date.now()}.json`);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(stringifyJsonBackup(payload));
  await shareIfAvailable(file.uri, 'application/json');
  return file.uri;
}

export async function exportTradesCsv(trades: BackupPayload['trades']) {
  const file = new File(Paths.document, `tradelog-trades-${Date.now()}.csv`);
  if (file.exists) {
    file.delete();
  }
  file.create();
  file.write(serializeTradesCsv(trades));
  await shareIfAvailable(file.uri, 'text/csv');
  return file.uri;
}

async function shareIfAvailable(uri: string, mimeType: string) {
  if (await isAvailableAsync()) {
    await shareAsync(uri, { mimeType });
  }
}
