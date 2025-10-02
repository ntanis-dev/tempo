import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { Button } from '../ui/Button';
import { formatWorkoutDateTime } from '../../utils/formatters';

interface WorkoutNotesModalProps {
  isOpen: boolean;
  onClose: () => void;
  workoutId: string;
  initialNotes?: string;
  onSave: (notes: string) => void;
}

export const WorkoutNotesModal: React.FC<WorkoutNotesModalProps> = ({
  isOpen,
  onClose,
  workoutId,
  initialNotes = '',
  onSave
}) => {
  const [notes, setNotes] = useState(initialNotes);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Format the workout date and time
  const { date, time } = workoutId ? formatWorkoutDateTime(Number(workoutId)) : { date: '', time: '' };

  useEffect(() => {
    setNotes(initialNotes);
    setHasUnsavedChanges(false);
  }, [initialNotes, workoutId]);

  // Fade in animation
  useEffect(() => {
    if (isOpen && !isClosing) {
      const timer = setTimeout(() => setIsVisible(true), 50);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, isClosing]);

  const handleSave = () => {
    onSave(notes);
    setHasUnsavedChanges(false);
    // Close without checking for unsaved changes since we just saved
    closeModal();
  };

  const closeModal = () => {
    setIsClosing(true);
    setIsVisible(false);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
      // Reset state after modal is hidden
      setNotes(initialNotes);
      setHasUnsavedChanges(false);
    }, 300);
  };

  const handleClose = () => {
    if (hasUnsavedChanges) {
      const confirmed = window.confirm('You have unsaved changes. Are you sure you want to close?');
      if (!confirmed) return;
    }
    closeModal();
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNotes(e.target.value);
    setHasUnsavedChanges(e.target.value !== initialNotes);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop with immediate blur */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50
                    transition-opacity duration-300 ${
                      isVisible ? 'opacity-100' : 'opacity-0'
                    }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div className={`fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none
                      transition-opacity duration-300 ${
                        isVisible ? 'opacity-100' : 'opacity-0'
                      }`}>
        <div className={`relative bg-gray-900/95 backdrop-blur-md rounded-2xl p-8
                         border border-white/10 shadow-2xl max-w-2xl w-full pointer-events-auto
                         transform transition-all duration-300 ${
                           isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
                         }`}>
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Workout Session Notes</h2>
            {date && time && (
              <p className="text-sm text-white/60 mt-1">{date} • {time}</p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white hover:bg-white/10 rounded-full p-2
                     transition-all duration-200"
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-8">
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="Record details about your workout like weights used, difficulty level, how you felt, or any modifications you made. You can view these notes later in your workout history."
            className="w-full h-64 p-5 bg-black/40 border border-white/10 rounded-xl
                     text-white placeholder-white/40 resize-none outline-none focus:border-teal-500/50
                     focus:bg-black/50 transition-all duration-200 font-sans"
            autoFocus
          />
        </div>

        <div className="flex justify-between items-center">
          <div className="text-sm">
            {hasUnsavedChanges && (
              <span className="text-yellow-400/90 font-medium">
                <span className="inline-block w-2 h-2 bg-yellow-400 rounded-full mr-2 animate-pulse"></span>
                Unsaved Changes
              </span>
            )}
          </div>
          <div className="flex gap-4">
            <Button
              onClick={handleClose}
              variant="ghost"
              size="sm"
              className="min-w-[120px] bg-white/5 hover:bg-white/10 border border-white/10"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              variant="primary"
              size="sm"
              icon={Save}
              className="min-w-[140px] bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800
                       disabled:from-gray-600 disabled:to-gray-700 disabled:opacity-50"
              disabled={!hasUnsavedChanges}
            >
              Save
            </Button>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};