import axios from 'axios';
import toast from 'react-hot-toast';

// Configuration de base d'Axios
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 secondes
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token d'authentification
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les réponses et erreurs
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    const { response } = error;
    
    if (response?.status === 401) {
      // Token expiré ou invalide
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      toast.error('Session expirée. Veuillez vous reconnecter.');
    } else if (response?.status === 403) {
      toast.error('Accès non autorisé');
    } else if (response?.status === 404) {
      toast.error('Ressource non trouvée');
    } else if (response?.status >= 500) {
      toast.error('Erreur serveur. Veuillez réessayer plus tard.');
    } else if (error.code === 'NETWORK_ERROR') {
      toast.error('Erreur de connexion. Vérifiez votre réseau.');
    }
    
    return Promise.reject(error);
  }
);

// Services d'authentification
export const authService = {
  // Connexion
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Inscription (admin seulement)
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Obtenir le profil
  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },

  // Mettre à jour le profil
  updateProfile: async (profileData) => {
    const response = await api.put('/auth/profile', profileData);
    return response.data;
  },

  // Changer le mot de passe
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/change-password', passwordData);
    return response.data;
  },

  // Vérifier le token
  verifyToken: async () => {
    const response = await api.get('/auth/verify');
    return response.data;
  },
};

// Services de fichiers
export const fileService = {
  // Obtenir tous les fichiers
  getFiles: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/files?${params.toString()}`);
    return response.data;
  },

  // Obtenir un fichier par ID
  getFileById: async (id) => {
    const response = await api.get(`/files/${id}`);
    return response.data;
  },

  // Rechercher des fichiers
  searchFiles: async (searchTerm, filters = {}) => {
    const params = new URLSearchParams({ q: searchTerm });
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/files/search?${params.toString()}`);
    return response.data;
  },

  // Obtenir les statistiques
  getStats: async () => {
    const response = await api.get('/files/stats');
    return response.data;
  },

  // Upload d'un fichier (admin seulement)
  uploadFile: async (formData, onUploadProgress) => {
    const response = await api.post('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress,
    });
    return response.data;
  },

  // Mettre à jour un fichier (admin seulement)
  updateFile: async (id, fileData) => {
    const response = await api.put(`/files/${id}`, fileData);
    return response.data;
  },

  // Supprimer un fichier (admin seulement)
  deleteFile: async (id) => {
    const response = await api.delete(`/files/${id}`);
    return response.data;
  },

  // Télécharger un fichier
  downloadFile: async (id) => {
    const response = await api.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response;
  },

  // Obtenir l'URL de visualisation d'un fichier
  getFileViewUrl: (id) => {
    return `${API_BASE_URL}/files/${id}/serve`;
  },
};

// Service système
export const systemService = {
  // Vérifier la santé du serveur
  checkHealth: async () => {
    const response = await api.get('/health');
    return response.data;
  },

  // Obtenir les informations système
  getInfo: async () => {
    const response = await api.get('/info');
    return response.data;
  },
};

export default api;
