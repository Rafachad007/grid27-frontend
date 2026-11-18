import { Tabs } from 'expo-router'; // Si marca error, usa: import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, // Ocultamos el título feo de arriba
      tabBarActiveTintColor: '#000', // Color del ícono seleccionado (Negro)
      tabBarInactiveTintColor: '#aaa', // Color de los inactivos (Gris)
      tabBarStyle: {
        backgroundColor: '#fff',
        borderTopWidth: 2,
        borderTopColor: '#000',
        height: 60,
        paddingBottom: 5,
        paddingTop: 5,
      },
      tabBarLabelStyle: {
        fontSize: 10,
        fontWeight: 'bold',
      }
    }}>
      
      {/* Pestaña 1: El Catálogo que ya hicimos */}
      <Tabs.Screen 
        name="index" 
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color }) => <Ionicons name="home-outline" size={24} color={color} />,
        }} 
      />
      
      {/* Pestaña 2: Búsqueda */}
      <Tabs.Screen 
        name="buscar" 
        options={{
          title: 'Buscar',
          tabBarIcon: ({ color }) => <Ionicons name="search-outline" size={24} color={color} />,
        }} 
      />

      {/* Pestaña 3: Favoritos */}
      <Tabs.Screen 
        name="favoritos" 
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Ionicons name="heart-outline" size={24} color={color} />,
        }} 
      />

      {/* Pestaña 4: Carrito */}
      <Tabs.Screen 
        name="carrito" 
        options={{
          title: 'Carrito',
          tabBarIcon: ({ color }) => <Ionicons name="cart-outline" size={24} color={color} />,
        }} 
      />

      {/* Pestaña 5: Cuenta */}
      <Tabs.Screen 
        name="cuenta" 
        options={{
          title: 'Cuenta',
          tabBarIcon: ({ color }) => <Ionicons name="person-outline" size={24} color={color} />,
        }} 
      />

    </Tabs>
  );
}