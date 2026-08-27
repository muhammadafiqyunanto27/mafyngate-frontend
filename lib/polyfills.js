// Polyfills for iOS 12-16 (iPhone XS and similar older devices)
// All iOS browsers use WebKit, so this fixes ALL browsers on the device.

if (typeof window !== 'undefined') {
  // structuredClone - available since iOS 15.4
  if (typeof window.structuredClone === 'undefined') {
    window.structuredClone = function structuredClone(value) {
      return JSON.parse(JSON.stringify(value));
    };
  }

  // Array.prototype.at - available since iOS 15.4
  if (!Array.prototype.at) {
    Array.prototype.at = function at(index) {
      const len = this.length;
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    };
  }

  // String.prototype.at - available since iOS 15.4
  if (!String.prototype.at) {
    String.prototype.at = function at(index) {
      const len = this.length;
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : len + relativeIndex;
      if (k < 0 || k >= len) return undefined;
      return this[k];
    };
  }

  // Object.hasOwn - available since iOS 15.4
  if (!Object.hasOwn) {
    Object.hasOwn = function hasOwn(obj, prop) {
      return Object.prototype.hasOwnProperty.call(obj, prop);
    };
  }

  // Array.prototype.findLast - available since iOS 15.4
  if (!Array.prototype.findLast) {
    Array.prototype.findLast = function findLast(callback, thisArg) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (callback.call(thisArg, this[i], i, this)) return this[i];
      }
      return undefined;
    };
  }

  // Array.prototype.findLastIndex - available since iOS 15.4
  if (!Array.prototype.findLastIndex) {
    Array.prototype.findLastIndex = function findLastIndex(callback, thisArg) {
      for (let i = this.length - 1; i >= 0; i--) {
        if (callback.call(thisArg, this[i], i, this)) return i;
      }
      return -1;
    };
  }

  // Array.prototype.toReversed - available since iOS 16.0
  if (!Array.prototype.toReversed) {
    Array.prototype.toReversed = function toReversed() {
      return [...this].reverse();
    };
  }

  // Array.prototype.toSorted - available since iOS 16.0
  if (!Array.prototype.toSorted) {
    Array.prototype.toSorted = function toSorted(compareFn) {
      return [...this].sort(compareFn);
    };
  }

  // Array.prototype.toSpliced - available since iOS 16.0
  if (!Array.prototype.toSpliced) {
    Array.prototype.toSpliced = function toSpliced(start, deleteCount, ...items) {
      const copy = [...this];
      copy.splice(start, deleteCount, ...items);
      return copy;
    };
  }

  // Array.prototype.with - available since iOS 16.0
  if (!Array.prototype.with) {
    Array.prototype.with = function with_(index, value) {
      const copy = [...this];
      const relativeIndex = Number(index);
      const k = relativeIndex >= 0 ? relativeIndex : copy.length + relativeIndex;
      copy[k] = value;
      return copy;
    };
  }

  // Object.groupBy - available since iOS 17.4
  if (!Object.groupBy) {
    Object.groupBy = function groupBy(items, callback) {
      const result = {};
      for (const item of items) {
        const key = callback(item);
        if (key === null || key === undefined) continue;
        if (!(key in result)) result[key] = [];
        result[key].push(item);
      }
      return result;
    };
  }

  // crypto.randomUUID - available since iOS 15.4
  if (typeof crypto !== 'undefined' && !crypto.randomUUID) {
    crypto.randomUUID = function randomUUID() {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
      });
    };
  }

  // AbortSignal.timeout - available since iOS 16.0
  if (typeof AbortSignal !== 'undefined' && !AbortSignal.timeout) {
    AbortSignal.timeout = function timeout(ms) {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), ms);
      return controller.signal;
    };
  }

  // requestIdleCallback - available since iOS 14
  if (typeof window !== 'undefined' && !window.requestIdleCallback) {
    window.requestIdleCallback = function requestIdleCallback(callback, options) {
      const start = Date.now();
      return setTimeout(function() {
        callback({
          didTimeout: false,
          timeRemaining: function() {
            return Math.max(0, 50 - (Date.now() - start));
          }
        });
      }, options && typeof options.timeout === 'number' ? options.timeout : 1);
    };
    window.cancelIdleCallback = function cancelIdleCallback(id) {
      clearTimeout(id);
    };
  }

  // ResizeObserver - available since iOS 13.4 (polyfill for older)
  if (typeof window !== 'undefined' && !window.ResizeObserver) {
    window.ResizeObserver = class ResizeObserver {
      constructor(callback) {
        this.callback = callback;
        this.elements = new Map();
        this.resizeObserver = null;
      }
      observe(el) {
        if (this.elements.has(el)) return;
        const entry = { target: el, contentRect: { width: el.offsetWidth, height: el.offsetHeight, top: 0, left: 0, right: el.offsetWidth, bottom: el.offsetHeight } };
        this.elements.set(el, entry);
        this._check();
      }
      unobserve(el) { this.elements.delete(el); }
      disconnect() { this.elements.clear(); }
      _check() {
        const entries = [];
        this.elements.forEach((entry, el) => {
          const newEntry = { target: el, contentRect: { width: el.offsetWidth, height: el.offsetHeight, top: 0, left: 0, right: el.offsetWidth, bottom: el.offsetHeight } };
          if (newEntry.contentRect.width !== entry.contentRect.width || newEntry.contentRect.height !== entry.contentRect.height) {
            this.elements.set(el, newEntry);
            entries.push(newEntry);
          }
        });
        if (entries.length) this.callback(entries, this);
      }
    };
  }

  // Element.prototype.toggleAttribute - available since iOS 16.4
  if (typeof Element !== 'undefined' && !Element.prototype.toggleAttribute) {
    Element.prototype.toggleAttribute = function toggleAttribute(name, force) {
      if (force !== undefined) {
        return force ? (this.setAttribute(name, ''), true) : (this.removeAttribute(name), false);
      }
      return this.hasAttribute(name) ? (this.removeAttribute(name), false) : (this.setAttribute(name, ''), true);
    };
  }
}
