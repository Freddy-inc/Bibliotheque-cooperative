import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { fileService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

const Library = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: '',
    theme: '',
    sortBy: 'date_added',
    sortOrder: 'DESC',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [themes, setThemes] = useState([]);

  useEffect(() => {
    loadFiles();
  }, [filters]);

  useEffect(() => {
    // Extraire les thèmes uniques des fichiers
    const uniqueThemes = [...new Set(files.map(file => file.theme))].sort();
    setThemes(uniqueThemes);
  }, [files]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles(filters);
      setFiles(response.data.files);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchTerm.trim()) {
      loadFiles();
      return;
    }

    try {
      setLoading(true);
      const response = await fileService.searchFiles(searchTerm, {
        type: filters.type
      });
      setFiles(response.data.files);
    } catch (error) {
      console.error('Erreur lors de la recherche:', error);
      toast.error('Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
    setSearchTerm(''); // Réinitialiser la recherche lors du changement de filtre
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      theme: '',
      sortBy: 'date_added',
      sortOrder: 'DESC',
    });
    setSearchTerm('');
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

  const hasActiveFilters = filters.type || filters.theme || searchTerm;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Bibliothèque
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Parcourez et recherchez dans la collection de fichiers
          </p>
        </div>
      </div>

      {/* Barre de recherche et filtres */}
      <div className="card">
        <div className="card-body">
          <form onSubmit={handleSearch} className="space-y-4">
            {/* Recherche */}
            <div className="flex space-x-4">
              <div className="flex-1">
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Rechercher des fichiers..."
                    className="form-input pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
              >
                {loading ? <LoadingSpinner size="sm" /> : 'Rechercher'}
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className={`btn-secondary ${showFilters ? 'bg-gray-100' : ''}`}
              >
                <FunnelIcon className="h-4 w-4 mr-2" />
                Filtres
              </button>
            </div>

            {/* Filtres */}
            {showFilters && (
              <div className="border-t pt-4 space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {/* Type de fichier */}
                  <div>
                    <label className="form-label">Type de fichier</label>
                    <select
                      className="form-select"
                      value={filters.type}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    >
                      <option value="">Tous les types</option>
                      <option value="pdf">PDF</option>
                      <option value="image">Images</option>
                      <option value="audio">Audio</option>
                      <option value="video">Vidéo</option>
                    </select>
                  </div>

                  {/* Thématique */}
                  <div>
                    <label className="form-label">Thématique</label>
                    <select
                      className="form-select"
                      value={filters.theme}
                      onChange={(e) => handleFilterChange('theme', e.target.value)}
                    >
                      <option value="">Toutes les thématiques</option>
                      {themes.map((theme) => (
                        <option key={theme} value={theme}>
                          {theme}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tri */}
                  <div>
                    <label className="form-label">Trier par</label>
                    <select
                      className="form-select"
                      value={filters.sortBy}
                      onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                    >
                      <option value="date_added">Date d'ajout</option>
                      <option value="title">Titre</option>
                      <option value="type">Type</option>
                      <option value="theme">Thématique</option>
                    </select>
                  </div>

                  {/* Ordre */}
                  <div>
                    <label className="form-label">Ordre</label>
                    <select
                      className="form-select"
                      value={filters.sortOrder}
                      onChange={(e) => handleFilterChange('sortOrder', e.target.value)}
                    >
                      <option value="DESC">Décroissant</option>
                      <option value="ASC">Croissant</option>
                    </select>
                  </div>
                </div>

                {/* Bouton pour effacer les filtres */}
                {hasActiveFilters && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="btn-secondary text-sm"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Effacer les filtres
                    </button>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Résultats */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            {searchTerm ? `Résultats pour "${searchTerm}"` : 'Tous les fichiers'}
            <span className="ml-2 text-sm font-normal text-gray-500">
              ({files.length} fichier{files.length > 1 ? 's' : ''})
            </span>
          </h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {searchTerm || hasActiveFilters ? 'Aucun résultat' : 'Aucun fichier'}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || hasActiveFilters
                  ? 'Essayez de modifier vos critères de recherche'
                  : 'La bibliothèque est vide pour le moment'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {files.map((file) => {
                const Icon = getFileIcon(file.type);
                const colorClass = getFileTypeColor(file.type);
                
                return (
                  <div
                    key={file.id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200"
                  >
                    <div className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 p-2 rounded-lg ${colorClass}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {file.title}
                        </h4>
                        <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {file.description}
                        </p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span className="badge badge-secondary">
                            {file.theme}
                          </span>
                          <span>{formatFileSize(file.file_size)}</span>
                          <span>{formatDate(file.date_added)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-xs text-gray-500">
                        Par {file.uploader_name || 'Système'}
                      </div>
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/library/${file.id}`}
                          className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                          title="Voir les détails"
                        >
                          <EyeIcon className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
