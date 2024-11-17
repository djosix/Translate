import { useState, useRef, useEffect } from "react";
import { getViewportBounds, clamp } from "../utils";
import { MouseSelection, Placement } from "../types";

export default function TooltipDialog({
  mouseSelection,
  translatedText,
  onDialogClose,
}: {
  mouseSelection: MouseSelection;
  translatedText: string;
  onDialogClose: () => void;
}) {
  const [layout, setLayout] = useState({
    width: "auto",
    left: "initial",
    top: "initial",
  });
  const [isReady, setIsReady] = useState(false);
  const [closeButtonState, setCloseButtonState] = useState(0);

  const ref = useRef<HTMLDivElement>(null);

  // Calculate the dialog dimensions and position
  useEffect(() => {
    if (!ref.current) {
      return;
    }
    // Adjust the aspect ratio based on the text content
    for (let i = 0; i < 5; i++) {
      const rect = ref.current.getBoundingClientRect();
      if (rect.width < 3 * rect.height) {
        break;
      }
      const newWidth = `${rect.width * 0.8}px`;
      ref.current.style.width = newWidth; // update dimensions immediately
      setLayout((o) => ({ ...o, width: newWidth }));
    }
    // Position the dialog based on the dimensions and the mouse selection
    {
      const placement = computeDialogPlacement(mouseSelection);
      const rect = ref.current.getBoundingClientRect();
      const bounds = getViewportBounds(6);
      const dialogX = clamp(
        placement.x - rect.width / 2,
        bounds.maxLeft,
        bounds.maxRight - rect.width,
      );
      const dialogY = clamp(
        placement.upwards ? placement.y - rect.height - 2 : placement.y + 2,
        bounds.maxTop,
        bounds.maxBottom - rect.height,
      );
      setLayout((o) => ({ ...o, left: `${dialogX}px`, top: `${dialogY}px` }));
    }
    setIsReady(true);
  }, [mouseSelection, translatedText]);

  return (
    <div
      ref={ref}
      style={{
        width: layout.width,
        maxWidth: "80vw",
        position: "absolute",
        left: layout.left,
        top: layout.top,
        backgroundColor: "white",
        color: "black",
        padding: "10px 14px",
        borderRadius: "6px",
        boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.4)",
        zIndex: "2147483647",
        transition: "opacity 0.5s ease",
        fontSize: "14px",
        fontFamily: "Arial, sans-serif",
        opacity: isReady ? "1" : "0",
        visibility: "visible",
      }}
    >
      <div
        style={{
          fontSize: "12px",
          fontFamily: "Arial, sans-serif",
          color: "#888",
          display: "flex",
          justifyContent: "space-between",
          userSelect: "none",
          marginBottom: "8px",
        }}
      >
        <div
          style={{
            fontSize: "12px",
            marginRight: "16px",
            fontFamily: "Arial, sans-serif",
          }}
        >
          Translate
        </div>
        <div
          style={{
            marginLeft: "auto",
            cursor: "pointer",
            fontSize: "12px",
            width: "12px",
            height: "12px",
            borderRadius: "10%",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            backgroundColor: ["inherit", "#dedede", "#c0c0c0"][
              closeButtonState
            ],
          }}
          onMouseOver={() => setCloseButtonState(1)}
          onMouseLeave={() => setCloseButtonState(0)}
          onMouseDown={() => setCloseButtonState(2)}
          onMouseUp={() => setCloseButtonState(1)}
          onClick={onDialogClose}
        >
          &times;
        </div>
      </div>
      <div
        style={{
          fontSize: "14px",
          fontFamily: "Arial, sans-serif",
          overflow: "scroll",
          maxHeight: "50vh",
        }}
      >
        {translatedText}
      </div>
    </div>
  );
}

function computeDialogPlacement(mouseSelection: MouseSelection): Placement {
  const {
    selection: { rect, offset },
    event: { pageX, pageY },
  } = mouseSelection;

  let x = pageX,
    y = pageY,
    upwards = false;
  if (rect !== null) {
    upwards =
      Math.abs(pageY - (rect.top + offset.y)) <
      Math.abs(pageY - (rect.bottom + offset.y));
    x = (rect.left + rect.right) / 2 + offset.x;
    y = (upwards ? rect.top : rect.bottom) + offset.y;
  }
  return {
    x: x,
    y: y,
    upwards: upwards,
  };
}
