import { useState, useEffect, useCallback } from 'react';
import { getStorageItem, setStorageItem } from '../utils';

const STORAGE_KEY = 'vibr_usage';
const FREE_TIER_LIMIT = 10;

interface UsageData {
  count: number;
  month: number;
  year: number;
}

interface UseUsageTrackingReturn {
  usedCount: number;
  remainingCount: number;
  limit: number;
  isLimitReached: boolean;
  incrementUsage: () => void;
  resetUsage: () => void;
}

function getCurrentMonthYear(): { month: number; year: number } {
  const now = new Date();
  return {
    month: now.getMonth(),
    year: now.getFullYear(),
  };
}

function getUsageData(): UsageData {
  const { month, year } = getCurrentMonthYear();
  const defaultData: UsageData = { count: 0, month, year };
  const stored = getStorageItem<UsageData>(STORAGE_KEY, defaultData);

  // If different month/year, reset
  if (stored.month !== month || stored.year !== year) {
    return defaultData;
  }

  return stored;
}

export function useUsageTracking(): UseUsageTrackingReturn {
  const [usageData, setUsageData] = useState<UsageData>(getUsageData);

  // Check if month has changed on mount and periodically
  useEffect(() => {
    const checkMonth = () => {
      const { month, year } = getCurrentMonthYear();
      if (usageData.month !== month || usageData.year !== year) {
        const newData = { count: 0, month, year };
        setUsageData(newData);
        setStorageItem(STORAGE_KEY, newData);
      }
    };

    // Check on mount
    checkMonth();

    // Check every minute in case user leaves tab open across month boundary
    const interval = setInterval(checkMonth, 60000);
    return () => clearInterval(interval);
  }, [usageData.month, usageData.year]);

  const incrementUsage = useCallback(() => {
    setUsageData((prev) => {
      const newData = { ...prev, count: prev.count + 1 };
      setStorageItem(STORAGE_KEY, newData);
      return newData;
    });
  }, []);

  const resetUsage = useCallback(() => {
    const { month, year } = getCurrentMonthYear();
    const newData = { count: 0, month, year };
    setUsageData(newData);
    setStorageItem(STORAGE_KEY, newData);
  }, []);

  return {
    usedCount: usageData.count,
    remainingCount: Math.max(0, FREE_TIER_LIMIT - usageData.count),
    limit: FREE_TIER_LIMIT,
    isLimitReached: usageData.count >= FREE_TIER_LIMIT,
    incrementUsage,
    resetUsage,
  };
}
