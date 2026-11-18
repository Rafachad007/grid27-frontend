import React, { createContext, useContext, useState } from 'react';

export interface CartItem {
  id: number;
  nombre: string;
  precio: number;
  talla: string;
  imagen?: string;
  cantidad: number;
}

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
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (nuevo: Omit<CartItem, 'cantidad'>) => {
    setItems((prev) => {
      const index = prev.findIndex((i) => i.id === nuevo.id && i.talla === nuevo.talla);
      if (index > -1) {
        const copia = [...prev];
        copia[index].cantidad += 1;
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
            return { ...i, cantidad: i.cantidad + delta };
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