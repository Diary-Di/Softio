// services/cacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_PREFIX = 'cache_';

export const cacheService = {
  // Stocker des données avec une durée d'expiration
  set: async (key: string, data: any, ttl: number = 5 * 60 * 1000) => {
    try {
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      };
      await AsyncStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Erreur cache set:', error);
    }
  },

  // Récupérer des données avec vérification d'expiration
  get: async (key: string) => {
    try {
      const cached = await AsyncStorage.getItem(`${CACHE_PREFIX}${key}`);
      if (!cached) return null;

      const { data, timestamp, ttl } = JSON.parse(cached);
      const now = Date.now();

      // Vérifier si le cache a expiré
      if (now - timestamp > ttl) {
        await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Erreur cache get:', error);
      return null;
    }
  },

  // Supprimer un élément du cache
  remove: async (key: string) => {
    try {
      await AsyncStorage.removeItem(`${CACHE_PREFIX}${key}`);
    } catch (error) {
      console.error('Erreur cache remove:', error);
    }
  },

  // Vider tout le cache
  clear: async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Erreur cache clear:', error);
    }
  }
};