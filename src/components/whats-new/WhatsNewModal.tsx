import React, { useState } from 'react';
import { Sparkles, Plus, Settings, Palette } from 'lucide-react';
import { ModalHeader } from '../ui/ModalHeader';
import { MODAL_STYLES } from '../../constants/styles';

interface UpdateEntry {
  version: string;
  date: string;
  title: string;
  changes: {
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    text: string;
  }[];
}

const update: UpdateEntry = {
  version: '1.6.1',
  date: 'September 19, 2025',
  title: 'Timer Accuracy & Stability Improvements',
  changes: [
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Fixed total workout time to accurately sum all tracked phases.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Improved timer accuracy and phase transition handling.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Fixed React initialization warnings and console cleanup.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Migrated to centralized StorageService for better reliability.'
    },
    {
      icon: Settings,
      color: 'text-orange-400',
      text: 'Fixed debug mode toggle persistence after storage clear.'
    }
  ]
};
