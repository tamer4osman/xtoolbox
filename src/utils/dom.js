/**
 * Apply special attribute handlers
 */
const ATTR_HANDLERS = {
  className: (el, value) => (el.className = value),
  innerHTML: (el, value) => (el.innerHTML = value),
  textContent: (el, value) => (el.textContent = value),
  style: (el, value) => {
    if (value && typeof value === 'object') {
      Object.assign(el.style, value);
    } else if (typeof value === 'string') {
      el.style.cssText = value;
    }
  },
  dataset: (el, value) => {
    if (value && typeof value === 'object') {
      Object.assign(el.dataset, value);
    }
  },
};

function handleAttribute(el, key, value) {
  if (typeof ATTR_HANDLERS[key] === 'function') {
    ATTR_HANDLERS[key](el, value);
  } else if (key.startsWith('on')) {
    el.addEventListener(key.slice(2).toLowerCase(), value);
  } else {
    el.setAttribute(key, value);
  }
}

function setAttributes(el, attrs) {
  for (const [key, value] of Object.entries(attrs)) {
    handleAttribute(el, key, value);
  }
}

export function createElement(tag, attrs = {}, children = []) {
  const el = document.createElement(tag);
  setAttributes(el, attrs);
  if (typeof children === 'string') {
    el.textContent = children;
  } else if (Array.isArray(children)) {
    children.forEach(child => {
      if (typeof child === 'string') {
        el.appendChild(document.createTextNode(child));
      } else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }
  return el;
}

/**
 * Query selector shorthand
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}

export function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
