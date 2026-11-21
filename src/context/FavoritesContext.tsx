import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

interface FavoritesContextType {
  favoriteIds: number[];
  totalFavoritos: number;
  isFavorito: (productoId: number) => boolean;
  toggleFavorito: (productoId: number) => Promise<boolean>;
  refreshFavoritos: () => Promise<void>;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const refreshFavoritos = useCallback(async () => {
    if (!isAuthenticated) {
      setFavoriteIds([]);
      return;
    }

    try {
      const response = await api.get('/productos/mis_favoritos/');
      const lista = response.data.results ? response.data.results : response.data;
      setFavoriteIds(lista.map((p: { id: number }) => p.id));
    } catch (error) {
      console.error('Error al sincronizar favoritos:', error);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refreshFavoritos();
  }, [refreshFavoritos]);

  const isFavorito = (productoId: number) => favoriteIds.includes(productoId);

  const toggleFavorito = async (productoId: number): Promise<boolean> => {
    const response = await api.post(`/productos/${productoId}/favorito/`);
    const agregado: boolean = response.data.es_favorito;

    setFavoriteIds((prev) =>
      agregado
        ? prev.includes(productoId)
          ? prev
          : [...prev, productoId]
        : prev.filter((id) => id !== productoId)
    );

    return agregado;
  };

  return (
    <FavoritesContext.Provider
      value={{
        favoriteIds,
        totalFavoritos: favoriteIds.length,
        isFavorito,
        toggleFavorito,
        refreshFavoritos,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (!context) throw new Error('useFavorites debe usarse dentro de un FavoritesProvider');
  return context;
}