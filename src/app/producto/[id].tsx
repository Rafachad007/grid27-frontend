import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Modal,
  useWindowDimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePreferences } from '../../context/PreferencesContext';
import { ProductDetailSkeleton } from '../../components/SkeletonLoader';

interface Variante {
  id: number;
  talla: string;
  stock: number;
}

interface ImagenItem {
  id: number;
  imagen: string;
}

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { width } = useWindowDimensions();
  const galleryRef = useRef<ScrollView>(null);

  const { items, addToCart, totalItems } = useCart();
  const { isAuthenticated } = useAuth();
  const { isFavorito, toggleFavorito } = useFavorites();
  const { colors, t } = usePreferences();

  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>('');
  const [agregado, setAgregado] = useState(false);
  const [imagenActiva, setImagenActiva] = useState(0);
  const [avisoFavorito, setAvisoFavorito] = useState(false);
  const [guiaVisible, setGuiaVisible] = useState(false);

  const cargarProducto = useCallback(() => {
    api.get(`/productos/${id}/`)
      .then((response) => {
        setProducto(response.data);
        setImagenActiva(0);
        const vars: Variante[] = response.data.variantes || [];
        if (vars.length > 0) {
          const disponible = vars.find((v) => v.stock > 0);
          setTallaSeleccionada((prev) =>
            vars.some((v) => v.talla === prev) ? prev : disponible ? disponible.talla : vars[0].talla
          );
        }
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar detalle:', error);
        setCargando(false);
      });
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      cargarProducto();
    }, [cargarProducto])
  );

  const handleScrollGaleria = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offsetX = e.nativeEvent.contentOffset.x;
    const indice = Math.round(offsetX / width);
    if (indice !== imagenActiva && indice >= 0) {
      setImagenActiva(indice);
    }
  };

  const irAImagen = (indice: number) => {
    setImagenActiva(indice);
    galleryRef.current?.scrollTo({ x: indice * width, animated: true });
  };

  const handleToggleFavorito = async () => {
    if (!producto) return;

    if (!isAuthenticated) {
      setAvisoFavorito(true);
      setTimeout(() => setAvisoFavorito(false), 2500);
      return;
    }

    try {
      await toggleFavorito(producto.id);
    } catch (error) {
      console.error('Error al cambiar favorito:', error);
    }
  };

  if (cargando) {
    return <ProductDetailSkeleton />;
  }

  if (!producto) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>{t.notFound}</Text>
      </View>
    );
  }

  const imagenes: ImagenItem[] = producto.imagenes || [];
  const variantes: Variante[] = producto.variantes || [];
  const varianteActiva = variantes.find((v) => v.talla === tallaSeleccionada);
  const stockDisponible = varianteActiva ? varianteActiva.stock : 0;

  const enCarritoActual =
    items.find((i) => i.id === producto.id && i.talla === tallaSeleccionada)?.cantidad || 0;

  const agotado = stockDisponible <= 0;
  const limiteAlcanzado = !agotado && enCarritoActual >= stockDisponible;
  const botonDeshabilitado = variantes.length === 0 || agotado || limiteAlcanzado;
  const esFav = isFavorito(producto.id);

  const handleAgregarAlCarrito = () => {
    if (botonDeshabilitado) return;

    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      talla: tallaSeleccionada,
      imagen: imagenes[0]?.imagen,
      stockMax: stockDisponible,
    });

    setAgregado(true);
    setTimeout(() => setAgregado(false), 1400);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg }]}>
      <View
        style={[
          styles.header,
          { borderBottomColor: colors.border, backgroundColor: colors.bg },
        ]}
      >
        <Pressable
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: colors.btnBg }]}
        >
          <Text style={[styles.backBtnText, { color: colors.btnText }]}>{t.backBtn}</Text>
        </Pressable>

        <Pressable
          onPress={() => router.push('/(tabs)/carrito' as any)}
          style={[styles.cartBtn, { borderColor: colors.border }]}
        >
          <Ionicons name="cart-outline" size={22} color={colors.text} />
          {totalItems > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.btnBg }]}>
              <Text style={[styles.badgeText, { color: colors.btnText }]}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {avisoFavorito && (
        <Pressable
          style={[styles.toastBox, { backgroundColor: colors.btnBg }]}
          onPress={() => router.push('/(tabs)/cuenta' as any)}
        >
          <Text style={[styles.toastText, { color: colors.btnText }]}>{t.loginForFavorites}</Text>
        </Pressable>
      )}

      <View
        style={[
          styles.imageContainer,
          { borderBottomColor: colors.border, backgroundColor: colors.surface },
        ]}
      >
        {imagenes.length > 0 ? (
          <ScrollView
            ref={galleryRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={handleScrollGaleria}
            scrollEventThrottle={16}
          >
            {imagenes.map((img) => (
              <View key={img.id} style={{ width, height: 400 }}>
                <Image source={{ uri: img.imagen }} style={styles.image} />
              </View>
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.emptyImgBox, { width }]}>
            <Ionicons name="shirt-outline" size={64} color={colors.subtext} />
          </View>
        )}

        <Pressable
          onPress={handleToggleFavorito}
          style={[
            styles.favFloatingBtn,
            { backgroundColor: colors.card, borderColor: colors.border },
          ]}
        >
          <Ionicons
            name={esFav ? 'heart' : 'heart-outline'}
            size={22}
            color={colors.text}
          />
        </Pressable>

        {imagenes.length > 1 && (
          <>
            <View style={[styles.pageCounter, { backgroundColor: colors.btnBg }]}>
              <Text style={[styles.pageCounterText, { color: colors.btnText }]}>
                {imagenActiva + 1} / {imagenes.length}
              </Text>
            </View>

            <View style={styles.dotsRow}>
              {imagenes.map((img, idx) => {
                const activo = idx === imagenActiva;
                return (
                  <Pressable
                    key={img.id}
                    onPress={() => irAImagen(idx)}
                    style={[
                      styles.dotBar,
                      {
                        borderColor: colors.border,
                        backgroundColor: activo ? colors.btnBg : colors.card,
                        width: activo ? 28 : 14,
                      },
                    ]}
                  />
                );
              })}
            </View>
          </>
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={[styles.title, { color: colors.text }]}>{producto.nombre.toUpperCase()}</Text>
        <Text style={[styles.price, { color: colors.text }]}>${producto.precio} MXN</Text>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        <View style={styles.sizeHeaderRow}>
          <Text style={[styles.sectionTitle, { color: colors.text, marginBottom: 0 }]}>
            {t.selectSize}
          </Text>
          {variantes.length > 0 && (
            <View
              style={[
                styles.stockPill,
                {
                  borderColor: colors.border,
                  backgroundColor: agotado ? colors.surface : colors.btnBg,
                },
              ]}
            >
              <Text
                style={[
                  styles.stockPillText,
                  { color: agotado ? colors.subtext : colors.btnText },
                ]}
              >
                {agotado ? t.soldOut : `${stockDisponible} ${t.availableStock}`}
              </Text>
            </View>
          )}
        </View>

        {variantes.length === 0 ? (
          <Text style={[styles.noSizesText, { color: colors.subtext }]}>
            {t.noSizesConfigured}
          </Text>
        ) : (
          <View style={styles.sizesRow}>
            {variantes.map((v) => {
              const activa = tallaSeleccionada === v.talla;
              const sinStock = v.stock <= 0;
              return (
                <Pressable
                  key={v.talla}
                  onPress={() => setTallaSeleccionada(v.talla)}
                  style={[
                    styles.sizeBox,
                    {
                      borderColor: colors.border,
                      backgroundColor: activa ? colors.btnBg : colors.card,
                      opacity: sinStock && !activa ? 0.45 : 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.sizeText,
                      {
                        color: activa ? colors.btnText : colors.text,
                        textDecorationLine: sinStock ? 'line-through' : 'none',
                      },
                    ]}
                  >
                    {v.talla}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        )}

        <Pressable
          onPress={() => setGuiaVisible(true)}
          style={[styles.sizeGuideTrigger, { borderColor: colors.border }]}
        >
          <Ionicons name="resize-outline" size={16} color={colors.text} />
          <Text style={[styles.sizeGuideTriggerText, { color: colors.text }]}>
            {t.sizeGuideBtn}
          </Text>
        </Pressable>

        <Text style={[styles.sectionTitle, { color: colors.text }]}>{t.detailsLabel}</Text>
        <Text style={[styles.desc, { color: colors.text }]}>{producto.descripcion}</Text>

        <Pressable
          onPress={handleAgregarAlCarrito}
          disabled={botonDeshabilitado}
          style={[
            styles.buyButton,
            { backgroundColor: colors.btnBg },
            botonDeshabilitado && { opacity: 0.4 },
          ]}
        >
          <Text style={[styles.buyButtonText, { color: colors.btnText }]}>
            {agotado
              ? t.soldOut
              : limiteAlcanzado
              ? t.maxInCart
              : agregado
              ? t.addedToCart
              : t.addToCart}
          </Text>
        </Pressable>
      </View>

      <Modal
        visible={guiaVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setGuiaVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalCard,
              { borderColor: colors.border, backgroundColor: colors.card },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t.sizeGuideTitle}</Text>
              <Pressable onPress={() => setGuiaVisible(false)}>
                <Ionicons name="close-sharp" size={24} color={colors.text} />
              </Pressable>
            </View>

            <Text style={[styles.modalSub, { color: colors.subtext }]}>{t.sizeGuideSubtitle}</Text>

            <View style={[styles.tableBox, { borderColor: colors.border }]}>
              <View style={[styles.tableRowHeader, { backgroundColor: colors.btnBg }]}>
                <Text style={[styles.tableHeadCell, { color: colors.btnText }]}>{t.colSize}</Text>
                <Text style={[styles.tableHeadCell, { color: colors.btnText }]}>{t.colChest}</Text>
                <Text style={[styles.tableHeadCell, { color: colors.btnText }]}>{t.colLength}</Text>
                <Text style={[styles.tableHeadCell, { color: colors.btnText }]}>{t.colShoulder}</Text>
              </View>

              {[
                { talla: 'S', pecho: '56 cm', largo: '68 cm', hombro: '54 cm' },
                { talla: 'M', pecho: '59 cm', largo: '71 cm', hombro: '57 cm' },
                { talla: 'L', pecho: '62 cm', largo: '74 cm', hombro: '60 cm' },
                { talla: 'XL', pecho: '65 cm', largo: '77 cm', hombro: '63 cm' },
              ].map((fila) => (
                <View
                  key={fila.talla}
                  style={[styles.tableRow, { borderTopColor: colors.border }]}
                >
                  <Text style={[styles.tableCellBold, { color: colors.text }]}>{fila.talla}</Text>
                  <Text style={[styles.tableCell, { color: colors.text }]}>{fila.pecho}</Text>
                  <Text style={[styles.tableCell, { color: colors.text }]}>{fila.largo}</Text>
                  <Text style={[styles.tableCell, { color: colors.text }]}>{fila.hombro}</Text>
                </View>
              ))}
            </View>

            <Pressable
              style={[styles.modalCloseBtn, { backgroundColor: colors.btnBg }]}
              onPress={() => setGuiaVisible(false)}
            >
              <Text style={[styles.modalCloseBtnText, { color: colors.btnText }]}>
                {t.closeModalBtn}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontWeight: '900', fontSize: 20 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    borderBottomWidth: 4,
  },
  backBtn: { paddingHorizontal: 15, paddingVertical: 10 },
  backBtnText: { fontWeight: '900', letterSpacing: 1 },
  cartBtn: { position: 'relative', padding: 8, borderWidth: 2 },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { fontSize: 11, fontWeight: '900' },

  toastBox: { paddingVertical: 10, paddingHorizontal: 16 },
  toastText: { fontSize: 11, fontWeight: '900', letterSpacing: 1, textAlign: 'center' },

  imageContainer: { borderBottomWidth: 4, position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  emptyImgBox: { height: 400, justifyContent: 'center', alignItems: 'center' },

  favFloatingBtn: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 42,
    height: 42,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pageCounter: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pageCounterText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },
  dotsRow: {
    position: 'absolute',
    bottom: 16,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dotBar: {
    height: 8,
    borderWidth: 1.5,
  },

  infoBox: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1 },
  price: { fontSize: 22, fontWeight: '900', marginTop: 5 },
  divider: { height: 4, marginVertical: 20 },

  sizeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stockPill: {
    borderWidth: 2,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  noSizesText: {
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10, letterSpacing: 1 },
  sizesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  sizeBox: {
    width: 52,
    height: 52,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sizeText: { fontSize: 16, fontWeight: '900' },

  sizeGuideTrigger: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    marginBottom: 22,
  },
  sizeGuideTriggerText: {
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 1,
  },

  desc: { fontSize: 15, lineHeight: 22, fontWeight: '500' },
  buyButton: {
    padding: 20,
    marginTop: 32,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: '#555',
  },
  buyButtonText: { fontSize: 15, fontWeight: '900', letterSpacing: 2 },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    borderWidth: 4,
    borderBottomWidth: 8,
    borderRightWidth: 8,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  modalSub: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
    marginBottom: 16,
  },
  tableBox: {
    borderWidth: 3,
    marginBottom: 18,
  },
  tableRowHeader: {
    flexDirection: 'row',
    paddingVertical: 10,
  },
  tableHeadCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 11,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  tableRow: {
    flexDirection: 'row',
    borderTopWidth: 2,
    paddingVertical: 10,
  },
  tableCellBold: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '900',
  },
  tableCell: {
    flex: 1,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '700',
  },
  modalCloseBtn: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1.5,
  },
});