import React from 'react';

import { IconName } from 'components/kit/Icon';

// Button component props
export interface IButtonProps
  extends Partial<React.HTMLAttributes<HTMLButtonElement>> {
  /**
   * @description The color of the button
   * @example 'primary'
   */
  color?: ButtonColorType;
  /**
   * @description The size of the button
   * @example 'medium'
   * @default 'medium'
   */
  size?: ButtonSizeType;
  /**
   * @description The variant of the button
   * @example 'contained'
   * @default 'contained'
   */
  variant?: ButtonVariantType;
  /**
   * @description The disabled state of the button
   * @example false
   * @default false
   */
  disabled?: boolean;
  /**
   * @description The start icon of the button
   * @example 'add'
   */
  leftIcon?: IconName;
  /**
   * @description The end icon of the button
   * @example 'add'
   */
  rightIcon?: IconName;
  /**
   * @description The full width state of the button
   * @example false
   */
  fullWidth?: boolean;
  /**
   * @description The spacing variant of the button
   * @example 'default'
   * @default 'default'
   */
  horizontalSpacing?: 'default' | 'compact';
}

// Button component size types
export type ButtonSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Button component variants
type ButtonVariantType = 'text' | 'outlined' | 'contained';

// Button component color types
type ButtonColorType =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error'
  | 'warning';
