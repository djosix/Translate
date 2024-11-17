import { useState } from "react";
import { MouseSelection, Placement } from "../types";
import { getViewportBounds, clamp } from "../utils";

export default function TooltipButton({
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
