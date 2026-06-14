/**
 * Query selector shorthand.
 */
export function $(selector, parent = document) {
  return parent.querySelector(selector);
}
