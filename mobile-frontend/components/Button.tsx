import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled = false,
  onPress,
  children,
}) => {
  const theme = useTheme();

  const getVariantStyles = (): ViewStyle => {
    const variants: Record<string, ViewStyle> = {
      primary: { backgroundColor: theme.colors.semantic.primary.main },
      secondary: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.semantic.primary.main,
      },
      danger: { backgroundColor: theme.colors.semantic.error },
      success: { backgroundColor: theme.colors.semantic.success },
    };
    return variants[variant] || variants.primary;
  };

  const getTextStyles = (): TextStyle => {
    const variants: Record<string, TextStyle> = {
      primary: { color: theme.colors.primitive.white },
      secondary: { color: theme.colors.semantic.primary.main },
      danger: { color: theme.colors.primitive.white },
      success: { color: theme.colors.primitive.white },
    };
    return variants[variant] || variants.primary;
  };

  const getSizeStyles = (): ViewStyle => {
    const sizes: Record<string, ViewStyle> = {
      sm: { paddingVertical: theme.spacing.primitive.xs, paddingHorizontal: theme.spacing.primitive.md, minHeight: 44 },
      md: { paddingVertical: theme.spacing.primitive.sm, paddingHorizontal: theme.spacing.primitive.lg, minHeight: 48 },
      lg: { paddingVertical: theme.spacing.primitive.md, paddingHorizontal: theme.spacing.primitive.xl, minHeight: 52 },
    };
    return sizes[size] || sizes.md;
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        getVariantStyles(),
        getSizeStyles(),
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? theme.colors.semantic.primary.main : theme.colors.primitive.white}
          size="small"
        />
      ) : (
        <Text style={[styles.text, getTextStyles()]}>{children}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: { borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexDirection: 'row' },
  fullWidth: { width: '100%' },
  disabled: { opacity: 0.5 },
  text: { fontSize: 16, fontWeight: '600' },
});