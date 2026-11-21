import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  talla: string;
  imagen?: string;
  cantidad: number;
  stockMax: number;
}

let memoryCart: CartItem[] = [];

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'cantidad'>) => void;
  removeFromCart: (id: number, talla: string) => void;
  updateQuantity: (id: number, talla: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(memoryCart);
  const [hidratado, setHidratado] = useState(false);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        const guardado = window.localStorage.getItem('grid27_cart');
        if (guardado) {
          const parsed = JSON.parse(guardado);
          if (Array.isArray(parsed)) {
            memoryCart = parsed;
            setItems(parsed);
          }
        }
      } catch (error) {
        console.error('Error al leer carrito guardado:', error);
      }
    }
    setHidratado(true);
  }, []);

  useEffect(() => {
    if (!hidratado) return;
    memoryCart = items;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      try {
        window.localStorage.setItem('grid27_cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error al guardar carrito:', error);
      }
    }
  }, [items, hidratado]);

  const addToCart = (nuevo: Omit<CartItem, 'cantidad'>) => {
    if (nuevo.stockMax <= 0) return;

    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === nuevo.id && i.talla === nuevo.talla);
      if (index > -1) {
        const copia = [...prev];
        if (copia[index].cantidad < nuevo.stockMax) {
          copia[index].cantidad += 1;
          copia[index].stockMax = nuevo.stockMax;
        }
        return copia;
      }
      return [...prev, { ...nuevo, cantidad: 1 }];
    });
  };

  const removeFromCart = (id: number, talla: string) => {
    setItems((prev) => prev.filter((i) => !(i.id === id && i.talla === talla)));
  };

  const updateQuantity = (id: number, talla: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id && i.talla === talla) {
            const nuevaCantidad = Math.min(i.cantidad + delta, i.stockMax);
            return { ...i, cantidad: nuevaCantidad };
          }
          return i;
        })
        .filter((i) => i.cantidad > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((acc, item) => acc + item.cantidad, 0);
  const totalPrice = items.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  return (
    <CartContext.Provider
      value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de un CartProvider');
  return context;
}