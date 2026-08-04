import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { IconButton } from 'react-native-paper';

import { AUTH_GLASS } from './authGlassTheme';

type HeaderProps = {
  brand?: string;
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export const AuthGlassHeader = ({
  brand = 'TutorLink',
  title,
  subtitle,
  onBack,
}: HeaderProps) => {
  return (
    <View style={styles.header}>
      {onBack ? (
        <TouchableOpacity style={styles.backRow} onPress={onBack}>
          <IconButton
            icon="arrow-left"
            size={18}
            iconColor={AUTH_GLASS.title}
            onPress={onBack}
            style={styles.backIcon}
          />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
      ) : null}

      <Text style={styles.brand}>{brand}</Text>
      <View style={styles.brandAccent} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
};

export const AuthGlassFooter = ({
  prompt,
  actionLabel,
  onAction,
}: {
  prompt: string;
  actionLabel: string;
  onAction: () => void;
}) => (
  <View style={styles.footer}>
    <Text style={styles.footerPrompt}>{prompt}</Text>
    <TouchableOpacity onPress={onAction}>
      <Text style={styles.footerAction}>{actionLabel}</Text>
    </TouchableOpacity>
  </View>
);

export const AuthGlassDivider = ({
  label = 'or continue with',
}: {
  label?: string;
}) => (
  <View style={styles.dividerRow}>
    <View style={styles.line} />
    <Text style={styles.dividerText}>{label}</Text>
    <View style={styles.line} />
  </View>
);

const styles = StyleSheet.create({
  header: {
    marginBottom: 22,
    marginTop: 4,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: -12,
    marginBottom: 8,
  },
  backIcon: {
    margin: 0,
  },
  backText: {
    color: AUTH_GLASS.title,
    fontSize: 14,
    fontWeight: '500',
    marginLeft: -4,
  },
  brand: {
    fontSize: 28,
    fontWeight: '800',
    color: AUTH_GLASS.primary as string,
    letterSpacing: 0.4,
  },
  brandAccent: {
    width: 56,
    height: 4,
    borderRadius: 4,
    backgroundColor: AUTH_GLASS.primary as string,
    marginTop: 10,
    marginBottom: 18,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: AUTH_GLASS.title,
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
    color: AUTH_GLASS.subtitle,
    fontWeight: '400',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  footerPrompt: {
    color: AUTH_GLASS.muted,
    fontSize: 13,
  },
  footerAction: {
    color: AUTH_GLASS.link,
    fontSize: 13,
    fontWeight: '700',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  line: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: AUTH_GLASS.divider,
  },
  dividerText: {
    color: AUTH_GLASS.muted,
    fontSize: 12,
    marginHorizontal: 12,
    fontWeight: '500',
  },
});
