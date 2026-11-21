import { View, Text, StyleSheet, FlatList, Image, Pressable, TextInput } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';

export default function CarritoScreen() {
  const { items, updateQuantity, removeFromCart, clearCart, totalItems, totalPrice } = useCart();
  const { isAuthenticated } = useAuth();
  const { colors, t } = usePreferences();
  const router = useRouter();

  const [direccion, setDireccion] = useState('');
  const [enviandoOrden, setEnviandoOrden] = useState(false);
  const [errorCheckout, setErrorCheckout] = useState<string | null>(null);
  const [ordenCreadaId, setOrdenCreadaId] = useState<number | null>(null);

  const handleFinalizarCompra = async () => {
    setErrorCheckout(null);

    if (!isAuthenticated) {
      router.push('/(tabs)/cuenta' as any);
      return;
    }

    if (!direccion.trim()) {
      setErrorCheckout(t.errShippingRequired);
      return;
    }

    try {
      setEnviandoOrden(true);
      const payload = {
        direccion_envio: direccion.trim(),
        items: items.map((item) => ({
          producto_id: item.id,
          talla: item.talla,
          cantidad: item.cantidad,
        })),
      };

      const response = await api.post('/ordenes/', payload);
      clearCart();
      setDireccion('');
      setOrdenCreadaId(response.data.id);
    } catch (err: any) {
      const data = err?.response?.data;
      if (Array.isArray(data)) {
        setErrorCheckout(data[0]);
      } else if (data?.non_field_errors) {
        setErrorCheckout(data.non_field_errors[0]);
      } else if (data?.detail) {
        setErrorCheckout(data.detail);
      } else {
        setErrorCheckout(t.errServer);
      }
    } finally {
      setEnviandoOrden(false);
    }
  };

  if (ordenCreadaId !== null) {
    return (
      <View style={[styles.centerBox, { backgroundColor: colors.bg }]}>
        <View
          style={[
            styles.confirmCard,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <Ionicons name="checkmark-sharp" size={48} color={colors.text} />
          <Text style={[styles.confirmTitle, { color: colors.text }]}>
            {t.orderRegistered} #{ordenCreadaId}
          </Text>
          <Text style={[styles.confirmSub, { color: colors.subtext }]}>{t.orderRegisteredSub}</Text>

          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.btnBg, marginBottom: 10, width: '100%' }]}
            onPress={() => {
              setOrdenCreadaId(null);
              router.push('/(tabs)/cuenta' as any);
            }}
          >
            <Text style={[styles.primaryBtnText, { color: colors.btnText, textAlign: 'center' }]}>
              {t.viewOrdersBtn}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.secondaryBtn,
              { borderColor: colors.border, backgroundColor: colors.card, width: '100%' },
            ]}
            onPress={() => {
              setOrdenCreadaId(null);
              router.push('/(tabs)/' as any);
            }}
          >
            <Text style={[styles.secondaryBtnText, { color: colors.text, textAlign: 'center' }]}>
              {t.backToStore}
            </Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.bg }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {t.cartTitle} ({totalItems})
        </Text>
        {items.length > 0 && (
          <Pressable onPress={clearCart}>
            <Text style={[styles.clearText, { color: colors.text }]}>{t.emptyCartBtn}</Text>
          </Pressable>
        )}
      </View>

      {items.length === 0 ? (
        <View style={styles.centerBox}>
          <Ionicons name="bag-outline" size={64} color={colors.text} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>{t.emptyCartTitle}</Text>
          <Text style={[styles.emptySub, { color: colors.subtext }]}>{t.emptyCartSub}</Text>
          <Pressable
            style={[styles.primaryBtn, { backgroundColor: colors.btnBg }]}
            onPress={() => router.push('/(tabs)/' as any)}
          >
            <Text style={[styles.primaryBtnText, { color: colors.btnText }]}>{t.goToCatalog}</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={items}
            keyExtractor={(item) => `${item.id}-${item.talla}`}
            contentContainerStyle={styles.list}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.itemCard,
                  { borderColor: colors.border, backgroundColor: colors.card },
                ]}
              >
                {item.imagen ? (
                  <Image
                    source={{ uri: item.imagen }}
                    style={[styles.itemImage, { backgroundColor: colors.surface }]}
                  />
                ) : (
                  <View style={[styles.itemImage, { backgroundColor: colors.surface }]} />
                )}

                <View style={styles.itemInfo}>
                  <View style={styles.itemTopRow}>
                    <Text style={[styles.itemName, { color: colors.text }]} numberOfLines={1}>
                      {item.nombre.toUpperCase()}
                    </Text>
                    <Pressable onPress={() => removeFromCart(item.id, item.talla)}>
                      <Ionicons name="trash-outline" size={20} color={colors.text} />
                    </Pressable>
                  </View>

                  <Text style={[styles.itemSize, { color: colors.subtext }]}>
                    {t.sizePrefix} {item.talla} (MAX: {item.stockMax})
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    ${(item.precio * item.cantidad).toFixed(2)} MXN
                  </Text>

                  <View style={styles.qtyRow}>
                    <Pressable
                      style={[styles.qtyBtn, { borderColor: colors.border }]}
                      onPress={() => updateQuantity(item.id, item.talla, -1)}
                    >
                      <Text style={[styles.qtyBtnText, { color: colors.text }]}>-</Text>
                    </Pressable>
                    <Text style={[styles.qtyValue, { color: colors.text }]}>{item.cantidad}</Text>
                    <Pressable
                      style={[
                        styles.qtyBtn,
                        {
                          borderColor: colors.border,
                          opacity: item.cantidad >= item.stockMax ? 0.35 : 1,
                        },
                      ]}
                      disabled={item.cantidad >= item.stockMax}
                      onPress={() => updateQuantity(item.id, item.talla, 1)}
                    >
                      <Text style={[styles.qtyBtnText, { color: colors.text }]}>+</Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            )}
          />

          <View
            style={[
              styles.footer,
              { borderTopColor: colors.border, backgroundColor: colors.bg },
            ]}
          >
            {errorCheckout && (
              <View
                style={[
                  styles.errorBox,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                <Text style={[styles.errorText, { color: colors.text }]}>{errorCheckout}</Text>
              </View>
            )}

            {isAuthenticated && (
              <View style={{ marginBottom: 12 }}>
                <Text style={[styles.shippingLabel, { color: colors.text }]}>
                  {t.shippingLabel}
                </Text>
                <TextInput
                  style={[
                    styles.shippingInput,
                    { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
                  ]}
                  placeholder={t.shippingPlaceholder}
                  placeholderTextColor={colors.subtext}
                  value={direccion}
                  onChangeText={setDireccion}
                />
              </View>
            )}

            <View style={styles.totalRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>{t.totalToPay}</Text>
              <Text style={[styles.totalAmount, { color: colors.text }]}>
                ${totalPrice.toFixed(2)} MXN
              </Text>
            </View>

            <Pressable
              style={[
                styles.checkoutBtn,
                { backgroundColor: colors.btnBg },
                enviandoOrden && { opacity: 0.6 },
              ]}
              disabled={enviandoOrden}
              onPress={handleFinalizarCompra}
            >
              <Text style={[styles.checkoutBtnText, { color: colors.btnText }]}>
                {!isAuthenticated
                  ? t.loginToCheckout
                  : enviandoOrden
                  ? t.processingOrder
                  : t.checkoutBtn}
              </Text>
            </Pressable>
          </View>
        </>
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
  clearText: { fontSize: 12, fontWeight: '900', textDecorationLine: 'underline' },
  centerBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyTitle: { fontSize: 20, fontWeight: '900', marginTop: 16 },
  emptySub: { fontSize: 14, textAlign: 'center', marginTop: 6, marginBottom: 24 },
  confirmCard: { width: '100%', borderWidth: 4, padding: 28, alignItems: 'center' },
  confirmTitle: { fontSize: 22, fontWeight: '900', marginTop: 12, textAlign: 'center' },
  confirmSub: { fontSize: 14, textAlign: 'center', marginVertical: 14 },
  primaryBtn: { paddingHorizontal: 24, paddingVertical: 16 },
  primaryBtnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
  secondaryBtn: { borderWidth: 3, paddingHorizontal: 24, paddingVertical: 14 },
  secondaryBtnText: { fontWeight: '900', letterSpacing: 1.5, fontSize: 13 },
  list: { padding: 16, paddingBottom: 24 },
  itemCard: { flexDirection: 'row', borderWidth: 3, marginBottom: 14 },
  itemImage: { width: 100, height: 115, resizeMode: 'contain' },
  itemInfo: { flex: 1, padding: 12, justifyContent: 'space-between' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemName: { fontSize: 15, fontWeight: '900', flex: 1 },
  itemSize: { fontSize: 12, fontWeight: '700', marginTop: 2 },
  itemPrice: { fontSize: 15, fontWeight: '900', marginTop: 4 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  qtyBtn: {
    width: 30,
    height: 30,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyBtnText: { fontSize: 16, fontWeight: '900' },
  qtyValue: { marginHorizontal: 14, fontSize: 15, fontWeight: '900' },
  footer: { padding: 16, borderTopWidth: 4 },
  errorBox: { borderWidth: 2, padding: 10, marginBottom: 10 },
  errorText: { fontSize: 12, fontWeight: '800' },
  shippingLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  shippingInput: {
    borderWidth: 2,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontWeight: '600',
  },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  totalLabel: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  totalAmount: { fontSize: 22, fontWeight: '900' },
  checkoutBtn: {
    padding: 18,
    alignItems: 'center',
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#555',
  },
  checkoutBtnText: { fontSize: 15, fontWeight: '900', letterSpacing: 2 },
});