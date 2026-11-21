import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useCallback, useState } from 'react';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { usePreferences } from '../../context/PreferencesContext';

interface OrdenItem {
  id: number;
  fecha: string;
  direccion_envio: string;
  total: string;
  estado: string;
  detalles: {
    id: number;
    producto_nombre: string;
    talla: string;
    cantidad: number;
    precio_unitario: string;
  }[];
}

export default function CuentaScreen() {
  const { username, isAuthenticated, loadingAuth, login, register, logout } = useAuth();
  const { theme, setTheme, language, setLanguage, colors, t } = usePreferences();
  const router = useRouter();

  const [ordenes, setOrdenes] = useState<OrdenItem[]>([]);
  const [pedidosAbiertos, setPedidosAbiertos] = useState(true);
  const [configAbierta, setConfigAbierta] = useState(true);
  const [modoRegistro, setModoRegistro] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [nombreInput, setNombreInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmPassword, setMostrarConfirmPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const cargarOrdenes = useCallback(() => {
    if (!isAuthenticated) {
      setOrdenes([]);
      return;
    }
    api.get('/ordenes/')
      .then((res) => {
        const lista = res.data.results ? res.data.results : res.data;
        setOrdenes(lista);
      })
      .catch((err) => console.error('Error al cargar órdenes:', err));
  }, [isAuthenticated]);

  useFocusEffect(
    useCallback(() => {
      cargarOrdenes();
    }, [cargarOrdenes])
  );

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!userInput.trim() || !passwordInput.trim()) {
      setErrorMsg(t.errFillFields);
      return;
    }

    if (modoRegistro && passwordInput.length < 6) {
      setErrorMsg(t.errPassLength);
      return;
    }

    if (modoRegistro && passwordInput !== confirmPassword) {
      setErrorMsg(t.errPassMismatch);
      return;
    }

    try {
      setEnviando(true);
      if (modoRegistro) {
        await register({
          username: userInput,
          email: emailInput,
          first_name: nombreInput,
          password: passwordInput,
        });
      } else {
        await login(userInput, passwordInput);
      }
      setPasswordInput('');
      setConfirmPassword('');
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.detail) {
        setErrorMsg(t.errBadCreds);
      } else if (data?.username) {
        setErrorMsg(`${data.username[0]}`);
      } else if (data?.email) {
        setErrorMsg(`${data.email[0]}`);
      } else {
        setErrorMsg(t.errServer);
      }
    } finally {
      setEnviando(false);
    }
  };

  const renderPanelConfiguracion = () => (
    <View style={{ width: '100%', marginTop: 4 }}>
      <Pressable
        style={[
          styles.menuBtn,
          { borderColor: colors.border, backgroundColor: colors.card, marginBottom: configAbierta ? 0 : 12 },
        ]}
        onPress={() => setConfigAbierta(!configAbierta)}
      >
        <View style={styles.rowCenter}>
          <Ionicons name="settings-outline" size={20} color={colors.text} />
          <Text style={[styles.menuBtnText, { color: colors.text }]}>{t.settings}</Text>
        </View>
        <Ionicons
          name={configAbierta ? 'chevron-up-sharp' : 'chevron-down-sharp'}
          size={20}
          color={colors.text}
        />
      </Pressable>

      {configAbierta && (
        <View
          style={[
            styles.settingsBody,
            { borderColor: colors.border, backgroundColor: colors.surface },
          ]}
        >
          <Text style={[styles.settingGroupTitle, { color: colors.text }]}>{t.themeLabel}</Text>
          <View style={[styles.toggleGroup, { borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.toggleOption,
                { backgroundColor: theme === 'light' ? colors.btnBg : colors.card },
              ]}
              onPress={() => setTheme('light')}
            >
              <Ionicons
                name="sunny-outline"
                size={16}
                color={theme === 'light' ? colors.btnText : colors.text}
              />
              <Text
                style={[
                  styles.toggleOptionText,
                  { color: theme === 'light' ? colors.btnText : colors.text },
                ]}
              >
                {t.lightMode}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.toggleOption,
                { backgroundColor: theme === 'dark' ? colors.btnBg : colors.card },
              ]}
              onPress={() => setTheme('dark')}
            >
              <Ionicons
                name="moon-outline"
                size={16}
                color={theme === 'dark' ? colors.btnText : colors.text}
              />
              <Text
                style={[
                  styles.toggleOptionText,
                  { color: theme === 'dark' ? colors.btnText : colors.text },
                ]}
              >
                {t.darkMode}
              </Text>
            </Pressable>
          </View>

          <Text style={[styles.settingGroupTitle, { color: colors.text, marginTop: 16 }]}>
            {t.languageLabel}
          </Text>
          <View style={[styles.toggleGroup, { borderColor: colors.border }]}>
            <Pressable
              style={[
                styles.toggleOption,
                { backgroundColor: language === 'es' ? colors.btnBg : colors.card },
              ]}
              onPress={() => setLanguage('es')}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  { color: language === 'es' ? colors.btnText : colors.text },
                ]}
              >
                {t.spanish}
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.toggleOption,
                { backgroundColor: language === 'en' ? colors.btnBg : colors.card },
              ]}
              onPress={() => setLanguage('en')}
            >
              <Text
                style={[
                  styles.toggleOptionText,
                  { color: language === 'en' ? colors.btnText : colors.text },
                ]}
              >
                {t.english}
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );

  if (loadingAuth) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg }]}>
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  if (isAuthenticated) {
    return (
      <ScrollView
        style={[styles.container, { backgroundColor: colors.bg }]}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>{t.myAccount}</Text>
        </View>

        <View style={styles.profileBox}>
          <View style={[styles.avatar, { backgroundColor: colors.btnBg }]}>
            <Text style={[styles.avatarText, { color: colors.btnText }]}>
              {username ? username.slice(0, 2).toUpperCase() : 'G27'}
            </Text>
          </View>

          <Text style={[styles.welcomeLabel, { color: colors.subtext }]}>{t.activeSession}</Text>
          <Text style={[styles.usernameTitle, { color: colors.text }]}>@{username}</Text>

          <View style={[styles.tokenBadge, { backgroundColor: colors.btnBg }]}>
            <Ionicons name="shield-checkmark-sharp" size={16} color={colors.btnText} />
            <Text style={[styles.tokenBadgeText, { color: colors.btnText }]}>
              {t.jwtAuthenticated}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          {/* MIS PEDIDOS */}
          <View style={{ width: '100%' }}>
            <Pressable
              style={[
                styles.menuBtn,
                {
                  borderColor: colors.border,
                  backgroundColor: colors.card,
                  marginBottom: pedidosAbiertos ? 0 : 12,
                },
              ]}
              onPress={() => setPedidosAbiertos(!pedidosAbiertos)}
            >
              <View style={styles.rowCenter}>
                <Ionicons name="receipt-outline" size={20} color={colors.text} />
                <Text style={[styles.menuBtnText, { color: colors.text }]}>
                  {t.myOrders} ({ordenes.length})
                </Text>
              </View>
              <Ionicons
                name={pedidosAbiertos ? 'chevron-up-sharp' : 'chevron-down-sharp'}
                size={20}
                color={colors.text}
              />
            </Pressable>

            {pedidosAbiertos && (
              <View
                style={[
                  styles.settingsBody,
                  { borderColor: colors.border, backgroundColor: colors.surface },
                ]}
              >
                {ordenes.length === 0 ? (
                  <Text style={[styles.emptyOrderText, { color: colors.subtext }]}>
                    {t.noOrdersYet}
                  </Text>
                ) : (
                  ordenes.map((ord) => (
                    <View
                      key={ord.id}
                      style={[
                        styles.orderCard,
                        { borderColor: colors.border, backgroundColor: colors.card },
                      ]}
                    >
                      <View style={styles.orderTopRow}>
                        <Text style={[styles.orderIdText, { color: colors.text }]}>
                          {t.orderNumber}{ord.id}
                        </Text>
                        <View style={[styles.statusBadge, { backgroundColor: colors.btnBg }]}>
                          <Text style={[styles.statusText, { color: colors.btnText }]}>
                            {ord.estado}
                          </Text>
                        </View>
                      </View>

                      <Text style={[styles.orderDateText, { color: colors.subtext }]}>
                        {new Date(ord.fecha).toLocaleDateString()} • {t.deliveredTo}{' '}
                        {ord.direccion_envio}
                      </Text>

                      {ord.detalles.map((det) => (
                        <Text key={det.id} style={[styles.orderDetailLine, { color: colors.text }]}>
                          • {det.cantidad}x {det.producto_nombre.toUpperCase()} [{det.talla}]
                        </Text>
                      ))}

                      <Text style={[styles.orderTotalText, { color: colors.text }]}>
                        TOTAL: ${ord.total} MXN
                      </Text>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>

          <Pressable
            style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/favoritos' as any)}
          >
            <Text style={[styles.menuBtnText, { color: colors.text }]}>{t.myFavorites}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </Pressable>

          <Pressable
            style={[styles.menuBtn, { borderColor: colors.border, backgroundColor: colors.card }]}
            onPress={() => router.push('/(tabs)/carrito' as any)}
          >
            <Text style={[styles.menuBtnText, { color: colors.text }]}>{t.viewMyCart}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text} />
          </Pressable>

          {renderPanelConfiguracion()}

          <Pressable style={[styles.logoutBtn, { backgroundColor: colors.btnBg }]} onPress={logout}>
            <Text style={[styles.logoutBtnText, { color: colors.btnText }]}>{t.logout}</Text>
          </Pressable>
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>{t.accessTitle}</Text>
      </View>

      <View style={styles.formBox}>
        <View style={[styles.switchRow, { borderColor: colors.border }]}>
          <Pressable
            style={[
              styles.switchTab,
              { backgroundColor: !modoRegistro ? colors.btnBg : colors.card },
            ]}
            onPress={() => {
              setModoRegistro(false);
              setConfirmPassword('');
              setErrorMsg(null);
            }}
          >
            <Text
              style={[
                styles.switchText,
                { color: !modoRegistro ? colors.btnText : colors.text },
              ]}
            >
              {t.loginTab}
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.switchTab,
              { backgroundColor: modoRegistro ? colors.btnBg : colors.card },
            ]}
            onPress={() => {
              setModoRegistro(true);
              setConfirmPassword('');
              setErrorMsg(null);
            }}
          >
            <Text
              style={[
                styles.switchText,
                { color: modoRegistro ? colors.btnText : colors.text },
              ]}
            >
              {t.registerTab}
            </Text>
          </Pressable>
        </View>

        {errorMsg && (
          <View
            style={[
              styles.errorBox,
              { borderColor: colors.border, backgroundColor: colors.surface },
            ]}
          >
            <Text style={[styles.errorText, { color: colors.text }]}>{errorMsg}</Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.text }]}>{t.userLabel}</Text>
        <TextInput
          style={[
            styles.input,
            { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
          ]}
          placeholder="ej. rafa27"
          placeholderTextColor={colors.subtext}
          autoCapitalize="none"
          value={userInput}
          onChangeText={setUserInput}
        />

        {modoRegistro && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>{t.nameLabel}</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
              ]}
              placeholder={t.namePlaceholder}
              placeholderTextColor={colors.subtext}
              value={nombreInput}
              onChangeText={setNombreInput}
            />

            <Text style={[styles.label, { color: colors.text }]}>{t.emailLabel}</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: colors.border, color: colors.text, backgroundColor: colors.card },
              ]}
              placeholder="correo@ejemplo.com"
              placeholderTextColor={colors.subtext}
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailInput}
              onChangeText={setEmailInput}
            />
          </>
        )}

        <Text style={[styles.label, { color: colors.text }]}>{t.passwordLabel}</Text>
        <View
          style={[
            styles.passwordWrapper,
            { borderColor: colors.border, backgroundColor: colors.card },
          ]}
        >
          <TextInput
            style={[styles.passwordInput, { color: colors.text }]}
            placeholder="••••••••"
            placeholderTextColor={colors.subtext}
            secureTextEntry={!mostrarPassword}
            autoCapitalize="none"
            value={passwordInput}
            onChangeText={setPasswordInput}
          />
          <Pressable
            onPress={() => setMostrarPassword((prev) => !prev)}
            style={styles.eyeBtn}
          >
            <Ionicons
              name={mostrarPassword ? 'eye-off-outline' : 'eye-outline'}
              size={22}
              color={colors.text}
            />
          </Pressable>
        </View>

        {modoRegistro && (
          <>
            <Text style={[styles.label, { color: colors.text }]}>{t.confirmPasswordLabel}</Text>
            <View
              style={[
                styles.passwordWrapper,
                { borderColor: colors.border, backgroundColor: colors.card },
              ]}
            >
              <TextInput
                style={[styles.passwordInput, { color: colors.text }]}
                placeholder="••••••••"
                placeholderTextColor={colors.subtext}
                secureTextEntry={!mostrarConfirmPassword}
                autoCapitalize="none"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <Pressable
                onPress={() => setMostrarConfirmPassword((prev) => !prev)}
                style={styles.eyeBtn}
              >
                <Ionicons
                  name={mostrarConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={22}
                  color={colors.text}
                />
              </Pressable>
            </View>
          </>
        )}

        <Pressable
          style={[styles.submitBtn, { backgroundColor: colors.btnBg }, enviando && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={enviando}
        >
          <Text style={[styles.submitBtnText, { color: colors.btnText }]}>
            {enviando ? t.processing : modoRegistro ? t.createAccount : t.enterBtn}
          </Text>
        </Pressable>

        <View style={[styles.divider, { backgroundColor: colors.border }]} />

        {renderPanelConfiguracion()}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5 },
  formBox: { padding: 20 },
  switchRow: { flexDirection: 'row', borderWidth: 3, marginBottom: 24 },
  switchTab: { flex: 1, paddingVertical: 14, alignItems: 'center' },
  switchText: { fontSize: 13, fontWeight: '900', letterSpacing: 1 },
  errorBox: { borderWidth: 3, padding: 12, marginBottom: 16 },
  errorText: { fontWeight: '800', fontSize: 13 },
  label: { fontSize: 12, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
  input: {
    borderWidth: 3,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 18,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 3,
    marginBottom: 18,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
  },
  eyeBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  submitBtn: {
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#555',
  },
  submitBtnText: { fontSize: 16, fontWeight: '900', letterSpacing: 2 },
  profileBox: { padding: 20, alignItems: 'center' },
  avatar: { width: 84, height: 84, justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  avatarText: { fontSize: 28, fontWeight: '900' },
  welcomeLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginTop: 16 },
  usernameTitle: { fontSize: 28, fontWeight: '900', marginTop: 2 },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  tokenBadgeText: { fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  divider: { width: '100%', height: 4, marginVertical: 24 },
  menuBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    padding: 16,
    marginBottom: 12,
  },
  rowCenter: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  menuBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 1 },
  settingsBody: {
    width: '100%',
    borderWidth: 3,
    borderTopWidth: 0,
    padding: 16,
    marginBottom: 12,
  },
  emptyOrderText: { fontSize: 13, fontWeight: '600' },
  orderCard: {
    borderWidth: 2,
    padding: 12,
    marginBottom: 10,
  },
  orderTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  orderIdText: { fontSize: 14, fontWeight: '900' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2 },
  statusText: { fontSize: 10, fontWeight: '900', letterSpacing: 0.8 },
  orderDateText: { fontSize: 11, fontWeight: '700', marginBottom: 8 },
  orderDetailLine: { fontSize: 12, fontWeight: '700', marginBottom: 2 },
  orderTotalText: { fontSize: 14, fontWeight: '900', marginTop: 8 },
  settingGroupTitle: { fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 8 },
  toggleGroup: { flexDirection: 'row', borderWidth: 2 },
  toggleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
  },
  toggleOptionText: { fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
  logoutBtn: { width: '100%', padding: 18, alignItems: 'center', marginTop: 12 },
  logoutBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});