import type { WebVitalsCallback } from '../types';

type ReportHandler = (metric: {
  name: string;
  delta: number;
  value: number;
  id: string;
  rating: 'good' | 'needs-improvement' | 'poor';
  navigationType: string;
}) => void;

export function reportWebVitals(onPerfEntry?: WebVitalsCallback): void {
  if (onPerfEntry && typeof onPerfEntry === 'function') {
    import('web-vitals').then(({ onCLS, onFCP, onLCP, onTTFB, onINP }) => {
      onCLS(onPerfEntry as ReportHandler);
      onFCP(onPerfEntry as ReportHandler);
      onLCP(onPerfEntry as ReportHandler);
      onTTFB(onPerfEntry as ReportHandler);
      onINP(onPerfEntry as ReportHandler);
    });
  }
}
