import { View, Text, StyleSheet, FlatList, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';

export default function CarritoScreen() {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const [pedidoConfirmado, setPedidoConfirmado] = useState(false);
  const router = useRouter();

  const handleFinalizarCompra = () => {
    clearCart();
    setPedidoConfirmado(true);
  };

  if (pedidoConfirmado) {
    return (
      <View style={styles.centerBox}>
        <View style={styles.confirmCard}>
          <Ionicons name="checkmark-sharp" size={48} color="#000" />
          <Text style={styles.confirmTitle}>ORDEN REGISTRADA</Text>
          <Text style={styles.confirmSub}>
            Tu pedido de GRID27 ha sido procesado correctamente.
          </Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => {
              setPedidoConfirmado(false);
              router.push('/(tabs)/' as any);
            }}
          >
            <Text style={styles.primaryBtnText}>VOLVER A LA TIENDA</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CARRITO ({totalItems})</Text>
        {items.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text style={styles.clearText}>VACIAR</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="bag-outline" size={64} color="#000" />
          <Text style={styles.emptyTitle}>TU CARRITO ESTÁ VACÍO</Text>
          <Text style={styles.emptySub}>Explora el catálogo y agrega prendas a tu orden.</Text>
          <Pressable
            style={styles.primaryBtn}
            onPress={() => router.push('/(tabs)/' as any)}
          >
            <Text style={styles.primaryBtnText}>IR AL CATÁLOGO</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.id}-${item.talla}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View style={styles.itemCard}>
                {item.imagen ? (
                  <Image source={{ uri: item.imagen }} style={styles.itemImage} />
                ) : (
                  <View style={[styles.itemImage, styles.placeholderImg]} />
                )}

                <View style={styles.itemInfo}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName} numberOfLines={1}>
                      {item.nombre.toUpperCase()}
                    </Text>
                    <Pressable onPress={() => removeFromCart(item.id, item.talla)}>
                      <Ionicons name="trash-outline" size={20} color="#000" />
                    </Pressable>
                  </View>

                  <Text style={styles.itemSize}>TALLA: {item.talla}</Text>
                  <Text style={styles.itemPrice}>
                    ${(item.precio * item.cantidad).toFixed(2)} MXN
                  </Text>

                  {/* CONTROLES DE CANTIDAD */}
                  <View style={styles.qtyRow}>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.talla, -1)}
                    >
                      <Text style={styles.qtyBtnText}>-</Text>
                    </Pressable>
                    <Text style={styles.qtyValue}>{item.cantidad}</Text>
                    <Pressable
                      style={styles.qtyBtn}
                      onPress={() => updateQuantity(item.id, item.talla, 1)}
                    >
                      <Text style={styles.qtyBtnText}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />

          {/* RESUMEN Y CHECKOUT */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>TOTAL A PAGAR</Text>
              <Text style={styles.totalAmount}>${totalPrice.toFixed(2)} MXN</Text>
            </View>

            <Pressable style={styles.checkoutBtn} onPress={handleFinalizarCompra}>
              <Text style={styles.checkoutBtnText}>FINALIZAR COMPRA</Text>
            </Pressable>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#000',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, color: '#000' },
  clearText: { fontSize: 12, fontWeight: '900', textDecorationLine: 'underline', color: '#000' },

  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#fff' },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 16, color: '#000' },
  emptySub: { fontSize: 14, color: '#555', textAlign: 'center', marginTop: 6, marginBottom: 24 },

  confirmCard: {
    width: '100%',
    borderWidth: 4,
    borderColor: '#000',
    padding: 28,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  confirmTitle: { fontSize: 24, fontWeight: '900', marginTop: 12, color: '#000' },
  confirmSub: { fontSize: 14, color: '#333', textAlign: 'center', marginVertical: 14 },

  primaryBtn: { backgroundColor: '#000', paddingHorizontal: 24, paddingVertical: 16 },
  primaryBtnText: { color: '#fff', fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },

  list: { padding: 16, paddingBottom: 24 },
  itemCard: {
    flexDirection: 'row',
    borderWidth: 3,
    borderColor: '#000',
    marginBottom: 14,
    backgroundColor: '#fff',
  },
  itemImage: { width: 100, height: 115, resizeMode: 'contain', backgroundColor: '#f4f4f4' },
  placeholderImg: { backgroundColor: '#eee' },
  itemInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 15, fontWeight: '900', color: '#000', flex: 1 },
  itemSize: { fontSize: 12, fontWeight: '700', color: '#555', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '900', color: '#000', marginTop: 4 },

  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderWidth: 2,
    borderColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '900', color: '#000' },
  qtyValue: { marginHorizontal: 14, fontSize: 15, fontWeight: '900', color: '#000' },

  footer: {
    padding: 16,
    borderTopWidth: 4,
    borderTopColor: '#000',
    backgroundColor: '#fff',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1, color: '#000' },
  totalAmount: { fontSize: 22, fontWeight: '900', color: '#000' },
  checkoutBtn: {
    backgroundColor: '#000',
    padding: 18,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#555',
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },
});