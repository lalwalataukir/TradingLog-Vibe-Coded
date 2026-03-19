import type { SQLiteDatabase } from 'expo-sqlite';

const APP_SETTINGS_ID = 'app-settings';

export function ensureAppBootstrapSync(sqlite: SQLiteDatabase) {
  const row = sqlite.getFirstSync<{ count: number }>('SELECT COUNT(*) as count FROM app_settings');

  if (row && row.count > 0) {
    return;
  }

  sqlite.runSync(
    `INSERT INTO app_settings (
      id,
      default_market,
      currency,
      timezone,
      risk_per_trade_default,
      theme,
      starting_capital,
      current_capital
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [APP_SETTINGS_ID, 'indian_equity', 'INR', 'Asia/Kolkata', 2, 'dark', 2000000, 2000000]
  );
}
