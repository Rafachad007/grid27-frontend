import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';

export type ThemeMode = 'light' | 'dark';
export type Language = 'es' | 'en';

let memoryTheme: ThemeMode = 'light';
let memoryLang: Language = 'es';

const translations = {
  es: {
    tabHome: 'Inicio',
    tabSearch: 'Buscar',
    tabFavorites: 'Favoritos',
    tabCart: 'Carrito',
    tabAccount: 'Cuenta',

    all: 'TODO',
    newPill: 'NEW',
    recentlyAdded: 'RECIÉN AGREGADO',
    latestCount: 'ÚLTIMOS',
    newArrivalTag: 'RECIÉN LLEGADO',
    allProducts: 'TODOS LOS PRODUCTOS',
    pcs: 'PZAS',
    emptyCategory: 'No hay prendas en esta categoría.',
    loginForFavorites: 'INICIA SESIÓN EN "CUENTA" PARA GUARDAR FAVORITOS',

    connectionErrorTitle: 'ERROR DE CONEXIÓN',
    connectionErrorSub: 'No se pudo conectar con el servidor de GRID27. Verifica tu red o que Django esté encendido.',
    retryBtn: 'REINTENTAR',

    exploreTitle: 'EXPLORAR // FILTROS',
    clear: 'LIMPIAR',
    searchPlaceholder: 'Buscar playera, hoodie, corte...',
    categoryLabel: 'CATEGORÍA:',
    allFem: 'TODAS',
    sizeLabel: 'TALLA:',
    allSizes: 'TODAS',
    sortLabel: 'ORDENAR:',
    sortRecent: 'RECIENTES',
    sortLowPrice: 'MENOR PRECIO',
    sortHighPrice: 'MAYOR PRECIO',
    resultsFound: 'RESULTADOS ENCONTRADOS:',
    noMatches: 'SIN COINCIDENCIAS',
    noMatchesSub: 'Prueba con otra palabra clave o limpia los filtros activos.',

    favoritesTitle: 'FAVORITOS',
    accessRequired: 'ACCESO REQUERIDO',
    accessRequiredSub: 'Inicia sesión para guardar prendas y consultar tu lista de deseos en cualquier dispositivo.',
    goToAccount: 'IR A MI CUENTA',
    noFavorites: 'SIN FAVORITOS AÚN',
    noFavoritesSub: 'Toca el corazón en cualquier prenda del catálogo para guardarla aquí.',
    exploreCatalog: 'EXPLORAR CATÁLOGO',

    cartTitle: 'CARRITO',
    emptyCartBtn: 'VACIAR',
    emptyCartTitle: 'TU CARRITO ESTÁ VACÍO',
    emptyCartSub: 'Explora el catálogo y agrega prendas a tu orden.',
    goToCatalog: 'IR AL CATÁLOGO',
    sizePrefix: 'TALLA:',
    shippingLabel: 'DIRECCIÓN DE ENTREGA *',
    shippingPlaceholder: 'Calle, número, colonia, ciudad...',
    loginToCheckout: 'INICIA SESIÓN PARA COMPRAR',
    errShippingRequired: 'Ingresa una dirección de entrega para procesar tu orden.',
    processingOrder: 'PROCESANDO ORDEN...',
    totalToPay: 'TOTAL A PAGAR',
    checkoutBtn: 'FINALIZAR COMPRA',
    orderRegistered: 'ORDEN REGISTRADA',
    orderRegisteredSub: 'Tu pedido ha sido guardado y el inventario actualizado en tiempo real.',
    viewOrdersBtn: 'VER MIS PEDIDOS',
    backToStore: 'VOLVER A LA TIENDA',

    backBtn: '< VOLVER',
    notFound: '404 - PRODUCTO NO ENCONTRADO',
    selectSize: 'SELECCIONA TALLA:',
    availableStock: 'DISPONIBLES',
    soldOut: 'AGOTADO',
    maxInCart: 'LÍMITE EN CARRITO ALCANZADO',
    noSizesConfigured: 'SIN TALLAS DISPONIBLES',
    detailsLabel: 'DETALLES:',
    addToCart: 'AÑADIR AL CARRITO',
    addedToCart: '✓ AÑADIDO AL CARRITO',

    loadMore: 'CARGAR MÁS PRENDAS',
    loadingMore: 'CARGANDO...',
    sizeGuideBtn: 'GUÍA BOX-FIT',
    sizeGuideTitle: 'GUÍA DE MEDIDAS // BOX-FIT',
    sizeGuideSubtitle: 'Corte cuadrado y ligeramente holgado (medidas en centímetros).',
    colSize: 'TALLA',
    colChest: 'PECHO',
    colLength: 'LARGO',
    colShoulder: 'HOMBRO',
    closeModalBtn: 'ENTENDIDO',

    myAccount: 'MI CUENTA',
    activeSession: 'SESIÓN ACTIVA',
    jwtAuthenticated: 'JWT AUTENTICADO',
    myOrders: 'MIS PEDIDOS',
    noOrdersYet: 'Aún no has realizado compras con esta cuenta.',
    orderNumber: 'ORDEN #',
    deliveredTo: 'ENVÍO:',
    myFavorites: 'MIS FAVORITOS',
    viewMyCart: 'VER MI CARRITO',
    settings: 'CONFIGURACIÓN',
    themeLabel: 'APARIENCIA / TEMA',
    lightMode: 'MODO LUZ',
    darkMode: 'MODO OSCURO',
    languageLabel: 'IDIOMA DE LA APP',
    spanish: 'ESPAÑOL',
    english: 'ENGLISH',
    logout: 'CERRAR SESIÓN',
    accessTitle: 'GRID27 // ACCESO',
    loginTab: 'INICIAR SESIÓN',
    registerTab: 'REGISTRARSE',
    userLabel: 'USUARIO *',
    nameLabel: 'NOMBRE',
    namePlaceholder: 'Tu nombre',
    emailLabel: 'CORREO ELECTRÓNICO',
    passwordLabel: 'CONTRASEÑA *',
    confirmPasswordLabel: 'CONFIRMAR CONTRASEÑA *',
    processing: 'PROCESANDO...',
    createAccount: 'CREAR CUENTA',
    enterBtn: 'ENTRAR',
    errFillFields: 'Completa usuario y contraseña.',
    errPassLength: 'La contraseña debe tener al menos 6 caracteres.',
    errPassMismatch: 'Las contraseñas no coinciden.',
    errBadCreds: 'Usuario o contraseña incorrectos.',
    errServer: 'No se pudo conectar con el servidor.',
  },
  en: {
    tabHome: 'Home',
    tabSearch: 'Search',
    tabFavorites: 'Favorites',
    tabCart: 'Cart',
    tabAccount: 'Account',

    all: 'ALL',
    newPill: 'NEW',
    recentlyAdded: 'RECENTLY ADDED',
    latestCount: 'LATEST',
    newArrivalTag: 'NEW ARRIVAL',
    allProducts: 'ALL PRODUCTS',
    pcs: 'PCS',
    emptyCategory: 'No items in this category.',
    loginForFavorites: 'LOG IN UNDER "ACCOUNT" TO SAVE FAVORITES',

    connectionErrorTitle: 'CONNECTION ERROR',
    connectionErrorSub: 'Could not reach the GRID27 server. Check your network or verify Django is running.',
    retryBtn: 'RETRY',

    exploreTitle: 'EXPLORE // FILTERS',
    clear: 'CLEAR',
    searchPlaceholder: 'Search t-shirt, hoodie, fit...',
    categoryLabel: 'CATEGORY:',
    allFem: 'ALL',
    sizeLabel: 'SIZE:',
    allSizes: 'ALL',
    sortLabel: 'SORT BY:',
    sortRecent: 'RECENT',
    sortLowPrice: 'LOWEST PRICE',
    sortHighPrice: 'HIGHEST PRICE',
    resultsFound: 'RESULTS FOUND:',
    noMatches: 'NO MATCHES',
    noMatchesSub: 'Try another keyword or clear your active filters.',

    favoritesTitle: 'FAVORITES',
    accessRequired: 'ACCESS REQUIRED',
    accessRequiredSub: 'Log in to save garments and sync your wishlist across devices.',
    goToAccount: 'GO TO ACCOUNT',
    noFavorites: 'NO FAVORITES YET',
    noFavoritesSub: 'Tap the heart on any item in the catalog to save it here.',
    exploreCatalog: 'EXPLORE CATALOG',

    cartTitle: 'CART',
    emptyCartBtn: 'CLEAR',
    emptyCartTitle: 'YOUR CART IS EMPTY',
    emptyCartSub: 'Browse the catalog and add pieces to your order.',
    goToCatalog: 'GO TO CATALOG',
    sizePrefix: 'SIZE:',
    shippingLabel: 'SHIPPING ADDRESS *',
    shippingPlaceholder: 'Street, number, neighborhood, city...',
    loginToCheckout: 'LOG IN TO CHECKOUT',
    errShippingRequired: 'Please enter a shipping address to complete your order.',
    processingOrder: 'PROCESSING ORDER...',
    totalToPay: 'TOTAL TO PAY',
    checkoutBtn: 'CHECKOUT',
    orderRegistered: 'ORDER REGISTERED',
    orderRegisteredSub: 'Your order has been saved and inventory updated in real time.',
    viewOrdersBtn: 'VIEW MY ORDERS',
    backToStore: 'BACK TO STORE',

    backBtn: '< BACK',
    notFound: '404 - PRODUCT NOT FOUND',
    selectSize: 'SELECT SIZE:',
    availableStock: 'AVAILABLE',
    soldOut: 'SOLD OUT',
    maxInCart: 'CART STOCK LIMIT REACHED',
    noSizesConfigured: 'NO SIZES AVAILABLE',
    detailsLabel: 'DETAILS:',
    addToCart: 'ADD TO CART',
    addedToCart: '✓ ADDED TO CART',

    loadMore: 'LOAD MORE ITEMS',
    loadingMore: 'LOADING...',
    sizeGuideBtn: 'BOX-FIT GUIDE',
    sizeGuideTitle: 'SIZE CHART // BOX-FIT',
    sizeGuideSubtitle: 'Boxy, slightly oversized streetwear cut (measurements in cm).',
    colSize: 'SIZE',
    colChest: 'CHEST',
    colLength: 'LENGTH',
    colShoulder: 'SHOULDER',
    closeModalBtn: 'GOT IT',

    myAccount: 'MY ACCOUNT',
    activeSession: 'ACTIVE SESSION',
    jwtAuthenticated: 'JWT AUTHENTICATED',
    myOrders: 'MY ORDERS',
    noOrdersYet: 'You have not placed any orders with this account yet.',
    orderNumber: 'ORDER #',
    deliveredTo: 'SHIP TO:',
    myFavorites: 'MY FAVORITES',
    viewMyCart: 'VIEW MY CART',
    settings: 'SETTINGS',
    themeLabel: 'APPEARANCE / THEME',
    lightMode: 'LIGHT MODE',
    darkMode: 'DARK MODE',
    languageLabel: 'APP LANGUAGE',
    spanish: 'ESPAÑOL',
    english: 'ENGLISH',
    logout: 'LOG OUT',
    accessTitle: 'GRID27 // ACCESS',
    loginTab: 'LOG IN',
    registerTab: 'SIGN UP',
    userLabel: 'USERNAME *',
    nameLabel: 'FIRST NAME',
    namePlaceholder: 'Your name',
    emailLabel: 'EMAIL ADDRESS',
    passwordLabel: 'PASSWORD *',
    confirmPasswordLabel: 'CONFIRM PASSWORD *',
    processing: 'PROCESSING...',
    createAccount: 'CREATE ACCOUNT',
    enterBtn: 'SIGN IN',
    errFillFields: 'Please enter username and password.',
    errPassLength: 'Password must be at least 6 characters long.',
    errPassMismatch: 'Passwords do not match.',
    errBadCreds: 'Invalid username or password.',
    errServer: 'Could not connect to the server.',
  },
};

