import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  Image,
  Pressable,
  ScrollView,
  RefreshControl,
  useWindowDimensions,
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { usePreferences } from '../../context/PreferencesContext';
import { ProductGridSkeleton } from '../../components/SkeletonLoader';
import { ConnectionError } from '../../components/ConnectionError';

interface Categoria {
  id: number;
  nombre: string;
}

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  talla?: string;
  imagenes: { id: number; imagen: string }[];
}

export default function BuscarScreen() {
  const { width } = useWindowDimensions();
  const cardWidth = (width - 48) / 2;
  const router = useRouter();
  const { colors, t } = usePreferences();

  const [busqueda, setBusqueda] = useState('');
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [talla, setTalla] = useState<string>('TODAS');
  const [orden, setOrden] = useState<string>('-id');
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [resultados, setResultados] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [errorConexion, setErrorConexion] = useState(false);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [cargandoMas, setCargandoMas] = useState(false);

  const cargarCategorias = useCallback(() => {
    api.get('/categorias/')
      .then((res) => {
        const lista = res.data.results ? res.data.results : res.data;
        setCategorias(lista);
      })
      .catch((err) => console.error('Error al cargar categorías:', err));
  }, []);

  useEffect(() => {
    cargarCategorias();
  }, [cargarCategorias]);

  const buscarProductos = useCallback(
    (esRefresh = false) => {
      if (esRefresh) {
        setRefrescando(true);
      } else {
        setCargando(true);
      }
      setErrorConexion(false);

      const params: Record<string, any> = { ordering: orden };
      if (busqueda.trim()) params.search = busqueda.trim();
      if (categoriaId !== null) params.categoria = categoriaId;
      if (talla !== 'TODAS') params.talla = talla;

      api.get('/productos/', { params })
        .then((res) => {
          const lista = res.data.results ? res.data.results : res.data;
          setResultados(lista);
          setNextPageUrl(res.data.next || null);
        })
        .catch((err) => {
          console.error('Error al buscar productos:', err);
          setErrorConexion(true);
        })
        .finally(() => {
          setCargando(false);
          setRefrescando(false);
        });
    },
    [busqueda, categoriaId, talla, orden]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      buscarProductos(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [buscarProductos]);

  const cargarMasResultados = () => {
    if (!nextPageUrl || cargandoMas) return;
    setCargandoMas(true);
    api.get(nextPageUrl)
      .then((res) => {
        const nuevos = res.data.results ? res.data.results : res.data;
        setResultados((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...nuevos.filter((p: Producto) => !ids.has(p.id))];
        });
        setNextPageUrl(res.data.next || null);
      })
      .catch((err) => console.error('Error al cargar más resultados:', err))
      .finally(() => setCargandoMas(false));
  };

  const limpiarFiltros = () => {
    setBusqueda('');
    setCategoriaId(null);
    setTalla('TODAS');
    setOrden('-id');
  };

  const filtrosActivosCount =
    (categoriaId !== null ? 1 : 0) +
    (talla !== 'TODAS' ? 1 : 0) +
    (orden !== '-id' ? 1 : 0);

  const hayFiltrosActivos = busqueda.trim() !== '' || filtrosActivosCount > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.exploreTitle}</Text>
        {hayFiltrosActivos && (
          <Pressable onPress={limpiarFiltros}>
            <Text style={[styles.resetText, { color: colors.text }]}>{t.clear}</Text>
          </Pressable>
        )}
      </View>

      <View
        style={[
          styles.searchSection,
          { borderBottomColor: colors.border, backgroundColor: colors.bg },
        ]}
      >
        <View style={styles.searchRow}>
          <View style={[styles.searchBox, { borderColor: colors.border }]}>
            <Ionicons name="search-sharp" size={20} color={colors.text} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t.searchPlaceholder}
              placeholderTextColor={colors.subtext}
              value={busqueda}
              onChangeText={setBusqueda}
              autoCapitalize="none"
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => setBusqueda('')}>
                <Ionicons name="close-sharp" size={20} color={colors.text} />
              </Pressable>
            )}
          </View>

          <Pressable
            onPress={() => setMostrarFiltros((prev) => !prev)}
            style={[
              styles.filterToggleBtn,
              {
                borderColor: colors.border,
                backgroundColor: mostrarFiltros ? colors.btnBg : colors.card,
              },
            ]}
          >
            <Ionicons
              name="options-sharp"
              size={22}
              color={mostrarFiltros ? colors.btnText : colors.text}
            />
            {!mostrarFiltros && filtrosActivosCount > 0 && (
              <View style={[styles.filterBadge, { backgroundColor: colors.btnBg }]}>
                <Text style={[styles.filterBadgeText, { color: colors.btnText }]}>
                  {filtrosActivosCount}
                </Text>
              </View>
            )}
          </Pressable>
        </View>

        {mostrarFiltros && (
          <View style={styles.filtersDrawer}>
            {categorias.length > 0 && (
              <View style={styles.filterGroup}>
                <Text style={[styles.filterLabel, { color: colors.text }]}>{t.categoryLabel}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <Pressable
                    style={[
                      styles.chip,
                      {
                        borderColor: colors.border,
                        backgroundColor: categoriaId === null ? colors.btnBg : colors.card,
                      },
                    ]}
                    onPress={() => setCategoriaId(null)}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: categoriaId === null ? colors.btnText : colors.text },
                      ]}
                    >
                      {t.allFem}
                    </Text>
                  </Pressable>

                  {categorias.map((cat) => {
                    const activa = categoriaId === cat.id;
                    return (
                      <Pressable
                        key={cat.id}
                        style={[
                          styles.chip,
                          {
                            borderColor: colors.border,
                            backgroundColor: activa ? colors.btnBg : colors.card,
                          },
                        ]}
                        onPress={() => setCategoriaId(cat.id)}
                      >
                        <Text
                          style={[
                            styles.chipText,
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

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t.sizeLabel}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {['TODAS', 'S', 'M', 'L', 'XL', 'U'].map((sz) => {
                  const activa = talla === sz;
                  return (
                    <Pressable
                      key={sz}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor: activa ? colors.btnBg : colors.card,
                        },
                      ]}
                      onPress={() => setTalla(sz)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: activa ? colors.btnText : colors.text },
                        ]}
                      >
                        {sz === 'TODAS' ? t.allSizes : sz}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>

            <View style={styles.filterGroup}>
              <Text style={[styles.filterLabel, { color: colors.text }]}>{t.sortLabel}</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {[
                  { label: t.sortRecent, val: '-id' },
                  { label: t.sortLowPrice, val: 'precio' },
                  { label: t.sortHighPrice, val: '-precio' },
                ].map((opt) => {
                  const activo = orden === opt.val;
                  return (
                    <Pressable
                      key={opt.val}
                      style={[
                        styles.chip,
                        {
                          borderColor: colors.border,
                          backgroundColor: activo ? colors.btnBg : colors.card,
                        },
                      ]}
                      onPress={() => setOrden(opt.val)}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          { color: activo ? colors.btnText : colors.text },
                        ]}
                      >
                        {opt.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        )}
      </View>

      {cargando ? (
        <ProductGridSkeleton count={4} />
      ) : errorConexion ? (
        <ConnectionError
          onRetry={() => {
            cargarCategorias();
            buscarProductos(false);
          }}
        />
      ) : (
        <FlatList
          data={resultados}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          refreshControl={
            <RefreshControl
              refreshing={refrescando}
              onRefresh={() => buscarProductos(true)}
              tintColor={colors.text}
              colors={[colors.text]}
            />
          }
          ListHeaderComponent={
            <Text style={[styles.resultsCount, { color: colors.subtext }]}>
              {t.resultsFound} {resultados.length}
            </Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Ionicons name="alert-circle-outline" size={48} color={colors.text} />
              <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.noMatches}</Text>
              <Text style={[styles.emptySub, { color: colors.subtext }]}>{t.noMatchesSub}</Text>
            </View>
          }
          ListFooterComponent={
            nextPageUrl ? (
              <Pressable
                style={[
                  styles.loadMoreBtn,
                  { borderColor: colors.border, backgroundColor: colors.card },
                  cargandoMas && { opacity: 0.6 },
                ]}
                onPress={cargarMasResultados}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  resetText: { fontSize: 12, fontWeight: '900', textDecorationLine: 'underline' },
  searchSection: { padding: 16, borderBottomWidth: 4 },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    paddingHorizontal: 12,
    height: 48,
  },
  searchInput: { flex: 1, marginLeft: 10, fontSize: 15, fontWeight: '700' },
  filterToggleBtn: {
    width: 48,
    height: 48,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterBadge: {
    position: 'absolute',
    top: -6,
    right: -6,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: '900',
  },
  filtersDrawer: {
    marginTop: 6,
  },
  filterGroup: { marginTop: 10 },
  filterLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  chip: { borderWidth: 2, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8 },
  chipText: { fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },
  list: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  resultsCount: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 12 },
  emptyBox: { alignItems: 'center', marginTop: 48, paddingHorizontal: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '900', marginTop: 12 },
  emptySub: { fontSize: 13, textAlign: 'center', marginTop: 6 },
  card: { marginBottom: 18, borderWidth: 3 },
  imageContainer: {
    width: '100%',
    height: 170,
    borderBottomWidth: 3,
    position: 'relative',
  },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  productName: { fontSize: 13, fontWeight: '900', marginTop: 10, paddingHorizontal: 8 },
  productPrice: { fontSize: 13, fontWeight: '800', marginTop: 4, paddingHorizontal: 8, marginBottom: 10 },
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