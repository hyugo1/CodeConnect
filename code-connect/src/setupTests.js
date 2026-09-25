// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Compatibility shim: the existing test suite was written against Jest's
// global `jest` object (jest.fn(), jest.mock()). Vitest's equivalent is
// `vi`. Aliasing it here lets the pre-existing tests run unmodified under
// Vitest rather than needing every call site rewritten.
import { vi } from 'vitest';
globalThis.jest = vi;
