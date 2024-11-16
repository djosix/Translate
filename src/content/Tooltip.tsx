import { Placement, MouseSelection } from "./types";
import { useState, createRef } from "react";

export default function Tooltip({
  mouseSelection,
  translatedText,
  onButtonClick,
  onDialogClose,
}: {
  mouseSelection: MouseSelection | null;
  translatedText: string | null;
  onButtonClick: () => void;
  onDialogClose: () => void;
}) {
  if (!mouseSelection) {
    return null;
  }

  if (translatedText !== null) {
    return (
      <TooltipDialog
        mouseSelection={mouseSelection}
        translatedText={translatedText}
        onDialogClose={onDialogClose}
      />
    );
  }

  return (
    <TooltipButton
      mouseSelection={mouseSelection}
      onButtonClick={onButtonClick}
    />
  );
}

function TooltipButton({
  mouseSelection,
  onButtonClick,
}: {
  mouseSelection: MouseSelection;
  onButtonClick: () => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [width, height] = [26, 26];
  const placement = computeButtonPlacement(mouseSelection);
  const bounds = getViewportBounds(4);
  const buttonX = clamp(
    placement.x - width / 2,
    bounds.maxLeft,
    bounds.maxRight - width,
  );
  const buttonY = clamp(
    placement.upwards ? placement.y - height : placement.y,
    bounds.maxTop,
    bounds.maxBottom - height,
  );

  return (
    <button
      type="button"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        borderRadius: "5px",
        backgroundColor: isHovered ? "#fefefe" : "#fafafa",
        position: "absolute",
        left: `${buttonX}px`,
        top: `${buttonY}px`,
        boxShadow: isHovered
          ? "0px 3px 6px rgba(0, 0, 0, 0.2)"
          : "0px 2px 4px rgba(0, 0, 0, 0.2)",
        color: "#888",
        fontSize: "12px",
        cursor: "pointer",
        textAlign: "center",
        lineHeight: `${height}px`,
        zIndex: "2147483647",
        boxSizing: "border-box",
        fontFamily: "Arial, sans-serif",
        padding: "0",
        border: "0",
        visibility: "visible",
      }}
      disabled={isLoading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => {
        setIsLoading(true);
        onButtonClick();
      }}
    >
      {isLoading ? (
        <div
          style={{
            border: "3px solid #f0f0f0",
            borderRadius: "50%",
            borderTop: "3px solid #3498db",
            width: "16px",
            height: "16px",
            boxSizing: "border-box",
            margin: "auto",
            padding: "0",
            animation: "spin 0.5s linear infinite",
          }}
        ></div>
      ) : (
        "Tr"
      )}
    </button>
  );
}

function TooltipDialog({
  mouseSelection,
  translatedText,
  onDialogClose,
}: {
  mouseSelection: MouseSelection;
  translatedText: string;
  onDialogClose: () => void;
}) {
  const placement = computeDialogPlacement(mouseSelection);

  const [position, setPosition] = useState({ left: "initial", top: "initial" });
  const [isReady, setIsReady] = useState(false);

  const ref = createRef<HTMLDivElement>();

  // Apply placement after the width and height are calculated
  setTimeout(async () => {
    if (isReady || !ref.current) {
      return;
    }
    const [left, top] = (() => {
      const rect = ref.current.getBoundingClientRect();
      const bounds = getViewportBounds(4);
      const tooltipX = clamp(
        placement.x - rect.width / 2,
        bounds.maxLeft,
        bounds.maxRight - rect.width,
      );
      const tooltipY = clamp(
        placement.upwards ? placement.y - rect.height - 2 : placement.y + 2,
        bounds.maxTop,
        bounds.maxBottom - rect.height,
      );
      return [`${tooltipX}px`, `${tooltipY}px`];
    })();
    setPosition({ left, top });
    setIsReady(true);
  }, 1);

  const [closeButtonState, setCloseButtonState] = useState(0);

  return (
    <div
      ref={ref}
      style={{
        width: "auto",
        maxWidth: "60vw",
        position: "absolute",
        left: position.left,
        top: position.top,
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

function computeButtonPlacement(mouseSelection: MouseSelection): Placement {
  const {
    selection: { rect, offset },
    event: { pageX, pageY },
  } = mouseSelection;

  let y = pageY,
    upwards = false;
  if (rect !== null) {
    upwards =
      Math.abs(pageY - (rect.top + offset.y)) <
      Math.abs(pageY - (rect.bottom + offset.y));
    y = (upwards ? rect.top - 1 : rect.bottom + 1) + offset.y;
  }

  return {
    x: pageX,
    y: y,
    upwards: upwards,
  };
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

function getViewportBounds(padSize: number) {
  return {
    maxLeft: window.scrollX + padSize,
    maxRight: window.scrollX + window.innerWidth - padSize,
    maxTop: window.scrollY + 4,
    maxBottom: window.scrollY + window.innerHeight - padSize,
  };
}

// function getPageBounds() {
//   const padSize = 4;
//   return {
//     maxLeft: 0 + padSize,
//     maxRight: document.documentElement.scrollWidth - padSize,
//     maxTop: 0 + padSize,
//     maxBottom: document.documentElement.scrollHeight - padSize,
//   };
// }

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}
