import { Platform } from 'react-native';

let memoryToken: string | null = null;
let memoryUser: string | null = null;

export const saveSession = async (token: string, username: string) => {
  memoryToken = token;
  memoryUser = username;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.setItem('grid27_token', token);
    window.localStorage.setItem('grid27_user', username);
  }
};

export const getSession = async (): Promise<{ token: string | null; username: string | null }> => {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return {
      token: window.localStorage.getItem('grid27_token'),
      username: window.localStorage.getItem('grid27_user'),
    };
  }
  return { token: memoryToken, username: memoryUser };
};

export const clearSession = async () => {
  memoryToken = null;
  memoryUser = null;
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    window.localStorage.removeItem('grid27_token');
    window.localStorage.removeItem('grid27_user');
  }
};