export interface ThemeColors {
  bg: string;
  card: string;
  surface: string;
  border: string;
  text: string;
  subtext: string;
  btnBg: string;
  btnText: string;
  skeleton: string;
}

interface PreferencesContextType {
  theme: ThemeMode;
  isDark: boolean;
  setTheme: (mode: ThemeMode) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  colors: ThemeColors;
  t: typeof translations.es;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(memoryTheme);
  const [language, setLanguageState] = useState<Language>(memoryLang);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const savedTheme = window.localStorage.getItem('grid27_theme') as ThemeMode | null;
      const savedLang = window.localStorage.getItem('grid27_lang') as Language | null;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        memoryTheme = savedTheme;
        setThemeState(savedTheme);
      }
      if (savedLang === 'es' || savedLang === 'en') {
        memoryLang = savedLang;
        setLanguageState(savedLang);
      }
    }
  }, []);

  const setTheme = (mode: ThemeMode) => {
    memoryTheme = mode;
    setThemeState(mode);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem('grid27_theme', mode);
    }
  };

  const setLanguage = (lang: Language) => {
    memoryLang = lang;
    setLanguageState(lang);
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.localStorage.setItem('grid27_lang', lang);
    }
  };

  const isDark = theme === 'dark';

  const colors: ThemeColors = {
    bg: isDark ? '#0a0a0a' : '#ffffff',
    card: isDark ? '#141414' : '#ffffff',
    surface: isDark ? '#1e1e1e' : '#f4f4f4',
    border: isDark ? '#ffffff' : '#000000',
    text: isDark ? '#ffffff' : '#000000',
    subtext: isDark ? '#a3a3a3' : '#555555',
    btnBg: isDark ? '#ffffff' : '#000000',
    btnText: isDark ? '#000000' : '#ffffff',
    skeleton: isDark ? '#2a2a2a' : '#d4d4d4',
  };

  return (
    <PreferencesContext.Provider
      value={{
        theme,
        isDark,
        setTheme,
        language,
        setLanguage,
        colors,
        t: translations[language],
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const context = useContext(PreferencesContext);
  if (!context) throw new Error('usePreferences debe usarse dentro de un PreferencesProvider');
  return context;
}