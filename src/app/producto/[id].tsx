import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { addToCart, totalItems } = useCart();

  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [tallaSeleccionada, setTallaSeleccionada] = useState<string>('M');
  const [agregado, setAgregado] = useState(false);

  useEffect(() => {
    api.get(`/productos/${id}/`)
      .then((response) => {
        setProducto(response.data);
        if (response.data.talla) {
          setTallaSeleccionada(response.data.talla);
        }
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar detalle:', error);
        setCargando(false);
      });
  }, [id]);

  const handleAgregarAlCarrito = () => {
    if (!producto) return;

    addToCart({
      id: producto.id,
      nombre: producto.nombre,
      precio: parseFloat(producto.precio),
      talla: tallaSeleccionada,
      imagen: producto.imagenes?.[0]?.imagen,
    });

    setAgregado(true);
    setTimeout(() => setAgregado(false), 1500);
  };

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>404 - PRODUCTO NO ENCONTRADO</Text>
      </View>
    );
  }

  const tallas = producto.talla === 'U' ? ['U'] : ['S', 'M', 'L', 'XL'];

  return (
    <ScrollView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{'< VOLVER'}</Text>
        </Pressable>

        <Pressable onPress={() => router.push('/(tabs)/carrito' as any)} style={styles.cartBtn}>
          <Ionicons name="cart-outline" size={22} color="#000" />
          {totalItems > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{totalItems}</Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* IMAGEN */}
      <View style={styles.imageContainer}>
        {producto.imagenes && producto.imagenes.length > 0 && (
          <Image source={{ uri: producto.imagenes[0].imagen }} style={styles.image} />
        )}
      </View>

      {/* INFORMACIÓN */}
      <View style={styles.infoBox}>
        <Text style={styles.title}>{producto.nombre.toUpperCase()}</Text>
        <Text style={styles.price}>${producto.precio} MXN</Text>

        <View style={styles.divider} />

        {/* SELECTOR DE TALLA */}
        <Text style={styles.sectionTitle}>SELECCIONA TALLA:</Text>
        <View style={styles.sizesRow}>
          {tallas.map((t) => {
            const activa = tallaSeleccionada === t;
            return (
              <Pressable
                key={t}
                onPress={() => setTallaSeleccionada(t)}
                style={[styles.sizeBox, activa && styles.sizeBoxActive]}
              >
                <Text style={[styles.sizeText, activa && styles.sizeTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>DETALLES:</Text>
        <Text style={styles.desc}>{producto.descripcion}</Text>

        {/* BOTÓN AÑADIR AL CARRITO */}
        <Pressable
          onPress={handleAgregarAlCarrito}
          style={[styles.buyButton, agregado && styles.buyButtonAdded]}
        >
          <Text style={styles.buyButtonText}>
            {agregado ? '✓ AÑADIDO AL CARRITO' : 'AÑADIR AL CARRITO'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { fontWeight: '900', fontSize: 20, color: '#000' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    paddingTop: 40,
    borderBottomWidth: 4,
    borderBottomColor: '#000',
    backgroundColor: '#fff',
  },
  backBtn: { backgroundColor: '#000', paddingHorizontal: 15, paddingVertical: 10 },
  backBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  cartBtn: { position: 'relative', padding: 8, borderWidth: 2, borderColor: '#000' },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#000',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: { color: '#fff', fontSize: 11, fontWeight: '900' },

  imageContainer: { borderBottomWidth: 4, borderBottomColor: '#000', backgroundColor: '#f4f4f4' },
  image: { width: '100%', height: 400, resizeMode: 'contain' },

  infoBox: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 32, fontWeight: '900', letterSpacing: -1, color: '#000' },
  price: { fontSize: 22, fontWeight: '900', color: '#000', marginTop: 5 },
  divider: { height: 4, backgroundColor: '#000', marginVertical: 20 },

  sectionTitle: { fontSize: 14, fontWeight: '900', marginBottom: 10, color: '#000', letterSpacing: 1 },
  sizesRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  sizeBox: {
    width: 48,
    height: 48,
    borderWidth: 3,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  sizeBoxActive: { backgroundColor: '#000' },
  sizeText: { fontSize: 16, fontWeight: '900', color: '#000' },
  sizeTextActive: { color: '#fff' },

  desc: { fontSize: 15, lineHeight: 22, color: '#000', fontWeight: '500' },

  buyButton: {
    backgroundColor: '#000',
    padding: 20,
    marginTop: 32,
    alignItems: 'center',
    borderBottomWidth: 6,
    borderRightWidth: 6,
    borderColor: '#555',
  },
  buyButtonAdded: { backgroundColor: '#222', borderColor: '#000' },
  buyButtonText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});