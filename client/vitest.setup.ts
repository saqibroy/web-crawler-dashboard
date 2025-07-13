import '@testing-library/jest-dom';
import { expect, describe, test, vi } from 'vitest';
// @ts-expect-error: Assigning vitest globals to globalThis for test environment
globalThis.expect = expect;
// @ts-expect-error: Assigning vitest globals to globalThis for test environment
globalThis.describe = describe;
// @ts-expect-error: Assigning vitest globals to globalThis for test environment
globalThis.test = test;
// @ts-expect-error: Assigning vitest globals to globalThis for test environment
globalThis.vi = vi;