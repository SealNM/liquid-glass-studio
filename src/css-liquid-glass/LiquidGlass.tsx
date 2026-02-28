/**
 * LiquidGlass – a pure-CSS Liquid Glass component for real websites.
 *
 * Instead of rendering via WebGL / Canvas, this component relies on
 * `backdrop-filter`, layered CSS gradients, and pseudo-elements to
 * achieve the glass-material look on any standard HTML element.
 *
 * Usage:
 *   <LiquidGlass variant="frosted" blur={28} borderRadius={20}>
 *     <p>Your content here</p>
 *   </LiquidGlass>
 */

import type { CSSProperties, HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import styles from './LiquidGlass.module.scss';

export type LiquidGlassVariant = 'default' | 'tinted' | 'frosted' | 'dark' | 'vibrant';

export interface LiquidGlassProps extends HTMLAttributes<HTMLDivElement> {
  children?: ReactNode;
  /** Visual variant of the glass material */
  variant?: LiquidGlassVariant;
  /** Blur radius in px (default 24) */
  blur?: number;
  /** Border radius in px (default 24) */
  borderRadius?: number;
  /** Additional inline style overrides */
  style?: CSSProperties;
}

export function LiquidGlass({
  children,
  variant = 'default',
  blur,
  borderRadius,
  className,
  style,
  ...rest
}: LiquidGlassProps) {
  const vars: CSSProperties = { ...style };
  if (blur !== undefined) (vars as Record<string, string>)['--lg-blur'] = `${blur}px`;
  if (borderRadius !== undefined) (vars as Record<string, string>)['--lg-radius'] = `${borderRadius}px`;

  return (
    <div
      className={clsx(
        styles.liquidGlass,
        variant !== 'default' && styles[variant],
        className,
      )}
      style={vars}
      {...rest}
    >
      <div className={styles.liquidGlassContent}>{children}</div>
    </div>
  );
}
