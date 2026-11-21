import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { useFavorites } from '../../context/FavoritesContext';
import { usePreferences } from '../../context/PreferencesContext';

export default function TabLayout() {
  const { totalItems } = useCart();
  const { totalFavoritos } = useFavorites();
  const { colors, isDark, t } = usePreferences();

  const badgeStyle = {
    backgroundColor: colors.btnBg,
    color: colors.btnText,
    fontSize: 10,
    fontWeight: '900' as const,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: colors.bg,
    minWidth: 18,
    height: 18,
  };

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.text,
          tabBarInactiveTintColor: colors.subtext,
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '800',
          },
          tabBarStyle: {
            backgroundColor: colors.bg,
            borderTopWidth: 3,
            borderTopColor: colors.border,
            height: 62,
            paddingTop: 6,
            paddingBottom: 8,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: t.tabHome,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'home' : 'home-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="buscar"
          options={{
            title: t.tabSearch,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'search' : 'search-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="favoritos"
          options={{
            title: t.tabFavorites,
            tabBarBadge: totalFavoritos > 0 ? totalFavoritos : undefined,
            tabBarBadgeStyle: badgeStyle,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'heart' : 'heart-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="carrito"
          options={{
            title: t.tabCart,
            tabBarBadge: totalItems > 0 ? totalItems : undefined,
            tabBarBadgeStyle: badgeStyle,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'cart' : 'cart-outline'} size={22} color={color} />
            ),
          }}
        />

        <Tabs.Screen
          name="cuenta"
          options={{
            title: t.tabAccount,
            tabBarIcon: ({ color, focused }) => (
              <Ionicons name={focused ? 'person' : 'person-outline'} size={22} color={color} />
            ),
          }}
        />
      </Tabs>
    </>
  );
}