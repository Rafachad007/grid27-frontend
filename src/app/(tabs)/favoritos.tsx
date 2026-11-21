import { View, Text, StyleSheet, FlatList, Image, Pressable, useWindowDimensions } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePreferences } from '../../context/PreferencesContext';
import { ProductGridSkeleton } from '../../components/SkeletonLoader';

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  imagenes: { id: number; imagen: string }[];
}

export default function FavoritosScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;

  const { isAuthenticated } = useAuth();
  const { toggleFavorito } = useFavorites();
  const { colors, t } = usePreferences();
  const router = useRouter();

  const [favoritos, setFavoritos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(false);

  const cargarFavoritos = useCallback(() => {
    if (!isAuthenticated) {
      setFavoritos([]);
      return;
    }

    setCargando(true);
    api.get('/productos/mis_favoritos/')
      .then((response) => {
        const lista = response.data.results ? response.data.results : response.data;
        setFavoritos(lista);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar favoritos:', error);
        setCargando(false);
      });
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      cargarFavoritos();
    }, [cargarFavoritos])
  );

  const quitarFavorito = async (e: any, productoId: number) => {
    e.stopPropagation();
    try {
      await toggleFavorito(productoId);
      setFavoritos((prev) => prev.filter((item) => item.id !== productoId));
    } catch (error) {
      console.error('Error al quitar favorito:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg }]}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.favoritesTitle}</Text>
        </View>
        <View style={styles.centerBox}>
          <Ionicons name="heart-outline" size={64} color={colors.text} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.accessRequired}</Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]}>{t.accessRequiredSub}</Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.btnBg }]}
            onPress={() => router.push('/(tabs)/cuenta' as any)}
          >
            <Text style={[styles.primaryBtnText, { color: colors.btnText }]}>{t.goToAccount}</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.favoritesTitle} ({favoritos.length})
        </Text>
      </View>

      {cargando ? (
        <ProductGridSkeleton count={4} />
      ) : (
        <FlatList
          data={favoritos}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={[styles.centerBox, { marginTop: 80 }]}>
              <Ionicons name="heart-dislike-outline" size={56} color={colors.text} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noFavorites}</Text>
              <Text style={[styles.emptySub, { color: colors.subtext }]}>{t.noFavoritesSub}</Text>
              <Pressable
                style={[styles.primaryBtn, { backgroundColor: colors.btnBg }]}
                onPress={() => router.push('/(tabs)/' as any)}
              >
                <Text style={[styles.primaryBtnText, { color: colors.btnText }]}>
                  {t.exploreCatalog}
                </Text>
              </Pressable>
            </View>
          }
          renderItem={({ item }) => (
            <Pressable
              style={[
                styles.card,
                { width: cardWidth, borderColor: colors.border, backgroundColor: colors.card },
              ]}
              onPress={() => router.push(`/producto/${item.id}` as any)}
            >
              <View
                style={[
                  styles.imageContainer,
                  { backgroundColor: colors.surface, borderBottomColor: colors.border },
                ]}
              >
                {item.imagenes && item.imagenes.length > 0 && (
                  <Image source={{ uri: item.imagenes[0].imagen }} style={styles.image} />
                )}
                <Pressable
                  style={[
                    styles.heartButton,
                    { backgroundColor: colors.card, borderColor: colors.border },
                  ]}
                  onPress={(e) => quitarFavorito(e, item.id)}
                >
                  <Ionicons name="heart" size={20} color={colors.text} />
                </Pressable>
              </View>

              <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                {item.nombre.toUpperCase()}
              </Text>
              <Text style={[styles.productPrice, { color: colors.text }]}>
                ${item.precio} MXN
              </Text>
            </Pressable>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  primaryBtn: { paddingHorizontal: 24, paddingVertical: 16 },
  primaryBtnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
  list: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  card: { marginBottom: 18, borderWidth: 3 },
  imageContainer: {
    width: '100%',
    height: 175,
    borderBottomWidth: 3,
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  heartButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    borderWidth: 2,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: { fontSize: 13, fontWeight: '900', marginTop: 10, paddingHorizontal: 8 },
  productPrice: { fontSize: 13, fontWeight: '800', marginTop: 4, paddingHorizontal: 8, marginBottom: 10 },
});