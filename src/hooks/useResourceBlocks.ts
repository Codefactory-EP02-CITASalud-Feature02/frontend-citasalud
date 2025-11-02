import { useState, useEffect } from 'react';
import { parseLocalDate } from '@/lib/utils';

export interface ResourceBlock {
  id: string;
  resources: string[];
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  reason: string;
  recurrence: 'none' | 'weekly' | 'monthly';
  recurrenceEndDate?: string;
  createdBy: string;
  createdAt: string;
}

const STORAGE_KEY = 'medical-app-resource-blocks';

export const useResourceBlocks = () => {
  const [blocks, setBlocks] = useState<ResourceBlock[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setBlocks(JSON.parse(stored));
      } catch (error) {
        console.error('Error parsing resource blocks:', error);
        setBlocks([]);
      }
    }
  }, []);

  const saveBlocks = (newBlocks: ResourceBlock[]) => {
    setBlocks(newBlocks);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBlocks));
  };

  const addBlock = (block: Omit<ResourceBlock, 'id' | 'createdAt'>) => {
    const newBlock: ResourceBlock = {
      ...block,
      id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
    };
    saveBlocks([...blocks, newBlock]);
    return newBlock;
  };

  const removeBlock = (blockId: string) => {
    saveBlocks(blocks.filter(block => block.id !== blockId));
  };

  const updateBlock = (blockId: string, updates: Partial<ResourceBlock>) => {
    saveBlocks(
      blocks.map(block =>
        block.id === blockId ? { ...block, ...updates } : block
      )
    );
  };

  const isResourceBlocked = (resource: string, date: string, time: string): boolean => {
    const checkDateTime = new Date(`${date}T${time}`);
    const checkDate = parseLocalDate(date);
    
    return blocks.some(block => {
      if (!block.resources.includes(resource)) return false;

      const blockStart = parseLocalDate(block.startDate);
      const blockEnd = parseLocalDate(block.endDate);
      const blockStartDateTime = new Date(`${block.startDate}T${block.startTime}`);
      const blockEndDateTime = new Date(`${block.endDate}T${block.endTime}`);

      // Check if date falls within block period
      if (checkDateTime >= blockStartDateTime && checkDateTime <= blockEndDateTime) {
        return true;
      }

      // Check recurrence
      if (block.recurrence !== 'none' && block.recurrenceEndDate) {
        const recurrenceEnd = parseLocalDate(block.recurrenceEndDate);
        if (checkDate > recurrenceEnd) return false;

        if (block.recurrence === 'weekly') {
          // Check if same day of week and within time range
          if (checkDate.getDay() === blockStart.getDay()) {
            const timeOnly = time;
            return timeOnly >= block.startTime && timeOnly <= block.endTime;
          }
        } else if (block.recurrence === 'monthly') {
          // Check if same day of month and within time range
          if (checkDate.getDate() === blockStart.getDate()) {
            const timeOnly = time;
            return timeOnly >= block.startTime && timeOnly <= block.endTime;
          }
        }
      }

      return false;
    });
  };

  const getBlocksForDateRange = (startDate: string, endDate: string) => {
    return blocks.filter(block => {
      const blockStart = parseLocalDate(block.startDate);
      const blockEnd = parseLocalDate(block.endDate);
      const rangeStart = parseLocalDate(startDate);
      const rangeEnd = parseLocalDate(endDate);

      return (
        (blockStart >= rangeStart && blockStart <= rangeEnd) ||
        (blockEnd >= rangeStart && blockEnd <= rangeEnd) ||
        (blockStart <= rangeStart && blockEnd >= rangeEnd)
      );
    });
  };

  const clearAllBlocks = () => {
    saveBlocks([]);
  };

  return {
    blocks,
    addBlock,
    removeBlock,
    updateBlock,
    isResourceBlocked,
    getBlocksForDateRange,
    clearAllBlocks,
  };
};
