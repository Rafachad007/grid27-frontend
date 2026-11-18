import { View, Text, StyleSheet, FlatList, Image, ActivityIndicator, Pressable, SafeAreaView, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Librería de íconos incluida en Expo
import axios from 'axios';

// Calculamos el ancho de la pantalla para dividir las tarjetas en 2 columnas perfectas
const numColumns = 2;
const screenWidth = Dimensions.get('window').width;
const cardWidth = (screenWidth - 48) / numColumns; // 48 = padding total

interface Producto {
  id: number;
  nombre: string;
  precio: string;
  imagenes: { id: number; imagen: string }[];
}

export default function HomeScreen() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState(true);
  const router = useRouter();

  useEffect(() => {
    axios.get('http://192.168.1.70:8000/api/productos/')
      .then(response => {
        setProductos(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al cargar productos:", error);
        setCargando(false);
      });
  }, []);

  if (cargando) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER TIPO MOCKUP */}
      <View style={styles.header}>
        <Text style={styles.logo}>GRID27</Text>
        <View style={styles.headerIcons}>
          <Ionicons name="search-outline" size={24} color="black" style={{ marginRight: 15 }} />
          <Ionicons name="cart-outline" size={24} color="black" />
        </View>
      </View>

      {/* PESTAÑAS DE CATEGORÍAS */}
      <View style={styles.categoriesContainer}>
        <Text style={[styles.categoryText, styles.categoryActive]}>Todo</Text>
        <Text style={styles.categoryText}>Playeras</Text>
        <Text style={styles.categoryText}>Hoodies</Text>
        <Text style={styles.categoryText}>Pantalones</Text>
      </View>
      
      {/* GRID DE PRODUCTOS (2 COLUMNAS) */}
      <FlatList 
        data={productos}
        keyExtractor={(item) => item.id.toString()}
        numColumns={numColumns} // Aquí ocurre la magia de las 2 columnas
        contentContainerStyle={styles.list}
        columnWrapperStyle={styles.row} // Espaciado entre columnas
        renderItem={({ item }) => (
          <Pressable 
            style={styles.card}
            onPress={() => router.push(`/producto/${item.id}` as any)} 
          >
            <View style={styles.imageContainer}>
              {item.imagenes && item.imagenes.length > 0 && (
                <Image source={{ uri: item.imagenes[0].imagen }} style={styles.image} />
              )}
              {/* Botón de favoritos superpuesto */}
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
  headerIcons: { flexDirection: 'row' },
  
  categoriesContainer: { flexDirection: 'row', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#fff', borderBottomWidth: 1, borderColor: '#eee' },
  categoryText: { fontSize: 14, fontWeight: '600', color: '#888', marginRight: 20 },
  categoryActive: { color: '#000', borderBottomWidth: 2, borderColor: '#000', paddingBottom: 2 },
  
  list: { padding: 16, paddingBottom: 40 },
  row: { justifyContent: 'space-between' },
  
  card: { width: cardWidth, marginBottom: 20, backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden' },
  imageContainer: { width: '100%', height: 180, backgroundColor: '#eee', position: 'relative' },
  image: { width: '100%', height: '100%', resizeMode: 'contain' },
  heartButton: { position: 'absolute', top: 10, right: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 15, width: 30, height: 30, justifyContent: 'center', alignItems: 'center' },
  
  productName: { fontSize: 14, fontWeight: '600', color: '#000', marginTop: 10, paddingHorizontal: 5 },
  productPrice: { fontSize: 13, fontWeight: '800', color: '#000', marginTop: 4, paddingHorizontal: 5, marginBottom: 10 }
});