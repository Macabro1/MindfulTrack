import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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

  if (scrollable) {
    return (
      <SafeAreaView
        style={[styles.safeArea, { backgroundColor: theme.colors.semantic.background.secondary }]}
        edges={['top', 'left', 'right']}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollContent, { padding }]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.semantic.background.secondary }]}
      edges={['top', 'left', 'right']}
    >
      <View
        style={[
          styles.container,
          { padding, backgroundColor: theme.colors.semantic.background.secondary },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 40 },
});