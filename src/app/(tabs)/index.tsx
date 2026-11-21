import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePreferences } from '../../context/PreferencesContext';
import { HomeScreenSkeleton } from '../../components/SkeletonLoader';
import { ConnectionError } from '../../components/ConnectionError';

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  imagenes: { id: number; imagen: string }[];
  categoria?: { id: number; nombre: string };
}

export default function HomeScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;
  const heroCardWidth = Math.min(width * 0.68, 285);

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorConexion, setErrorConexion] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);
  const [categoriaActiva, setCategoriaActiva] = useState<number | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  const router = useRouter();
  const { totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorito, toggleFavorito } = useFavorites();
  const { colors, t } = usePreferences();

  const cargarDatos = useCallback((esRefresh = false) => {
    if (esRefresh) {
      setRefrescando(true);
    }
    setErrorConexion(false);

    Promise.all([api.get('/productos/'), api.get('/categorias/')])
      .then(([resProd, resCat]) => {
        const listaProd = resProd.data.results ? resProd.data.results : resProd.data;
        const listaCat = resCat.data.results ? resCat.data.results : resCat.data;
        setProductos(listaProd);
        setNextPageUrl(resProd.data.next || null);
        setCategorias(listaCat);
        setCargando(false);
        setRefrescando(false);
      })
      .catch((error) => {
        console.error('Error al cargar inicio:', error);
        setErrorConexion(true);
        setCargando(false);
        setRefrescando(false);
      });
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos, isAuthenticated])
  );

  const cargarMasProductos = () => {
    if (!nextPageUrl || cargandoMas) return;
    setCargandoMas(true);
    api.get(nextPageUrl)
      .then((res) => {
        const nuevos = res.data.results ? res.data.results : res.data;
        setProductos((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...nuevos.filter((p: Producto) => !ids.has(p.id))];
        });
        setNextPageUrl(res.data.next || null);
      })
      .catch((err) => console.error('Error al cargar más:', err))
      .finally(() => setCargandoMas(false));
  };

  const handleToggleFavorito = async (e: any, productoId: number) => {
    e.stopPropagation();

    if (!isAuthenticated) {
      setAviso(t.loginForFavorites);
      setTimeout(() => setAviso(null), 2500);
      return;
    }

    try {
      await toggleFavorito(productoId);
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  };

  const recienAgregados = productos.slice(0, 4);

  const productosFiltrados =
    categoriaActiva === null
      ? productos
      : productos.filter((p) => p.categoria?.id === categoriaActiva);

  const nombreCategoriaActiva =
    categoriaActiva === null
      ? t.allProducts
      : categorias.find((c) => c.id === categoriaActiva)?.nombre.toUpperCase() || t.allProducts;

  const renderHeaderCatalogo = () => (
    <View style={styles.feedHeader}>
      {categoriaActiva === null && recienAgregados.length > 0 && (
        <View style={[styles.featuredSection, { borderBottomColor: colors.border }]}>
          <View style={styles.sectionTitleRow}>
            <View style={styles.titleWithBadge}>
              <View style={[styles.newPill, { backgroundColor: colors.btnBg }]}>
                <Text style={[styles.newPillText, { color: colors.btnText }]}>{t.newPill}</Text>
              </View>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.recentlyAdded}</Text>
            </View>
            <Text style={[styles.sectionHint, { color: colors.subtext }]}>
              {t.latestCount} {recienAgregados.length}
            </Text>
          </View>

          <FlatList
            data={recienAgregados}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => `hero-${item.id}`}
            contentContainerStyle={styles.heroList}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.heroCard,
                  {
                    width: heroCardWidth,
                    borderColor: colors.border,
                    backgroundColor: colors.card,
                  },
                ]}
                onPress={() => router.push(`/producto/${item.id}` as any)}
              >
                <View
                  style={[
                    styles.heroImageContainer,
                    { backgroundColor: colors.surface, borderBottomColor: colors.border },
                  ]}
                >
                  {item.imagenes && item.imagenes.length > 0 && (
                    <Image source={{ uri: item.imagenes[0].imagen }} style={styles.heroImage} />
                  )}

                  <View style={[styles.dropTag, { backgroundColor: colors.btnBg }]}>
                    <Text style={[styles.dropTagText, { color: colors.btnText }]}>
                      {t.newArrivalTag}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.heartButtonHero,
                      { backgroundColor: colors.card, borderColor: colors.border },
                    ]}
                    onPress={(e) => handleToggleFavorito(e, item.id)}
                  >
                    <Ionicons
                      name={isFavorito(item.id) ? 'heart' : 'heart-outline'}
                      size={20}
                      color={colors.text}
                    />
                  </Pressable>
                </View>

                <View style={styles.heroInfo}>
                  {item.categoria?.nombre && (
                    <Text style={[styles.heroCategory, { color: colors.subtext }]}>
                      {item.categoria.nombre.toUpperCase()}
                    </Text>
                  )}
                  <Text style={[styles.heroName, { color: colors.text }]} numberOfLines={1}>
                    {item.nombre.toUpperCase()}
                  </Text>
                  <View style={styles.heroBottomRow}>
                    <Text style={[styles.heroPrice, { color: colors.text }]}>
                      ${item.precio} MXN
                    </Text>
                    <Ionicons name="arrow-forward-sharp" size={18} color={colors.text} />
                  </View>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}

      <View style={styles.allProductsHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{nombreCategoriaActiva}</Text>
        <Text style={[styles.countBadge, { color: colors.text, borderColor: colors.border }]}>
          {productosFiltrados.length} {t.pcs}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.bg, borderBottomColor: colors.border },
        ]}
      >
        <Text style={[styles.logo, { color: colors.text }]}>GRID27</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => router.push('/(tabs)/buscar' as any)} style={{ marginRight: 16 }}>
            <Ionicons name="search-sharp" size={24} color={colors.text} />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/carrito' as any)} style={styles.cartIconBox}>
            <Ionicons name="cart-outline" size={25} color={colors.text} />
            {totalItems > 0 && (
              <View style={[styles.badge, { backgroundColor: colors.btnBg }]}>
                <Text style={[styles.badgeText, { color: colors.btnText }]}>{totalItems}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {aviso && (
        <Pressable
          style={[styles.toastBox, { backgroundColor: colors.btnBg }]}
          onPress={() => router.push('/(tabs)/cuenta' as any)}
        >
          <Text style={[styles.toastText, { color: colors.btnText }]}>{aviso}</Text>
        </Pressable>
      )}

      {!errorConexion && (
        <View
          style={[
            styles.categoriesWrapper,
            { borderBottomColor: colors.border, backgroundColor: colors.bg },
          ]}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesContainer}
          >
            <Pressable
              onPress={() => setCategoriaActiva(null)}
              style={[
                styles.catChip,
                {
                  borderColor: colors.border,
                  backgroundColor: categoriaActiva === null ? colors.btnBg : colors.card,
                },
              ]}
            >
              <Text
                style={[
                  styles.catChipText,
                  { color: categoriaActiva === null ? colors.btnText : colors.text },
                ]}
              >
                {t.all}
              </Text>
            </Pressable>

            {categorias.map((cat) => {
              const activa = categoriaActiva === cat.id;
              return (
                <Pressable
                  key={cat.id}
                  onPress={() => setCategoriaActiva(cat.id)}
                  style={[
                    styles.catChip,
                    {
                      borderColor: colors.border,
                      backgroundColor: activa ? colors.btnBg : colors.card,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.catChipText,
                      { color: activa ? colors.btnText : colors.text },
                    ]}
                  >
                    {cat.nombre.toUpperCase()}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}

      {cargando ? (
        <HomeScreenSkeleton />
      ) : errorConexion ? (
        <ConnectionError
          onRetry={() => {
            setCargando(true);
            cargarDatos();
          }}
        />
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          ListHeaderComponent={renderHeaderCatalogo}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => cargarDatos(true)}
              tintColor={colors.text}
              colors={[colors.text]}
            />
          }
          ListEmptyComponent={
            <Text style={[styles.emptyText, { color: colors.subtext }]}>{t.emptyCategory}</Text>
          }
          ListFooterComponent={
            nextPageUrl ? (
              <Pressable
                style={[
                  styles.loadMoreBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  cargandoMas && { opacity: 0.6 },
                ]}
                onPress={cargarMasProductos}
                disabled={cargandoMas}
              >
                <Text style={[styles.loadMoreText, { color: colors.text }]}>
                  {cargandoMas ? t.loadingMore : t.loadMore}
                </Text>
              </Pressable>
            ) : null
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
                  onPress={(e) => handleToggleFavorito(e, item.id)}
                >
                  <Ionicons
                    name={isFavorito(item.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color={colors.text}
                  />
                </Pressable>
              </View>

              <View style={styles.cardInfo}>
                <Text style={[styles.productName, { color: colors.text }]} numberOfLines={1}>
                  {item.nombre.toUpperCase()}
                </Text>
                <Text style={[styles.productPrice, { color: colors.text }]}>
                  ${item.precio} MXN
                </Text>
              </View>
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 4,
  },
  logo: { fontSize: 26, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  cartIconBox: { position: 'relative' },
  badge: {
    position: 'absolute',
    top: -6,
    right: -8,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 10, fontWeight: '900' },
  toastBox: { paddingVertical: 10, paddingHorizontal: 16 },
  toastText: { fontSize: 11, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },
  categoriesWrapper: { borderBottomWidth: 3 },
  categoriesContainer: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  catChip: { borderWidth: 2, paddingHorizontal: 14, paddingVertical: 6 },
  catChipText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.8 },
  feedHeader: { marginBottom: 14 },
  featuredSection: {
    paddingTop: 18,
    paddingBottom: 22,
    borderBottomWidth: 4,
    marginBottom: 18,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  titleWithBadge: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  newPill: { paddingHorizontal: 7, paddingVertical: 3 },
  newPillText: { fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  sectionTitle: { fontSize: 18, fontWeight: '900', letterSpacing: -0.3 },
  sectionHint: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  heroList: { paddingRight: 8, gap: 14 },
  heroCard: { borderWidth: 3, borderBottomWidth: 6, borderRightWidth: 6 },
  heroImageContainer: {
    width: '100%',
    height: 245,
    borderBottomWidth: 3,
    position: 'relative',
  },
  heroImage: { width: '100%', height: '100%', resizeMode: 'contain' },
  dropTag: {
    position: 'absolute',
    top: 10,
    left: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dropTagText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  heartButtonHero: {
    position: 'absolute',
    top: 10,
    right: 10,
    borderWidth: 2,
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroInfo: { padding: 12 },
  heroCategory: { fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 2 },
  heroName: { fontSize: 16, fontWeight: '900', letterSpacing: -0.3 },
  heroBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  heroPrice: { fontSize: 15, fontWeight: '900' },
  allProductsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countBadge: {
    fontSize: 11,
    fontWeight: '900',
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  list: { paddingHorizontal: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  emptyText: { textAlign: 'center', marginTop: 40, fontWeight: '700' },
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
  cardInfo: { paddingHorizontal: 8, paddingVertical: 10 },
  productName: { fontSize: 13, fontWeight: '900' },
  productPrice: { fontSize: 13, fontWeight: '800', marginTop: 4 },
  loadMoreBtn: {
    borderWidth: 3,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});