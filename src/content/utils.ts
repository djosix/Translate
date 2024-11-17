import { Selection } from "./types";

export function getTextSelection(): Selection {
  // Current page scroll offset
  const offset = {
    x: window.scrollX,
    y: window.scrollY,
  };

  // Check if user is selecting text in an input field
  const activeElement = document.activeElement;
  if (activeElement === null) {
    console.error("Failed to get active element.");
    return {
      text: "",
      rect: null,
      offset,
    };
  }
  if (
    activeElement.tagName === "TEXTAREA" ||
    (activeElement.tagName === "INPUT" &&
      /^(text|password|search|tel|url|email)$/.test(
        (activeElement as HTMLInputElement).type,
      )) ||
    (activeElement.hasAttribute("contenteditable") &&
      activeElement.getAttribute("contenteditable") === "true")
  ) {
    const inputElement = activeElement as
      | HTMLInputElement
      | HTMLTextAreaElement;
    return {
      text: inputElement.value.substring(
        inputElement.selectionStart!,
        inputElement.selectionEnd!,
      ),
      rect: activeElement.getBoundingClientRect(),
      offset,
    };
  }

  // User is selecting text in the page
  const selection = window.getSelection();
  if (selection === null) {
    console.error("Failed to get text selection.");
    return {
      text: "",
      rect: null,
      offset,
    };
  }
  return {
    text: selection.toString().trim(),
    rect:
      selection.rangeCount > 0
        ? selection.getRangeAt(0).getBoundingClientRect()
        : null,
    offset,
  };
}

export function getViewportBounds(padSize: number) {
  return {
    maxLeft: window.scrollX + padSize,
    maxRight: window.scrollX + window.innerWidth - padSize,
    maxTop: window.scrollY + 4,
    maxBottom: window.scrollY + window.innerHeight - padSize,
  };
}

// export function getPageBounds() {
//   const padSize = 4;
//   return {
//     maxLeft: 0 + padSize,
//     maxRight: document.documentElement.scrollWidth - padSize,
//     maxTop: 0 + padSize,
//     maxBottom: document.documentElement.scrollHeight - padSize,
//   };
// }

export function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
