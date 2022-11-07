import React from 'react';

import { styled } from 'config/stitches/stitches.config';

import { IButtonProps } from '../Button';

const Container = styled('div', {
  all: 'unset',
  display: 'inline-flex',
  width: 'fit-content',
  ai: 'center',
  jc: 'center',
  br: '$3',
  fontWeight: '$2',
  overflow: 'hidden',
  p: '1px',
  '& > button': {
    br: '0',
    bs: 'none',
    '&:not(:first-of-type)': {
      borderLeft: '1px solid',
    },
    '&:first-of-type': {
      borderTopLeftRadius: '$2',
      borderBottomLeftRadius: '$2',
    },
    '&:last-of-type': {
      borderTopRightRadius: '$2',
      borderBottomRightRadius: '$2',
    },
  },
  variants: {
    variant: {
      outlined: {
        bs: 'inset 0 0 0 1px',
      },
    },
  },
});

const ButtonGroup = React.forwardRef<
  React.ElementRef<typeof Container>,
  IButtonProps
>(({ color, children, ...rest }: any, forwardedRef) => {
  const childrenWIthProps = React.Children.map(children, (child) => {
    return React.cloneElement(child, {
      color,
      ...rest,
    });
  });

  return (
    <Container
      {...rest}
      ref={forwardedRef}
      variant={rest.variant}
      css={{
        color: `$${color}50`,
        '& > button': {
          borderColor: `$colors$${color}50 !important`,
        },
      }}
    >
      {childrenWIthProps}
    </Container>
  );
});

export default ButtonGroup;
