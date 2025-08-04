import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fileService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  PencilIcon,
  TrashIcon,
  DocumentIcon,
  PhotoIcon,
  MusicalNoteIcon,
  VideoCameraIcon,
  CalendarIcon,
  UserIcon,
  TagIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import fileDownload from 'js-file-download';

const FileDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadFileDetail();
  }, [id]);

  const loadFileDetail = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFileById(id);
      setFile(response.data.file);
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      toast.error('Fichier non trouvé');
      navigate('/library');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const response = await fileService.downloadFile(id);
      
      // Télécharger le fichier
      fileDownload(response.data, file.original_name);
      toast.success('Téléchargement démarré');
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      toast.error('Erreur lors du téléchargement');
    } finally {
      setDownloading(false);
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
      pdf: 'text-red-600 bg-red-50 border-red-200',
      image: 'text-green-600 bg-green-50 border-green-200',
      audio: 'text-purple-600 bg-purple-50 border-purple-200',
      video: 'text-blue-600 bg-blue-50 border-blue-200',
    };
    return colors[type] || 'text-gray-600 bg-gray-50 border-gray-200';
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
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileViewUrl = () => {
    return fileService.getFileViewUrl(id);
  };

  const canPreview = (type) => {
    return ['pdf', 'image', 'audio', 'video'].includes(type);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!file) {
    return (
      <div className="text-center py-12">
        <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          Fichier non trouvé
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Le fichier demandé n'existe pas ou a été supprimé.
        </p>
        <div className="mt-6">
          <Link to="/library" className="btn-primary">
            Retour à la bibliothèque
          </Link>
        </div>
      </div>
    );
  }

  const Icon = getFileIcon(file.type);
  const colorClass = getFileTypeColor(file.type);

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/library')}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{file.title}</h1>
            <p className="text-sm text-gray-500">Détails du fichier</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="btn-primary"
          >
            {downloading ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
            )}
            Télécharger
          </button>
          
          {isAdmin() && (
            <>
              <Link
                to={`/admin/files?edit=${file.id}`}
                className="btn-secondary"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Aperçu du fichier */}
        <div className="lg:col-span-2">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Aperçu</h3>
            </div>
            <div className="card-body">
              {canPreview(file.type) ? (
                <div className="w-full">
                  {file.type === 'pdf' && (
                    <iframe
                      src={getFileViewUrl()}
                      className="w-full h-96 border border-gray-300 rounded-lg"
                      title={file.title}
                    />
                  )}
                  
                  {file.type === 'image' && (
                    <img
                      src={getFileViewUrl()}
                      alt={file.title}
                      className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-300"
                    />
                  )}
                  
                  {file.type === 'audio' && (
                    <audio
                      controls
                      className="w-full"
                      preload="metadata"
                    >
                      <source src={getFileViewUrl()} />
                      Votre navigateur ne supporte pas la lecture audio.
                    </audio>
                  )}
                  
                  {file.type === 'video' && (
                    <video
                      controls
                      className="w-full h-auto max-h-96 rounded-lg border border-gray-300"
                      preload="metadata"
                    >
                      <source src={getFileViewUrl()} />
                      Votre navigateur ne supporte pas la lecture vidéo.
                    </video>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className={`inline-flex p-4 rounded-full border-2 ${colorClass}`}>
                    <Icon className="h-12 w-12" />
                  </div>
                  <h3 className="mt-4 text-lg font-medium text-gray-900">
                    Aperçu non disponible
                  </h3>
                  <p className="mt-2 text-sm text-gray-500">
                    Ce type de fichier ne peut pas être prévisualisé dans le navigateur.
                  </p>
                  <div className="mt-6">
                    <button
                      onClick={handleDownload}
                      disabled={downloading}
                      className="btn-primary"
                    >
                      {downloading ? (
                        <LoadingSpinner size="sm" className="mr-2" />
                      ) : (
                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                      )}
                      Télécharger pour ouvrir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Informations du fichier */}
        <div className="space-y-6">
          {/* Métadonnées principales */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Informations</h3>
            </div>
            <div className="card-body space-y-4">
              {/* Type de fichier */}
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.type === 'pdf' ? 'Document PDF' :
                     file.type === 'image' ? 'Image' :
                     file.type === 'audio' ? 'Fichier audio' :
                     file.type === 'video' ? 'Fichier vidéo' : 'Fichier'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatFileSize(file.file_size)}
                  </p>
                </div>
              </div>

              {/* Thématique */}
              <div className="flex items-center space-x-3">
                <TagIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Thématique</p>
                  <span className="badge badge-primary">{file.theme}</span>
                </div>
              </div>

              {/* Date d'ajout */}
              <div className="flex items-center space-x-3">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ajouté le</p>
                  <p className="text-sm text-gray-500">
                    {formatDate(file.date_added)}
                  </p>
                </div>
              </div>

              {/* Ajouté par */}
              <div className="flex items-center space-x-3">
                <UserIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Ajouté par</p>
                  <p className="text-sm text-gray-500">
                    {file.uploader_name || 'Système'}
                  </p>
                </div>
              </div>

              {/* Nom du fichier original */}
              <div className="flex items-center space-x-3">
                <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Nom original</p>
                  <p className="text-sm text-gray-500 break-all">
                    {file.original_name}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Description</h3>
            </div>
            <div className="card-body">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {file.description}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-medium text-gray-900">Actions</h3>
            </div>
            <div className="card-body space-y-3">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="btn-primary w-full justify-center"
              >
                {downloading ? (
                  <LoadingSpinner size="sm" className="mr-2" />
                ) : (
                  <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                )}
                Télécharger
              </button>
              
              {isAdmin() && (
                <>
                  <Link
                    to={`/admin/files?edit=${file.id}`}
                    className="btn-secondary w-full justify-center"
                  >
                    <PencilIcon className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                </>
              )}
              
              <Link
                to="/library"
                className="btn-secondary w-full justify-center"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Retour à la bibliothèque
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileDetail;
