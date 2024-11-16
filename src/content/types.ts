export interface Selection {
  text: string;
  rect: DOMRect | null;
  offset: { x: number; y: number };
}

export interface MouseSelection {
  selection: Selection;
  event: MouseEvent;
}

export interface Placement {
  x: number;
  y: number;
  upwards: boolean;
}

export interface TooltipHandle {
  hide: () => void;
  cleanup: () => void;
}
