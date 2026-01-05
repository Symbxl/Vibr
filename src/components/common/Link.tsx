import { forwardRef, memo, type AnchorHTMLAttributes } from 'react';
import { classNames } from '../../utils';
import styles from './Link.module.css';

type LinkVariant = 'default' | 'subtle' | 'underline';

interface LinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: LinkVariant;
  isExternal?: boolean;
  testId?: string;
}

export const Link = memo(
  forwardRef<HTMLAnchorElement, LinkProps>(function Link(
    {
      children,
      variant = 'default',
      isExternal = false,
      className,
      testId,
      href,
      ...props
    },
    ref
  ) {
    // Security: Always use noopener and noreferrer for external links
    const externalProps = isExternal
      ? {
          target: '_blank',
          rel: 'noopener noreferrer',
        }
      : {};

    return (
      <a
        ref={ref}
        href={href}
        data-testid={testId}
        className={classNames(styles.link, styles[variant], className)}
        {...externalProps}
        {...props}
      >
        {children}
        {isExternal && (
          <span className={styles.externalIcon} aria-hidden="true">
            <svg
              width="12"
              height="12"
              viewBox="0 0 12 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3.5 1H11M11 1V8.5M11 1L1 11"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        )}
        <span className="visually-hidden">
          {isExternal && ' (opens in new tab)'}
        </span>
      </a>
    );
  })
);

Link.displayName = 'Link';
