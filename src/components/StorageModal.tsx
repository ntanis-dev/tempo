import React, { useState } from 'react';
import { Download, Upload, Database, FileText, AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ModalHeader } from './ui/ModalHeader';
import { Button } from './ui/Button';
import { MODAL_STYLES } from '../constants/styles';
import { storageService } from '../services/storageService';

interface StorageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowSuccess: () => void;
  onClearSuccess: () => void;
  onShowError: (error: string) => void;
  onImportSuccess: () => void;
}

export const StorageModal: React.FC<StorageModalProps> = ({
  isOpen,
  onClose,
  onShowSuccess,
  onClearSuccess,
  onShowError,
  onImportSuccess
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Fade in animation
  React.useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      setIsClosing(false);
    }
  }, [isOpen]);

  // Handle fade out transition
  const handleClose = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleBackdropClickWithFade = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };
  if (!isOpen) return null;

  const handleClearStorage = () => {
    try {
      storageService.clearAllData();

      setShowClearConfirm(false);

      // Dispatch storage event to notify other components
      // Use StorageEvent with proper detail for cross-tab compatibility
      window.dispatchEvent(new StorageEvent('storage', {
        key: null,  // null means all storage was cleared
        newValue: null,
        oldValue: null,
        storageArea: localStorage
      }));

      // Show success message and refresh all storage-dependent state
      onClearSuccess();
    } catch (error) {
      console.error('Clear storage failed:', error);
      onShowError('Unable to clear storage.');
    }
  };

  const exportData = () => {
    try {
      const jsonString = storageService.exportAllData();
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const a = document.createElement('a');
      a.href = url;
      a.download = `tempo-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      onShowSuccess();
    } catch (error) {
      console.error('Export failed:', error);
      onShowError('Unable to export your data.');
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        onShowError('Please select a JSON backup file.');
        return;
      }
      // Automatically start import when file is selected
      handleImportData(file);
    }
  };

  const handleImportData = async (file: File) => {
    if (!file) {
      onShowError('Please select a backup file first.');
      return;
    }

    try {
      const fileContent = await file.text();

      // Try to import using StorageService
      storageService.importData(fileContent);

      onImportSuccess();

    } catch (error) {
      console.error('Import failed:', error);
      onShowError('Please check the file format and try again.');
      // Reset the file input so user can select the same or different file again
      const input = document.getElementById('backup-file-input') as HTMLInputElement;
      if (input) {
        input.value = '';
      }
    }
  };

  const getStorageSize = () => {
    let total = 0;
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('tempo-')) {
        total += localStorage[key].length;
      }
    }
    return (total / 1024).toFixed(2); // KB
  };

  const hasStorageData = () => {
    for (const key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key) && key.startsWith('tempo-')) {
        return true;
      }
    }
    return false;
  };
  return (
    <div 
      className={`${MODAL_STYLES.backdrop} transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`${MODAL_STYLES.container} transition-all duration-300 ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } flex flex-col`}>
        {/* Header */}
        <ModalHeader
          icon={Database}
          title="Storage"
          subtitle={`${getStorageSize()} KB`}
          onClose={handleClose}
          actions={
            hasStorageData() && (
              <button
                onClick={() => setShowClearConfirm(true)}
                className="p-2 hover:bg-red-500/30 rounded-full transition-colors text-red-300 hover:text-red-200"
                title="Clear Storage"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )
          }
        />

        {/* Tabs */}
        <div className="bg-black/20 border-b border-white/10">
          <div className="flex">
            <button
              onClick={() => setActiveTab('export')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'export'
                  ? 'text-white bg-white/10 border-b-2 border-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={() => setActiveTab('import')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${
                activeTab === 'import'
                  ? 'text-white bg-white/10 border-b-2 border-blue-400'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <Upload className="w-4 h-4" />
              <span>Import</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className={`${MODAL_STYLES.content} p-6 min-h-[250px] flex-1 flex flex-col justify-center`}>
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-white/80 mt-1 font-medium">
                      Download a file containing all your data.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <Button
                  onClick={exportData}
                  variant="primary"
                  size="sm"
                  icon={Download}
                  className="w-full sm:w-auto !bg-blue-500 hover:!bg-blue-600"
                >
                  Download Backup
                </Button>
              </div>
            </div>
          )}

          {activeTab === 'import' && (
            <div className="space-y-6">
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-red-300 font-medium mt-1">
                      This action will replace all your current data and it cannot be undone.
                    </p>
                  </div>
                </div>
              </div>

              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
                id="backup-file-input"
              />
              <div className="flex justify-center">
                <Button
                  onClick={() => {
                  const input = document.getElementById('backup-file-input') as HTMLInputElement;
                  input?.click();
                  }}
                  variant="primary"
                  size="sm"
                  icon={Upload}
                  className="w-full sm:w-auto bg-red-500 hover:bg-red-600"
                >
                  Upload Backup
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Clear Storage Confirmation Modal */}
        {showClearConfirm && (
          <Modal isOpen={showClearConfirm} onClose={() => setShowClearConfirm(false)}>
            <div className="text-center">
              <Trash2 className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-bold text-white mb-2">Clear Storage</h3>
              <p className="text-sm sm:text-base text-white/80 mb-6">
                This will delete all your data including workouts, settings, achievements, and history.
                <br/>This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearStorage}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-base font-medium transition-colors"
                >
                  Clear All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-base font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};