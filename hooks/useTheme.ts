import { Colors, ThemeColors } from '@/constants/theme';
import { useColorScheme } from 'react-native';

export function useTheme(): { colors: ThemeColors; isDark: boolean } {
    const scheme = useColorScheme();
    const isDark = scheme !== 'light';
    return { colors: isDark ? Colors.dark : Colors.light, isDark };
}
