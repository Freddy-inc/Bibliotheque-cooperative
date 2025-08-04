import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fileService } from '../services/api';
import LoadingSpinner from '../components/LoadingSpinner';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CloudArrowUpIcon,
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { useDropzone } from 'react-dropzone';
import toast from 'react-hot-toast';

const FileManagement = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Formulaire d'upload/édition
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    file: null,
  });

  useEffect(() => {
    loadFiles();
    
    // Vérifier s'il y a un fichier à éditer dans les paramètres URL
    const editId = searchParams.get('edit');
    if (editId) {
      handleEditFile(editId);
    }
  }, [searchParams]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      const response = await fileService.getFiles({
        sortBy: 'date_added',
        sortOrder: 'DESC'
      });
      setFiles(response.data.files);
    } catch (error) {
      console.error('Erreur lors du chargement des fichiers:', error);
      toast.error('Erreur lors du chargement des fichiers');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFile = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      toast.error('Veuillez sélectionner un fichier');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('file', formData.file);
    uploadFormData.append('title', formData.title);
    uploadFormData.append('description', formData.description);
    uploadFormData.append('theme', formData.theme);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      await fileService.uploadFile(uploadFormData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(progress);
      });

      toast.success('Fichier uploadé avec succès');
      setShowUploadModal(false);
      resetForm();
      loadFiles();
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      toast.error('Erreur lors de l\'upload du fichier');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleEditFile = async (fileId) => {
    try {
      const response = await fileService.getFileById(fileId);
      const file = response.data.file;
      
      setSelectedFile(file);
      setFormData({
        title: file.title,
        description: file.description,
        theme: file.theme,
        file: null,
      });
      setShowEditModal(true);
      
      // Nettoyer l'URL
      setSearchParams({});
    } catch (error) {
      console.error('Erreur lors du chargement du fichier:', error);
      toast.error('Fichier non trouvé');
    }
  };

  const handleUpdateFile = async (e) => {
    e.preventDefault();

    try {
      setIsUploading(true);
      
      await fileService.updateFile(selectedFile.id, {
        title: formData.title,
        description: formData.description,
        theme: formData.theme,
      });

      toast.success('Fichier mis à jour avec succès');
      setShowEditModal(false);
      resetForm();
      loadFiles();
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      toast.error('Erreur lors de la mise à jour du fichier');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteFile = async () => {
    try {
      await fileService.deleteFile(selectedFile.id);
      toast.success('Fichier supprimé avec succès');
      setShowDeleteModal(false);
      setSelectedFile(null);
      loadFiles();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression du fichier');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      theme: '',
      file: null,
    });
    setSelectedFile(null);
  };

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setFormData(prev => ({ ...prev, file }));
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
      'audio/*': ['.mp3', '.wav', '.ogg'],
      'video/*': ['.mp4', '.avi', '.mov', '.wmv'],
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: false,
  });

  const getFileIcon = (type) => {
    const icons = {
      pdf: '📄',
      image: '🖼️',
      audio: '🎵',
      video: '🎬',
    };
    return icons[type] || '📄';
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl">
            Gestion des fichiers
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ajoutez, modifiez et supprimez les fichiers de la bibliothèque
          </p>
        </div>
        <div className="mt-4 flex md:ml-4 md:mt-0">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Ajouter un fichier
          </button>
        </div>
      </div>

      {/* Liste des fichiers */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">
            Fichiers ({files.length})
          </h3>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-12">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                Aucun fichier
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Commencez par ajouter votre premier fichier
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="btn-primary"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Ajouter un fichier
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fichier
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Thématique
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Taille
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">
                            {getFileIcon(file.type)}
                          </span>
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {file.title}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {file.description}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-secondary capitalize">
                          {file.type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-primary">
                          {file.theme}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatFileSize(file.file_size)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(file.date_added)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => window.open(`/library/${file.id}`, '_blank')}
                            className="p-2 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-gray-100"
                            title="Voir"
                          >
                            <EyeIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditFile(file.id)}
                            className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-gray-100"
                            title="Modifier"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedFile(file);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-gray-100"
                            title="Supprimer"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal d'upload */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUploadFile}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Ajouter un fichier
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUploadModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Zone de drop */}
                    <div>
                      <label className="form-label">Fichier *</label>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-primary-400 bg-primary-50'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
                        <p className="mt-2 text-sm text-gray-600">
                          {formData.file ? (
                            <span className="font-medium text-primary-600">
                              {formData.file.name}
                            </span>
                          ) : isDragActive ? (
                            'Déposez le fichier ici...'
                          ) : (
                            'Glissez-déposez un fichier ou cliquez pour sélectionner'
                          )}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PDF, Images, Audio, Vidéo (max 50MB)
                        </p>
                      </div>
                    </div>

                    {/* Titre */}
                    <div>
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Titre du fichier"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        required
                        rows={3}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Description du fichier"
                      />
                    </div>

                    {/* Thématique */}
                    <div>
                      <label className="form-label">Thématique *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.theme}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                        placeholder="Ex: Agriculture, Santé, Éducation..."
                      />
                    </div>

                    {/* Barre de progression */}
                    {isUploading && (
                      <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                          <span>Upload en cours...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isUploading || !formData.file}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isUploading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Upload...' : 'Ajouter'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUploadModal(false);
                      resetForm();
                    }}
                    disabled={isUploading}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition */}
      {showEditModal && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleUpdateFile}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Modifier le fichier
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditModal(false);
                        resetForm();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="space-y-4">
                    {/* Titre */}
                    <div>
                      <label className="form-label">Titre *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="form-label">Description *</label>
                      <textarea
                        required
                        rows={3}
                        className="form-textarea"
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      />
                    </div>

                    {/* Thématique */}
                    <div>
                      <label className="form-label">Thématique *</label>
                      <input
                        type="text"
                        required
                        className="form-input"
                        value={formData.theme}
                        onChange={(e) => setFormData(prev => ({ ...prev, theme: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="btn-primary w-full sm:w-auto sm:ml-3"
                  >
                    {isUploading ? (
                      <LoadingSpinner size="sm" className="mr-2" />
                    ) : (
                      <CheckIcon className="h-4 w-4 mr-2" />
                    )}
                    {isUploading ? 'Mise à jour...' : 'Mettre à jour'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false);
                      resetForm();
                    }}
                    disabled={isUploading}
                    className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && selectedFile && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Supprimer le fichier
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Êtes-vous sûr de vouloir supprimer "{selectedFile.title}" ? 
                        Cette action est irréversible.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={handleDeleteFile}
                  className="btn-danger w-full sm:w-auto sm:ml-3"
                >
                  <TrashIcon className="h-4 w-4 mr-2" />
                  Supprimer
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setSelectedFile(null);
                  }}
                  className="btn-secondary w-full sm:w-auto mt-3 sm:mt-0"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileManagement;
