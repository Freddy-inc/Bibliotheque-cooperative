import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fileService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  BookOpenIcon,
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  PlusIcon,
  EyeIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentFiles, setRecentFiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Charger les statistiques
      const statsResponse = await fileService.getStats();
      setStats(statsResponse.data);

      // Charger les fichiers récents (5 derniers)
      const filesResponse = await fileService.getFiles({
        limit: 5,
        sortBy: 'date_added',
        sortOrder: 'DESC'
      });
      setRecentFiles(filesResponse.data.files);

    } catch (error) {
      console.error('Erreur lors du chargement du dashboard:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type) => {
    const icons = {
      pdf: DocumentIcon,
      image: PhotoIcon,
      audio: MusicalNoteIcon,
      video: VideoCameraIcon,
    };
    return icons[type] || DocumentIcon;
  };

  const getFileTypeColor = (type) => {
    const colors = {
      pdf: 'text-red-600 bg-red-50',
      image: 'text-green-600 bg-green-50',
      audio: 'text-purple-600 bg-purple-50',
      video: 'text-blue-600 bg-blue-50',
    };
    return colors[type] || 'text-gray-600 bg-gray-50';
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Tableau de bord
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Bienvenue, {user?.name} ! Voici un aperçu de la bibliothèque.
          </p>
        </div>
        {isAdmin() && (
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <Link
              to="/admin/files"
              className="btn-primary"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Ajouter un fichier
            </Link>
          </div>
        )}
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total des fichiers */}
          <div className="card">
            <div className="card-body">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <BookOpenIcon className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Total des fichiers
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stats.total}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          {/* Statistiques par type */}
          {stats.byType.map((typeStat) => {
            const Icon = getFileIcon(typeStat.type);
            const colorClass = getFileTypeColor(typeStat.type);
            
            return (
              <div key={typeStat.type} className="card">
                <div className="card-body">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate capitalize">
                          {typeStat.type === 'pdf' ? 'PDF' : 
                           typeStat.type === 'image' ? 'Images' :
                           typeStat.type === 'audio' ? 'Audio' : 'Vidéos'}
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {typeStat.count}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Thématiques populaires */}
      {stats?.topThemes && stats.topThemes.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3 className="text-lg font-medium text-gray-900">
              Thématiques populaires
            </h3>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stats.topThemes.map((theme, index) => (
                <div key={theme.theme} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <span className="flex-shrink-0 w-6 h-6 bg-primary-100 text-primary-600 rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </span>
                    <span className="ml-3 text-sm font-medium text-gray-900 truncate">
                      {theme.theme}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {theme.count} fichier{theme.count > 1 ? 's' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Fichiers récents */}
      <div className="card">
        <div className="card-header flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">
            Fichiers récents
          </h3>
          <Link
            to="/library"
            className="text-sm text-primary-600 hover:text-primary-500"
          >
            Voir tout
          </Link>
        </div>
        <div className="card-body">
          {recentFiles.length === 0 ? (
            <div className="text-center py-8">
              <BookOpenIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun fichier
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                La bibliothèque est vide pour le moment.
              </p>
              {isAdmin() && (
                <div className="mt-6">
                  <Link
                    to="/admin/files"
                    className="btn-primary"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Ajouter le premier fichier
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {recentFiles.map((file) => {
                const Icon = getFileIcon(file.type);
                const colorClass = getFileTypeColor(file.type);
                
                return (
                  <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="flex items-center min-w-0 flex-1">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.title}
                        </p>
                        <p className="text-sm text-gray-500 truncate">
                          {file.theme} • {formatFileSize(file.file_size)} • {formatDate(file.date_added)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Link
                        to={`/library/${file.id}`}
                        className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                        title="Voir les détails"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Link
          to="/library"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="card-body text-center">
            <BookOpenIcon className="mx-auto h-8 w-8 text-primary-600 mb-3" />
            <h3 className="text-sm font-medium text-gray-900">
              Parcourir la bibliothèque
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Explorez tous les fichiers disponibles
            </p>
          </div>
        </Link>

        <Link
          to="/profile"
          className="card hover:shadow-md transition-shadow duration-200"
        >
          <div className="card-body text-center">
            <div className="mx-auto h-8 w-8 bg-primary-600 rounded-full flex items-center justify-center mb-3">
              <span className="text-sm font-medium text-white">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">
              Mon profil
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Gérez vos informations personnelles
            </p>
          </div>
        </Link>

        {isAdmin() && (
          <Link
            to="/admin/files"
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="card-body text-center">
              <PlusIcon className="mx-auto h-8 w-8 text-success-600 mb-3" />
              <h3 className="text-sm font-medium text-gray-900">
                Gestion des fichiers
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Ajoutez et gérez les fichiers
              </p>
            </div>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
