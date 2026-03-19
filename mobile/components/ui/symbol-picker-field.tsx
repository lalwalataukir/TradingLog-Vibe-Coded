import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { getSymbolMatches, getSymbolPlaceholder } from '@/lib/symbols';
import { colors, radii, spacing } from '@/lib/theme';
import type { Market } from '@/lib/types';

export function SymbolPickerField({
  market,
  onChange,
  value,
}: {
  market: Market;
  onChange: (value: string) => void;
  value: string;
}) {
  const [query, setQuery] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const matches = useMemo(() => getSymbolMatches(query, market, 10), [market, query]);
  const showDropdown = isFocused && matches.length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        autoCapitalize="characters"
        autoCorrect={false}
        onBlur={() => {
          setTimeout(() => setIsFocused(false), 120);
        }}
        onChangeText={(text) => {
          const normalized = text.toUpperCase();
          setQuery(normalized);
          onChange(normalized);
        }}
        onFocus={() => setIsFocused(true)}
        placeholder={getSymbolPlaceholder(market)}
        placeholderTextColor={colors.muted}
        style={styles.input}
        value={query}
      />

      {showDropdown ? (
        <View style={styles.dropdown}>
          {matches.map((option) => (
            <Pressable
              key={`${option.market}:${option.symbol}`}
              onPress={() => {
                setQuery(option.symbol);
                onChange(option.symbol);
                setIsFocused(false);
              }}
              style={styles.option}
            >
              <Text style={styles.optionSymbol}>{option.symbol}</Text>
              <Text numberOfLines={1} style={styles.optionName}>
                {option.name}
              </Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    zIndex: 20,
  },
  dropdown: {
    backgroundColor: colors.cardAlt,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginTop: 8,
    overflow: 'hidden',
  },
  input: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderRadius: radii.lg,
    borderWidth: 1,
    color: colors.foreground,
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  option: {
    borderTopColor: colors.border,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 2,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  optionName: {
    color: colors.muted,
    fontSize: 12,
  },
  optionSymbol: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
});
