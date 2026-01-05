import { memo, type ReactElement } from 'react';
import { classNames } from '../../utils';
import styles from './Spinner.module.css';

type SpinnerSize = 'sm' | 'md' | 'lg';

interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
  testId?: string;
}

export const Spinner = memo(function Spinner({
  size = 'md',
  label = 'Loading...',
  className,
  testId,
}: SpinnerProps): ReactElement {
  return (
    <div
      className={classNames(styles.spinner, styles[size], className)}
      role="status"
      aria-label={label}
      data-testid={testId}
    >
      <svg
        className={styles.icon}
        viewBox="0 0 50 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <circle
          className={styles.track}
          cx="25"
          cy="25"
          r="20"
          strokeWidth="4"
        />
        <circle
          className={styles.progress}
          cx="25"
          cy="25"
          r="20"
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
      <span className="visually-hidden">{label}</span>
    </div>
  );
});

Spinner.displayName = 'Spinner';
