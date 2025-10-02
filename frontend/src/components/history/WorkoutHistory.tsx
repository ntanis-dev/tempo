import React from 'react';
import { Calendar, Clock, Target, Dumbbell, Timer, Eraser, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkoutHistoryEntry } from '../../types';
import { ModalHeader } from '../ui/ModalHeader';
import { Modal } from '../ui/Modal';
import { WorkoutNotesModal } from '../complete/WorkoutNotesModal';
import { formatDuration, getTotalWorkoutTime, formatRelativeDate, formatTimeOfDay } from '../../utils/formatters';
import { MODAL_STYLES } from '../../constants/styles';
import { storageService } from '../../services/StorageService';

interface WorkoutHistoryProps {
  history: WorkoutHistoryEntry[];
  onClose: () => void;
  onClearHistory: () => void;
  onShowSuccess: (title: string, message?: string) => void;
}

export const WorkoutHistory: React.FC<WorkoutHistoryProps> = ({ history, onClose, onClearHistory, onShowSuccess }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  const [localHistory, setLocalHistory] = React.useState(history);
  const [hoveredLatest, setHoveredLatest] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const [showNotesModal, setShowNotesModal] = React.useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = React.useState<string>('');

  // Pagination state
  const ITEMS_PER_PAGE = 5;
  const [currentPage, setCurrentPage] = React.useState(0);

  // Calculate pagination
  const totalPages = Math.ceil(localHistory.length / ITEMS_PER_PAGE);
  const startIndex = currentPage * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const visibleHistory = localHistory.slice(startIndex, endIndex);

  // const handleBackdropClick = useModalBackdrop(onClose);

  // Update local history when prop changes
  React.useEffect(() => {
    setLocalHistory(history);
    setCurrentPage(0); // Reset to first page when history changes
  }, [history]);

  // Fade in animation
  React.useEffect(() => {
    if (isVisible === false && isClosing === false) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    }
  }, [isVisible, isClosing]);

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

  const handleClearHistory = () => {
    onClearHistory();
    setLocalHistory([]);
    setShowConfirm(false);
    onShowSuccess('History Cleared', 'Your workout history has been cleared.');
  };

  const handleOpenNotes = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setShowNotesModal(true);
  };

  const handleSaveNotes = (notes: string) => {
    if (selectedWorkoutId) {
      storageService.saveWorkoutNotes(selectedWorkoutId, notes);
      onShowSuccess('Notes Saved', 'Your workout notes have been saved.');
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages - 1) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
      setCurrentPage(prev => prev - 1);
    }
  };

  return (
    <div 
      className={`${MODAL_STYLES.backdrop} transition-opacity duration-300 ${
        isVisible && !isClosing ? 'opacity-100' : 'opacity-0'
      }`}
      onClick={handleBackdropClickWithFade}
    >
      <div className={`${MODAL_STYLES.container} transition-all duration-300 transform ${
        isVisible && !isClosing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      }`}>
        {/* Header */}
        <ModalHeader
          icon={Calendar}
          title="History"
          onClose={handleClose}
          actions={
            localHistory.length > 0 && (
              <button
                onClick={() => setShowConfirm(true)}
                className="p-2 hover:bg-red-500/30 rounded-full transition-colors text-red-300 hover:text-red-200"
                title="Clear History"
              >
                <Eraser className="w-5 h-5" />
              </button>
            )
          }
        />

        {/* Content */}
        <div className={`${MODAL_STYLES.content} rounded-b-2xl flex flex-col`}>
          {localHistory.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-white/70">
              <Dumbbell className="w-16 h-16 mb-4 text-white/50" />
              <p className="text-white/80">Complete your first workout to see it here!</p>
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {visibleHistory.map((entry, index) => (
                <div
                  key={entry.id}
                  className="bg-white/10 rounded-xl p-4 transition-colors border border-white/20"
                >
                  {/* Date and Time */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-white/70" />
                      <span className="font-semibold text-white text-sm sm:text-base">{formatRelativeDate(entry.date)}</span>
                      <span className="text-white/70 text-sm sm:text-base">at {formatTimeOfDay(entry.date)}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {/* Notes button */}
                      <button
                        onClick={() => handleOpenNotes(entry.id)}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/70 hover:text-white"
                        title={storageService.getWorkoutNotes(entry.id) ? "View/Edit Notes" : "Add Notes"}
                      >
                        <FileText className={`w-4 h-4 ${storageService.getWorkoutNotes(entry.id) ? 'text-teal-400' : ''}`} />
                      </button>
                      {index === 0 && (
                        <div
                          className="relative"
                          onMouseEnter={() => setHoveredLatest(true)}
                          onMouseLeave={() => setHoveredLatest(false)}
                        >
                          <Clock className="w-5 h-5 text-blue-400" />
                          {hoveredLatest && (
                            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none">
                              <div className="bg-black/90 text-white text-xs rounded-lg px-2 py-1 whitespace-nowrap">
                                Latest
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black/90"></div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Workout Summary */}
                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Target className="w-4 h-4 text-green-600" />
                        <span className="text-lg font-bold text-green-600">{entry.totalSets}</span>
                      </div>
                      <div className="text-xs text-white/70">{entry.totalSets === 1 ? 'Set' : 'Sets'}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Dumbbell className="w-4 h-4 text-teal-600" />
                        <span className="text-lg font-bold text-teal-600">{entry.repsPerSet}</span>
                      </div>
                      <div className="text-xs text-white/70">{entry.repsPerSet === 1 ? 'Rep / Set' : 'Reps / Set'}</div>
                    </div>
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <Timer className="w-4 h-4 text-red-600" />
                        <span className="text-lg font-bold text-red-600">{entry.timePerRep}s</span>
                      </div>
                      <div className="text-xs text-white/70">Per Rep</div>
                    </div>
                  </div>

                  {/* Time Breakdown */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs">
                    <div className="text-center p-2 bg-amber-500/20 rounded-lg">
                      <div className="font-semibold text-amber-300">{formatDuration(entry.statistics?.totalTimeStretched || 0)}</div>
                      <div className="text-amber-400">Stretched</div>
                    </div>
                    <div className="text-center p-2 bg-red-500/20 rounded-lg">
                      <div className="font-semibold text-red-300">{formatDuration(entry.statistics?.totalTimeExercised || 0)}</div>
                      <div className="text-red-400">Exercised</div>
                    </div>
                    <div className="text-center p-2 bg-blue-500/20 rounded-lg">
                      <div className="font-semibold text-blue-300">{formatDuration(entry.statistics?.totalTimeRested || 0)}</div>
                      <div className="text-blue-400">Rested</div>
                    </div>
                    <div className="text-center p-2 bg-white/10 rounded-lg">
                      <div className="font-semibold text-white/90">{formatDuration(entry.statistics?.totalTimePaused || 0)}</div>
                      <div className="text-white/70">Paused</div>
                    </div>
                    <div className="text-center p-2 bg-green-500/20 rounded-lg col-span-2 sm:col-span-1">
                      <div className="font-semibold text-green-300">{formatDuration(getTotalWorkoutTime(entry.statistics))}</div>
                      <div className="text-green-400">Total</div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between pt-4 pb-2 px-2">
                  <button
                    onClick={handlePrevPage}
                    disabled={currentPage === 0}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                             transition-all duration-200 border border-white/20
                             disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <div className="text-center text-white/70 text-sm font-medium">
                    {currentPage + 1} / {totalPages}
                  </div>

                  <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages - 1}
                    className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg
                             transition-all duration-200 border border-white/20
                             disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirm && (
          <Modal isOpen={showConfirm} onClose={() => setShowConfirm(false)}>
            <div className="text-center">
              <Eraser className="w-12 h-12 mx-auto mb-4 text-red-500" />
              <h3 className="text-lg font-bold text-white mb-2">Clear History</h3>
              <p className="text-sm sm:text-base text-white/80 mb-6">
                This will delete your workout history.
                <br/>This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={handleClearHistory}
                  className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white text-base font-medium transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-base font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Modal>
        )}

        {/* Notes Modal */}
        {showNotesModal && (
          <WorkoutNotesModal
            isOpen={showNotesModal}
            onClose={() => setShowNotesModal(false)}
            workoutId={selectedWorkoutId}
            initialNotes={storageService.getWorkoutNotes(selectedWorkoutId)}
            onSave={handleSaveNotes}
          />
        )}
      </div>
    </div>
  );
};