import React from 'react';

import { Icon } from 'components/kit';

import { styled } from 'config/stitches/stitches.config';

import { IButtonProps } from './Button.d';

// function that returns a object with the styles
function getStylesFromColor(
  color: IButtonProps['color'],
  variant: IButtonProps['variant'],
  disabled: boolean | undefined,
) {
  switch (variant) {
    case 'contained':
      return {
        bc: `$${color}${disabled ? 50 : 100}`,
        color: 'white',
        '&:hover': {
          bc: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}120`,
        },
      };
    case 'outlined':
      return {
        bc: 'white',
        color: `$${color}${disabled ? 50 : 100}`,
        bs: '0px 0px 0px 1px',
        '&:hover': {
          backgroundColor: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}20`,
          color: `$${color}120`,
        },
      };
    case 'text':
      return {
        bc: 'white',
        color: `$${color}${disabled ? 50 : 100}`,
        '&:hover': {
          bc: `$${color}10`,
          color: `$${color}110`,
        },
        '&:active': {
          bc: `$${color}20`,
          color: `$${color}120`,
        },
      };
  }
}

const Container = styled('button', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  fontWeight: '$2',
  cursor: 'pointer',
  borderRadius: '$1',
  transition: 'all 0.2s ease-in-out',
  fontSize: '$3',
  variants: {
    size: {
      small: {
        height: '$sizes$1',
        fontSize: '$fontSizes$2',
        p: '0 $space$7',
      },
      medium: {
        height: '$sizes$3',
        p: '0 $space$8',
      },
      large: {
        height: '$sizes$5',
        p: '0 $space$9',
      },
      xLarge: {
        height: '$sizes$7',
        p: '0 $space$11',
      },
    },
    disabled: {
      true: {
        userSelect: 'none',
        cursor: 'not-allowed',
        pointerEvents: 'none',
      },
    },
    startIcon: {
      true: {},
    },
    endIcon: {
      true: {},
    },
    fullWidth: {
      true: {
        width: '100%',
      },
    },
  },
  compoundVariants: [
    {
      startIcon: true,
      css: {
        pl: '0',
      },
    },
    {
      endIcon: true,
      css: {
        pr: '0',
      },
    },
  ],
});

const IconContainer = styled(Icon, {
  size: '$sizes$1',
  display: 'flex',
  jc: 'center',
  ai: 'center',
});

const IconLeft = styled(IconContainer, {
  mr: '$space$2',
  variants: {
    size: {
      small: {
        ml: '$space$3',
      },
      medium: {
        ml: '$space$4',
      },
      large: {
        ml: '$space$5',
      },
      xLarge: {
        ml: '$space$7',
        size: '$sizes$3',
      },
    },
  },
});

const IconRight = styled(IconContainer, {
  ml: '$space$2',
  variants: {
    size: {
      small: {
        mr: '$space$3',
      },
      medium: {
        mr: '$space$4',
      },
      large: {
        mr: '$space$5',
      },
      xLarge: {
        mr: '$space$7',
        size: '$sizes$3',
      },
    },
  },
});

/**
 * @property {IButtonProps['color']} color - color of the button
 * @property {IButtonProps['size']} size - size of the button
 * @property {IButtonProps['variant']} variant - variant of the button
 * @property {IButtonProps['fullWidth']} fullWidth - whether the button should take the full width of its container
 * @property {IButtonProps['disabled']} disabled - whether the button should be disabled
 * @property {IButtonProps['startIcon']} startIcon - icon to be displayed on the left side of the button
 * @property {IButtonProps['endIcon']} endIcon - icon to be displayed on the right side of the button
 * @property {IButtonProps['children']} children - children to be displayed inside the button
 */
function Button({
  color = 'primary',
  size = 'small',
  variant = 'contained',
  fullWidth = false,
  disabled,
  startIcon,
  endIcon,
  children,
  ...rest
}: IButtonProps): React.FunctionComponentElement<React.ReactNode> {
  return (
    <Container
      css={{ ...rest.style, ...getStylesFromColor(color, variant, disabled) }}
      size={size}
      disabled={disabled}
      startIcon={Boolean(startIcon)}
      endIcon={Boolean(endIcon)}
      fullWidth={fullWidth}
      {...rest}
    >
      {startIcon ? (
        <IconLeft size={size} className='startIcon' name={startIcon} />
      ) : null}
      {children}
      {endIcon ? (
        <IconRight size={size} className='endIcon' name={endIcon} />
      ) : null}
    </Container>
  );
}

export default React.memo(Button);
