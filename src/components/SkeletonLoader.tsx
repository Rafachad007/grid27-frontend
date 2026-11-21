import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet, useWindowDimensions, ViewStyle, DimensionValue } from 'react-native';
import { usePreferences } from '../context/PreferencesContext';

interface SkeletonBlockProps {
  width: DimensionValue;
  height: number;
  style?: ViewStyle;
}

export function SkeletonBlock({ width, height, style }: SkeletonBlockProps) {
  const { colors } = usePreferences();
  const opacity = useRef(new Animated.Value(0.35)).current;

  useEffect(() => {
    const animacion = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.85, duration: 750, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0.35, duration: 750, useNativeDriver: true }),
      ])
    );
    animacion.start();
    return () => animacion.stop();
  }, [opacity]);

  return (
    <Animated.View
      style={[{ width, height, backgroundColor: colors.skeleton, opacity }, style]}
    />
  );
}

export function HomeScreenSkeleton() {
  const { width } = useWindowDimensions();
  const { colors } = usePreferences();
  const cardWidth = (width - 48) / 2;
  const heroWidth = Math.min(width * 0.68, 280);

  return (
    <View style={styles.homeSkeletonContainer}>
      <SkeletonBlock width={190} height={20} style={{ marginBottom: 14 }} />
      <View style={styles.heroRow}>
        {[0, 1].map((idx) => (
          <View
            key={idx}
            style={[
              styles.heroCardSkeleton,
              { width: heroWidth, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <SkeletonBlock width="100%" height={230} />
            <View style={styles.textArea}>
              <SkeletonBlock width="80%" height={16} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="45%" height={16} />
            </View>
          </View>
        ))}
      </View>

      <SkeletonBlock width={210} height={20} style={{ marginTop: 10, marginBottom: 14 }} />
      <View style={styles.gridRow}>
        {[0, 1, 2, 3].map((item) => (
          <View
            key={item}
            style={[
              styles.cardBrutalist,
              { width: cardWidth, borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <View style={[styles.imageAreaBrutalist, { borderBottomColor: colors.border }]}>
              <SkeletonBlock width="100%" height={175} />
            </View>
            <View style={styles.textArea}>
              <SkeletonBlock width="78%" height={14} style={{ marginBottom: 8 }} />
              <SkeletonBlock width="48%" height={14} />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

export function ProductGridSkeleton({ count = 4 }: { count?: number; variant?: 'home' | 'brutalist' }) {
  const { width } = useWindowDimensions();
  const { colors } = usePreferences();
  const cardWidth = (width - 48) / 2;
  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <View style={styles.gridContainer}>
      {items.map((item) => (
        <View
          key={item}
          style={[
            styles.cardBrutalist,
            { width: cardWidth, borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <View style={[styles.imageAreaBrutalist, { borderBottomColor: colors.border }]}>
            <SkeletonBlock width="100%" height={170} />
          </View>
          <View style={styles.textArea}>
            <SkeletonBlock width="78%" height={14} style={{ marginBottom: 8 }} />
            <SkeletonBlock width="48%" height={14} />
          </View>
        </View>
      ))}
    </View>
  );
}

export function ProductDetailSkeleton() {
  const { colors } = usePreferences();

  return (
    <View style={[styles.detailContainer, { backgroundColor: colors.bg }]}>
      <View style={[styles.detailHeader, { borderBottomColor: colors.border }]}>
        <SkeletonBlock width={95} height={38} />
        <SkeletonBlock width={40} height={38} />
      </View>
      <View style={[styles.detailImageBox, { borderBottomColor: colors.border }]}>
        <SkeletonBlock width="100%" height={400} />
      </View>
      <View style={styles.detailInfo}>
        <SkeletonBlock width="75%" height={32} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="40%" height={22} />
        <View style={[styles.detailDivider, { backgroundColor: colors.border }]} />
        <SkeletonBlock width={140} height={14} style={{ marginBottom: 12 }} />
        <View style={styles.sizesRow}>
          {[0, 1, 2, 3].map((idx) => (
            <View key={idx} style={[styles.sizeSkeletonBox, { borderColor: colors.border }]}>
              <SkeletonBlock width="100%" height={42} />
            </View>
          ))}
        </View>
        <SkeletonBlock width={100} height={14} style={{ marginBottom: 10 }} />
        <SkeletonBlock width="100%" height={14} style={{ marginBottom: 8 }} />
        <SkeletonBlock width="90%" height={14} style={{ marginBottom: 32 }} />
        <SkeletonBlock width="100%" height={58} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  homeSkeletonContainer: { padding: 16 },
  heroRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  heroCardSkeleton: { borderWidth: 3 },
  gridRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
  cardBrutalist: { marginBottom: 18, borderWidth: 3 },
  imageAreaBrutalist: { position: 'relative', width: '100%', borderBottomWidth: 3 },
  textArea: { paddingHorizontal: 10, paddingVertical: 12 },
  detailContainer: { flex: 1 },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    borderBottomWidth: 4,
  },
  detailImageBox: { borderBottomWidth: 4 },
  detailInfo: { padding: 20 },
  detailDivider: { height: 4, marginVertical: 20 },
  sizesRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sizeSkeletonBox: { width: 48, height: 48, borderWidth: 3 },
});