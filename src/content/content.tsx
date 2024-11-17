import { background } from "../utils/interaction";
import { Settings } from "../background/types";
import { createTooltip } from "./tooltip";
import { TooltipHandle } from "./types";

const translate = async (text: string) => {
  const response: {
    result: string;
  } = await background({ action: "translate", text });
  return response.result;
};

const tooltip = {
  handle: null as TooltipHandle | null,
  enable() {
    if (!this.handle) {
      this.handle = createTooltip(translate);
    }
  },
  disable() {
    if (this.handle) {
      this.handle.cleanup();
      this.handle = null;
    }
  },
  hide() {
    if (this.handle) {
      this.handle.hide();
    }
  },
};

background<{ settings: Settings }>({ action: "settings" }).then((response) => {
  if (response.settings.enableTooltip) {
    tooltip.enable();
  }
});

chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  switch (request.action) {
    case "selection":
      sendResponse({ text: window.getSelection()?.toString().trim() || "" });
      return true;
    case "tooltip":
      if (request.enable) {
        tooltip.enable();
      } else {
        tooltip.disable();
      }
      return false;
    case "popup":
      tooltip.hide();
      return false;
    default:
      return false;
  }
});
