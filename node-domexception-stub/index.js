// Native DOMException stub to suppress the deprecated node-domexception warning.
// Since modern Node.js has a built-in global DOMException, we can directly export it.
module.exports = globalThis.DOMException || class DOMException extends Error {
  constructor(message, name) {
    super(message);
    this.name = name || 'DOMException';
  }
};
