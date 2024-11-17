import React from "react";
import ReactDOM from "react-dom/client";
import Tooltip from "./components/Tooltip";
import { TooltipHandle, MouseSelection, Selection } from "./types";
import { getTextSelection } from "./utils";

export function createTooltip(
  translateFn: (text: string) => Promise<string>,
): TooltipHandle {
  // Create a shadow DOM container to isolate page styles
  const container = (function () {
    const container = document.createElement("div");
    container.style.width = "0";
    container.style.height = "0";
    container.style.visibility = "hidden";
    return container;
  })();

  const shadowRoot = container.attachShadow({ mode: "open" });

  // Inject styles into the shadow DOM
  shadowRoot.appendChild(
    (function () {
      const style = document.createElement("style");
      style.innerHTML = [
        // Reset all styles that the shadow DOM might inherit to their initial values
        `:host {
            font-family: initial;
            font-size: initial;
            font-style: initial;
            font-variant: initial;
            font-weight: initial;
            letter-spacing: initial;
            word-spacing: initial;
            line-height: initial;
            color: initial;
            text-align: initial;
            text-indent: initial;
            text-transform: initial;
            white-space: initial;
            direction: initial;
            unicode-bidi: initial;
            list-style: initial;
            list-style-image: initial;
            list-style-position: initial;
            list-style-type: initial;
            border-collapse: initial;
            border-spacing: initial;
            caption-side: initial;
            empty-cells: initial;
            quotes: initial;
          }`,
        // Add a CSS animation for the loading spinner
        `@keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }`,
      ]
        .join("")
        .replace(/\s+/g, " ");
      return style;
    })(),
  );

  document.body.appendChild(container);

  interface TooltipMethods {
    setMouseSelection: (selection: Selection, event: MouseEvent) => void;
    setTranslationResult: (text: string) => void;
    reset: () => void;
  }

  const TooltipWrapper = React.forwardRef((_, ref) => {
    const [mouseSelection, setMouseSelection] =
      React.useState<MouseSelection | null>(null);
    const [translatedText, setTranslatedText] = React.useState<string | null>(
      null,
    );

    const reset = () => {
      setMouseSelection(null);
      setTranslatedText(null);
    };

    React.useImperativeHandle<unknown, TooltipMethods>(ref, () => ({
      setMouseSelection: (selection: Selection, event: MouseEvent) => {
        setMouseSelection({ selection, event });
      },
      setTranslationResult: (text: string) => {
        setTranslatedText(text);
      },
      reset,
    }));

    return (
      <Tooltip
        mouseSelection={mouseSelection}
        translatedText={translatedText}
        onButtonClick={async () => {
          const result = await translateFn(mouseSelection!.selection.text);
          setTranslatedText(result);
        }}
        onDialogClose={() => reset()}
      />
    );
  });

  const tooltipRef = React.createRef<TooltipMethods>();

  const reactRoot = ReactDOM.createRoot(shadowRoot);
  reactRoot.render(<TooltipWrapper ref={tooltipRef} />);

  function isInsideShadow(e: MouseEvent) {
    return e
      .composedPath()
      .some((node) => (node as Element).shadowRoot === shadowRoot);
  }

  let lastShowButtonTime = 0;

  async function documentMouseUpHandler(e: MouseEvent) {
    if (isInsideShadow(e)) {
      return;
    }
    if (Date.now() - lastShowButtonTime < 100) {
      return;
    }

    // Wait for the selection to be updated
    await new Promise((resolve) => setTimeout(resolve, 1));

    const selection = getTextSelection();
    if (selection.text.length === 0) {
      return;
    }

    tooltipRef.current!.setMouseSelection(selection, e);

    lastShowButtonTime = Date.now();
  }

  function documentMouseDownHandler(e: MouseEvent) {
    if (isInsideShadow(e)) {
      return;
    }
    tooltipRef.current!.reset();
  }

  document.addEventListener("mouseup", documentMouseUpHandler);
  document.addEventListener("mousedown", documentMouseDownHandler);

  return {
    hide() {
      tooltipRef.current!.reset();
    },
    cleanup() {
      document.removeEventListener("mouseup", documentMouseUpHandler);
      document.removeEventListener("mousedown", documentMouseDownHandler);

      reactRoot.unmount();
      container.remove();
    },
  };
}
