import { View, Text, StyleSheet, Image, ActivityIndicator, Pressable, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import axios from 'axios';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams(); 
  const router = useRouter();
  const [producto, setProducto] = useState<any>(null);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get(`http://192.168.1.70:8000/api/productos/${id}/`)
      .then(response => {
        setProducto(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error(error);
        setCargando(false);
      });
  }, [id]);

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

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>{"< VOLVER"}</Text>
        </Pressable>
      </View>
      
      <View style={styles.imageContainer}>
        {producto.imagenes && producto.imagenes.length > 0 && (
          <Image source={{ uri: producto.imagenes[0].imagen }} style={styles.image} />
        )}
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.title}>{producto.nombre.toUpperCase()}</Text>
        <Text style={styles.price}>${producto.precio} MXN</Text>
        
        <View style={styles.divider} />
        
        <Text style={styles.descTitle}>DETALLES:</Text>
        <Text style={styles.desc}>{producto.descripcion}</Text>
        
        {/* Este botón lo conectaremos en la Opción B */}
        <Pressable style={styles.buyButton}>
          <Text style={styles.buyButtonText}>AÑADIR AL CARRITO</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  errorText: { fontWeight: '900', fontSize: 20, color: '#000' },
  header: { padding: 15, paddingTop: 40, borderBottomWidth: 4, borderBottomColor: '#000', backgroundColor: '#fff' },
  backBtn: { backgroundColor: '#000', paddingHorizontal: 15, paddingVertical: 10, alignSelf: 'flex-start' },
  backBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1 },
  imageContainer: { borderBottomWidth: 4, borderBottomColor: '#000' },
  image: { width: '100%', height: 450, resizeMode: 'cover' },
  infoBox: { padding: 20 },
  title: { fontSize: 36, fontWeight: '900', letterSpacing: -1, color: '#000' },
  price: { fontSize: 24, fontWeight: '900', color: '#000', marginTop: 5 },
  divider: { height: 4, backgroundColor: '#000', marginVertical: 20 },
  descTitle: { fontSize: 16, fontWeight: '900', marginBottom: 10, color: '#000', letterSpacing: 1 },
  desc: { fontSize: 16, lineHeight: 24, color: '#000', fontWeight: '500' },
  buyButton: { backgroundColor: '#000', padding: 20, marginTop: 40, alignItems: 'center', borderBottomWidth: 6, borderRightWidth: 6, borderColor: '#555' },
  buyButtonText: { color: '#fff', fontSize: 18, fontWeight: '900', letterSpacing: 2 }
});