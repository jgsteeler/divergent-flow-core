// Custom Jest environment that disables localStorage to avoid
// "Cannot initialize local storage without a `--localstorage-file` path" error
// See: https://github.com/facebook/jest/issues/14267

const NodeEnvironment = require('jest-environment-node').TestEnvironment;

class CustomEnvironment extends NodeEnvironment {
  constructor(config, context) {
    super(config, context);
    
    // Override the global object BEFORE jest-environment-node tries to access localStorage
    // This prevents the "Cannot initialize local storage" error
    if (this.global) {
      Object.defineProperty(this.global, 'localStorage', {
        value: undefined,
        writable: false,
        configurable: true,
      });
      Object.defineProperty(this.global, 'sessionStorage', {
        value: undefined,
        writable: false,
        configurable: true,
      });
    }
  }
}

module.exports = CustomEnvironment;
