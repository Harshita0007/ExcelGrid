// Generate column headers: A, B, C, ..., Z, AA, AB, ..., ZZ, AAA, etc.
export const generateColumnHeaders = (numCols) => {
  const headers = [];
  for (let i = 0; i < numCols; i++) {
    let header = "",
      n = i;
    while (n >= 0) {
      header = String.fromCharCode((n % 26) + 65) + header;
      n = Math.floor(n / 26) - 1;
    }
    headers.push(header);
  }
  return headers;
};

// Clone grid deeply to avoid reference issues in undo/redo stacks
export const deepCloneGrid = (grid) => {
  return grid.map((row) => ({
    id: row.id,
    cells: [...row.cells],
  }));
};

// Undo operation: Pop last state from undoStack and push current to redoStack
export const handleUndo = (undoStack, redoStack, setData) => {
  if (undoStack.length > 0) {
    const current = undoStack.pop();
    redoStack.push(current.present);
    setData(deepCloneGrid(current.past));
  }
};

// Redo operation: Pop from redoStack and push current to undoStack
export const handleRedo = (undoStack, redoStack, data, setData) => {
  if (redoStack.length > 0) {
    const next = redoStack.pop();
    undoStack.push({ past: deepCloneGrid(data), present: deepCloneGrid(next) });
    setData(deepCloneGrid(next));
  }
};

// Add new state to undoStack
export const pushToUndoStack = (undoStack, data) => {
  const currentState = deepCloneGrid(data);
  undoStack.push({
    past: currentState,
    present: currentState,
  });
};
