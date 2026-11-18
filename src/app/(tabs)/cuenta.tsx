import { View, Text, StyleSheet, TextInput, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { useState } from 'react';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

export default function CuentaScreen() {
  const { username, isAuthenticated, loadingAuth, login, register, logout } = useAuth();
  const router = useRouter();

  const [modoRegistro, setModoRegistro] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [nombreInput, setNombreInput] = useState('');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async () => {
    setErrorMsg(null);

    if (!userInput.trim() || !passwordInput.trim()) {
      setErrorMsg('Completa usuario y contraseña.');
      return;
    }

    if (modoRegistro && passwordInput.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
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
    } catch (err: any) {
      const data = err?.response?.data;
      if (data?.detail) {
        setErrorMsg('Usuario o contraseña incorrectos.');
      } else if (data?.username) {
        setErrorMsg(`Usuario: ${data.username[0]}`);
      } else if (data?.email) {
        setErrorMsg(`Correo: ${data.email[0]}`);
      } else {
        setErrorMsg('No se pudo conectar con el servidor.');
      }
    } finally {
      setEnviando(false);
    }
  };

  if (loadingAuth) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#000" />
      </View>
    );
  }

  // VISTA DE PERFIL CUANDO YA INICIÓ SESIÓN
  if (isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>MI CUENTA</Text>
        </View>

        <View style={styles.profileBox}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {username ? username.slice(0, 2).toUpperCase() : 'G27'}
            </Text>
          </View>

          <Text style={styles.welcomeLabel}>SESIÓN ACTIVA</Text>
          <Text style={styles.usernameTitle}>@{username}</Text>

          <View style={styles.tokenBadge}>
            <Ionicons name="shield-checkmark-sharp" size={16} color="#fff" />
            <Text style={styles.tokenBadgeText}>JWT AUTENTICADO</Text>
          </View>

          <View style={styles.divider} />

          <Pressable
            style={styles.menuBtn}
            onPress={() => router.push('/(tabs)/favoritos' as any)}
          >
            <Text style={styles.menuBtnText}>MIS FAVORITOS</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </Pressable>

          <Pressable
            style={styles.menuBtn}
            onPress={() => router.push('/(tabs)/carrito' as any)}
          >
            <Text style={styles.menuBtnText}>VER MI CARRITO</Text>
            <Ionicons name="arrow-forward" size={20} color="#000" />
          </Pressable>

          <Pressable style={styles.logoutBtn} onPress={logout}>
            <Text style={styles.logoutBtnText}>CERRAR SESIÓN</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  // VISTA DE LOGIN / REGISTRO
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>GRID27 // ACCESO</Text>
      </View>

      <View style={styles.formBox}>
        <View style={styles.switchRow}>
          <Pressable
            style={[styles.switchTab, !modoRegistro && styles.switchTabActive]}
            onPress={() => {
              setModoRegistro(false);
              setErrorMsg(null);
            }}
          >
            <Text style={[styles.switchText, !modoRegistro && styles.switchTextActive]}>
              INICIAR SESIÓN
            </Text>
          </Pressable>

          <Pressable
            style={[styles.switchTab, modoRegistro && styles.switchTabActive]}
            onPress={() => {
              setModoRegistro(true);
              setErrorMsg(null);
            }}
          >
            <Text style={[styles.switchText, modoRegistro && styles.switchTextActive]}>
              REGISTRARSE
            </Text>
          </Pressable>
        </View>

        {errorMsg && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        )}

        <Text style={styles.label}>USUARIO *</Text>
        <TextInput
          style={styles.input}
          placeholder="ej. rafa27"
          placeholderTextColor="#888"
          autoCapitalize="none"
          value={userInput}
          onChangeText={setUserInput}
        />

        {modoRegistro && (
          <>
            <Text style={styles.label}>NOMBRE</Text>
            <TextInput
              style={styles.input}
              placeholder="Tu nombre"
              placeholderTextColor="#888"
              value={nombreInput}
              onChangeText={setNombreInput}
            />

            <Text style={styles.label}>CORREO ELECTRÓNICO</Text>
            <TextInput
              style={styles.input}
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#888"
              autoCapitalize="none"
              keyboardType="email-address"
              value={emailInput}
              onChangeText={setEmailInput}
            />
          </>
        )}

        <Text style={styles.label}>CONTRASEÑA *</Text>
        <TextInput
          style={styles.input}
          placeholder="••••••••"
          placeholderTextColor="#888"
          secureTextEntry
          value={passwordInput}
          onChangeText={setPasswordInput}
        />

        <Pressable
          style={[styles.submitBtn, enviando && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={enviando}
        >
          <Text style={styles.submitBtnText}>
            {enviando
              ? 'PROCESANDO...'
              : modoRegistro
              ? 'CREAR CUENTA'
              : 'ENTRAR'}
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingTop: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 4,
    borderBottomColor: '#000',
  },
  headerTitle: { fontSize: 22, fontWeight: '900', letterSpacing: -0.5, color: '#000' },

  formBox: { padding: 20 },
  switchRow: { flexDirection: 'row', borderWidth: 3, borderColor: '#000', marginBottom: 24 },
  switchTab: { flex: 1, paddingVertical: 14, alignItems: 'center', backgroundColor: '#fff' },
  switchTabActive: { backgroundColor: '#000' },
  switchText: { fontSize: 13, fontWeight: '900', color: '#000', letterSpacing: 1 },
  switchTextActive: { color: '#fff' },

  errorBox: {
    borderWidth: 3,
    borderColor: '#000',
    backgroundColor: '#f2f2f2',
    padding: 12,
    marginBottom: 16,
  },
  errorText: { color: '#000', fontWeight: '800', fontSize: 13 },

  label: { fontSize: 12, fontWeight: '900', letterSpacing: 1, color: '#000', marginBottom: 6 },
  input: {
    borderWidth: 3,
    borderColor: '#000',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 18,
    backgroundColor: '#fff',
  },

  submitBtn: {
    backgroundColor: '#000',
    padding: 18,
    alignItems: 'center',
    marginTop: 8,
    borderBottomWidth: 5,
    borderRightWidth: 5,
    borderColor: '#555',
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 2 },

  profileBox: { padding: 20, alignItems: 'center' },
  avatar: {
    width: 84,
    height: 84,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  welcomeLabel: { fontSize: 11, fontWeight: '900', letterSpacing: 1.5, color: '#666', marginTop: 16 },
  usernameTitle: { fontSize: 28, fontWeight: '900', color: '#000', marginTop: 2 },
  tokenBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginTop: 10,
  },
  tokenBadgeText: { color: '#fff', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  divider: { width: '100%', height: 4, backgroundColor: '#000', marginVertical: 24 },

  menuBtn: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#000',
    padding: 16,
    marginBottom: 12,
  },
  menuBtnText: { fontSize: 14, fontWeight: '900', letterSpacing: 1, color: '#000' },

  logoutBtn: {
    width: '100%',
    backgroundColor: '#000',
    padding: 18,
    alignItems: 'center',
    marginTop: 16,
  },
  logoutBtnText: { color: '#fff', fontSize: 14, fontWeight: '900', letterSpacing: 2 },
});