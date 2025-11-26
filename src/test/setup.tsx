// src/test/setup.tsx
// Add this at the very top of setup.tsx
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;
import '@testing-library/jest-dom';
import { render, RenderOptions } from '@testing-library/react';
import { jest } from '@jest/globals';
import React, { ReactElement, ReactNode } from 'react';
import { MemoryRouter, MemoryRouterProps } from 'react-router-dom';

// Type for the custom render function
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
}

// Mock window.matchMedia
const mockMatchMedia = {
  matches: false,
  media: '',
  onchange: null,
  addListener: jest.fn(),
  removeListener: jest.fn(),
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  dispatchEvent: jest.fn(),
};

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    ...mockMatchMedia,
    media: query,
  })),
});

// Create a mock Link component
const MockLink: React.FC<{ to: string } & React.AnchorHTMLAttributes<HTMLAnchorElement>> = ({ 
  to, 
  children, 
  ...props 
}) => (
  <a href={to} {...props}>
    {children}
  </a>
);

// Create a mock NavLink component
const MockNavLink: React.FC<{
  to: string;
  children: ReactNode;
  className?: string | ((props: { isActive: boolean }) => string);
  style?: React.CSSProperties | ((props: { isActive: boolean }) => React.CSSProperties);
  [key: string]: unknown;
}> = ({ to, children, className, style, ...props }) => {
  const isActive = window.location.pathname === to;
  const activeClass = typeof className === 'function' ? className({ isActive }) : className;
  const activeStyle = typeof style === 'function' ? style({ isActive }) : style;

  return (
    <a
      href={to}
      className={activeClass as string}
      style={activeStyle as React.CSSProperties}
      data-testid={`nav-link-${to}`}
      data-active={isActive}
      {...props}
    >
      {children}
    </a>
  );
};

// Mock useLocation
const mockLocation = {
  pathname: '/',
  search: '',
  hash: '',
  state: null,
  key: 'testKey',
};

// Mock useNavigate
const mockNavigate = jest.fn();

// Mock react-router-dom
// Update the mock in setup.tsx
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom') as typeof import('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => mockLocation,
    Link: MockLink,
    NavLink: MockNavLink,
  };
});

// Custom render function
const customRender = (
  ui: ReactElement,
  { routerProps = {}, ...renderOptions }: CustomRenderOptions = {}
) => {
  const Wrapper: React.FC<{ children: ReactNode }> = ({ children }) => (
    <MemoryRouter {...routerProps}>{children}</MemoryRouter>
  );

  return {
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
    history: { navigate: mockNavigate, location: mockLocation },
  };
};

// Re-export everything
export * from '@testing-library/react';

// Override render method
export { customRender as render };

// Export mocks for testing
export { mockNavigate, mockLocation };