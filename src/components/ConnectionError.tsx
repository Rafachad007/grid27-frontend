import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { usePreferences } from '../context/PreferencesContext';

interface ConnectionErrorProps {
  onRetry: () => void;
}

export function ConnectionError({ onRetry }: ConnectionErrorProps) {
  const { colors, t } = usePreferences();

  return (
    <View style={styles.wrapper}>
      <View
        style={[
          styles.card,
          {
            borderColor: colors.border,
            backgroundColor: colors.card,
          },
        ]}
      >
        <View style={[styles.iconBox, { backgroundColor: colors.btnBg }]}>
          <Ionicons name="cloud-offline-outline" size={34} color={colors.btnText} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>{t.connectionErrorTitle}</Text>
        <Text style={[styles.subtitle, { color: colors.subtext }]}>{t.connectionErrorSub}</Text>

        <Pressable
          style={[styles.retryBtn, { backgroundColor: colors.btnBg }]}
          onPress={onRetry}
        >
          <Ionicons name="refresh-sharp" size={18} color={colors.btnText} />
          <Text style={[styles.retryText, { color: colors.btnText }]}>{t.retryBtn}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  card: {
    width: '100%',
    borderWidth: 4,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    padding: 24,
    alignItems: 'center',
  },
  iconBox: {
    width: 64,
    height: 64,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '900',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 19,
    marginTop: 8,
    marginBottom: 22,
  },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  retryText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});