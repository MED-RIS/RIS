import React from 'react';

export const Header = () => null;
export const Onboarding = () => null;

export const toast = {
  success: (msg) => console.log('Toast success:', msg),
  error: (msg) => console.error('Toast error:', msg),
  info: (msg) => console.info('Toast info:', msg),
};

export const useModal = () => ({
  show: (modalComponent) => console.log('Show modal:', modalComponent),
  hide: () => console.log('Hide modal'),
});
