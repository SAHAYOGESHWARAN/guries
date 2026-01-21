import '@testing-library/jest-dom';

// Polyfills or global mocks can be added here if needed
// Example: set navigator.clipboard for tests that call clipboard
if (typeof navigator !== 'undefined' && !navigator.clipboard) {
  // @ts-ignore
  navigator.clipboard = {
    writeText: async () => Promise.resolve()
  };
}

// Prevent jsdom navigation error when tests trigger anchor clicks (e.g., file downloads)
// Make anchor click a no-op in the test environment.
if (typeof window !== 'undefined') {
  // @ts-ignore
  HTMLAnchorElement.prototype.click = function () { /* no-op for tests */ };
}

// Ensure URL.createObjectURL and revokeObjectURL exist in jsdom environment
if (typeof global !== 'undefined') {
  // @ts-ignore
  if (!global.URL) {
    // @ts-ignore
    global.URL = {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: () => {}
    };
  } else {
    // @ts-ignore
    global.URL.createObjectURL = global.URL.createObjectURL || (() => 'blob:mock');
    // @ts-ignore
    global.URL.revokeObjectURL = global.URL.revokeObjectURL || (() => {});
  }
}
