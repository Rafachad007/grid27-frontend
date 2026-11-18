import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';

const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / numColumns;

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  imagenes: { id: number; imagen: string }[];
  categoria?: { id: number; nombre: string };
}

export default function HomeScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const [categoriaActiva, setCategoriaActiva] = useState('Todo');
  const router = useRouter();
  const { totalItems } = useCart();

  useEffect(() => {
    api.get('/productos/')
      .then((response) => {
        // Soporta tanto respuesta paginada (.results) como lista directa
        const lista = response.data.results ? response.data.results : response.data;
        setProductos(lista);
        setCargando(false);
      })
      .catch((error) => {
        console.error('Error al cargar productos:', error);
        setCargando(false);
      });
  }, []);

  const productosFiltrados =
    categoriaActiva === 'Todo'
      ? productos
      : productos.filter(
          (p) => p.categoria?.nombre?.toLowerCase() === categoriaActiva.toLowerCase()
        );

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.logo}>GRID27</Text>
        <View style={styles.headerIcons}>
          <Pressable onPress={() => router.push('/(tabs)/buscar' as any)} style={{ marginRight: 16 }}>
            <Ionicons name="search-outline" size={24} color="black" />
          </Pressable>
          <Pressable onPress={() => router.push('/(tabs)/carrito' as any)} style={styles.cartIconBox}>
            <Ionicons name="cart-outline" size={24} color="black" />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems}</Text>
              </View>
            )}
          </Pressable>
        </View>
      </View>

      {/* PESTAÑAS DE CATEGORÍAS */}
      <View style={styles.categoriesContainer}>
        {['Todo', 'Playeras', 'Hoodies', 'Pantalones'].map((cat) => (
          <Pressable key={cat} onPress={() => setCategoriaActiva(cat)}>
            <Text style={[styles.categoryText, categoriaActiva === cat && styles.categoryActive]}>
              {cat}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* GRID DE PRODUCTOS (2 COLUMNAS) */}
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns}
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay prendas en esta categoría.</Text>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/producto/${item.id}` as any)}
          >
            <View style={styles.imageContainer}>
              {item.imagenes && item.imagenes.length > 0 && (
                <Image source={{ uri: item.imagenes[0].imagen }} style={styles.image} />
              )}
              <Pressable style={styles.heartButton}>
                <Ionicons name="heart-outline" size={20} color="black" />
              </Pressable>
            </View>

            <Text style={styles.productName} numberOfLines={1}>{item.nombre}</Text>
            <Text style={styles.productPrice}>${item.precio} MXN</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9f9f9', paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 15, backgroundColor: '#fff' },
  logo: { fontSize: 24, fontWeight: '900', fontStyle: 'italic', letterSpacing: -1 },
  headerIcons: { flexDirection: 'row', alignItems: 'center' },
  cartIconBox: { position: 'relative' },
  badge: { position: 'absolute', top: -6, right: -8, backgroundColor: '#000', borderRadius: 10, minWidth: 18, height: 18, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4 },
  badgeText: { color: '#fff', fontSize: 10, fontWeight: '900' },
  categoriesContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#888', marginRight: 20 },
  categoryActive: { color: '#000', borderBottomWidth: 2, borderColor: '#000', paddingBottom: 2 },
  list: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  emptyText: { textAlign: 'center', marginTop: 40, color: '#666', fontWeight: '600' },
  card: { width: cardWidth, marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 180, backgroundColor: '#eee', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  productName: { fontSize: 14, fontWeight: '600', color: '#000', marginTop: 10, paddingHorizontal: 5 },
  productPrice: { fontSize: 13, fontWeight: '800', color: '#000', marginTop: 4, paddingHorizontal: 5, marginBottom: 10 }
});