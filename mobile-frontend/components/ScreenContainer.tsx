import React from 'react';
import { View, ScrollView, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../hooks/useTheme';

interface ScreenContainerProps {
  scrollable?: boolean;
  padding?: number;
  children: React.ReactNode;
}

export const ScreenContainer: React.FC<ScreenContainerProps> = ({
  scrollable = false,
  padding = 16,
  children,
}) => {
  const theme = useTheme();
  const Container = scrollable ? ScrollView : View;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.colors.semantic.background.secondary }]}>
      <Container
        style={[styles.container, { padding, backgroundColor: theme.colors.semantic.background.secondary }]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </Container>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
});