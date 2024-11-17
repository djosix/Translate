import { MouseSelection } from "../types";
import TooltipButton from "./TooltipButton";
import TooltipDialog from "./TooltipDialog";

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
