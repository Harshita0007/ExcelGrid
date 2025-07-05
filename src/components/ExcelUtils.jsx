// ExcelUtils.jsx - Enhanced utility functions for Excel-like grid

// Generate column headers (A, B, C, ..., Z, AA, AB, etc.)
export const generateColumnHeaders = (numCols) => {
  const headers = [];
  for (let i = 0; i < numCols; i++) {
    let header = "",
      num = i;
    while (num >= 0) {
      header = String.fromCharCode(65 + (num % 26)) + header;
      num = Math.floor(num / 26) - 1;
    }
    headers.push(header);
  }
  return headers;
};

// Initialize grid data
export const initializeGridData = (
  initialData,
  initialRows,
  initialColumns
) => {
  const gridData = [];
  const actualRows = Math.max(initialRows, initialData.length);
  const actualColumns = Math.max(
    initialColumns,
    Math.max(...initialData.map((row) => row?.length || 0), 0)
  );

  for (let i = 0; i < actualRows; i++) {
    gridData[i] = {
      id: `row_${i}_${Date.now()}_${Math.random()}`,
      cells: [],
    };
    for (let j = 0; j < actualColumns; j++) {
      gridData[i].cells[j] = initialData[i]?.[j] || "";
    }
  }
  return gridData;
};

// ENHANCED FILTER FUNCTIONALITY
export const filterData = (data, filters) => {
  return data.filter((row) => {
    return Object.entries(filters).every(([colIndex, filterConfig]) => {
      if (!filterConfig || !filterConfig.value) return true;

      const cellValue = row.cells[parseInt(colIndex)] || "";
      const filterValue = filterConfig.value.toLowerCase();
      const filterType = filterConfig.type || "contains";

      switch (filterType) {
        case "contains":
          return cellValue.toString().toLowerCase().includes(filterValue);
        case "equals":
          return cellValue.toString().toLowerCase() === filterValue;
        case "startsWith":
          return cellValue.toString().toLowerCase().startsWith(filterValue);
        case "endsWith":
          return cellValue.toString().toLowerCase().endsWith(filterValue);
        case "greaterThan":
          const numValue = parseFloat(cellValue);
          const filterNum = parseFloat(filterValue);
          return !isNaN(numValue) && !isNaN(filterNum) && numValue > filterNum;
        case "lessThan":
          const numValue2 = parseFloat(cellValue);
          const filterNum2 = parseFloat(filterValue);
          return (
            !isNaN(numValue2) && !isNaN(filterNum2) && numValue2 < filterNum2
          );
        case "notEmpty":
          return cellValue.toString().trim() !== "";
        case "empty":
          return cellValue.toString().trim() === "";
        default:
          return cellValue.toString().toLowerCase().includes(filterValue);
      }
    });
  });
};

// ENHANCED SORT FUNCTIONALITY
export const sortData = (data, sortConfig) => {
  if (!sortConfig.key && sortConfig.key !== 0) return data;

  return [...data].sort((a, b) => {
    const aValue = a.cells[sortConfig.key] || "";
    const bValue = b.cells[sortConfig.key] || "";

    // Handle different sort types
    switch (sortConfig.type) {
      case "number":
        const aNum = parseFloat(aValue) || 0;
        const bNum = parseFloat(bValue) || 0;
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;

      case "date":
        const aDate = new Date(aValue);
        const bDate = new Date(bValue);
        const aTime = isNaN(aDate.getTime()) ? 0 : aDate.getTime();
        const bTime = isNaN(bDate.getTime()) ? 0 : bDate.getTime();
        return sortConfig.direction === "asc" ? aTime - bTime : bTime - aTime;

      case "text":
      default:
        // Auto-detect if values are numbers
        const aNum2 = parseFloat(aValue);
        const bNum2 = parseFloat(bValue);

        if (!isNaN(aNum2) && !isNaN(bNum2)) {
          return sortConfig.direction === "asc" ? aNum2 - bNum2 : bNum2 - aNum2;
        }

        // String comparison
        const aStr = aValue.toString().toLowerCase();
        const bStr = bValue.toString().toLowerCase();

        if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
        if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
        return 0;
    }
  });
};

// Get sort icon based on current sort configuration
export const getSortIcon = (colIndex, sortConfig) => {
  if (sortConfig.key !== colIndex) return "⇅";
  return sortConfig.direction === "asc" ? "↑" : "↓";
};

// ENHANCED COLUMN/ROW INSERTION WITH BETTER POSITIONING
export const insertRowAbove = (data, rowIndex, numColumns) => {
  const newRow = {
    id: `row_${Date.now()}_${Math.random()}`,
    cells: Array(numColumns).fill(""),
  };
  const newData = [...data];
  newData.splice(rowIndex, 0, newRow);
  return newData;
};

export const insertRowBelow = (data, rowIndex, numColumns) => {
  const newRow = {
    id: `row_${Date.now()}_${Math.random()}`,
    cells: Array(numColumns).fill(""),
  };
  const newData = [...data];
  newData.splice(rowIndex + 1, 0, newRow);
  return newData;
};

export const insertColumnLeft = (data, colIndex) => {
  return data.map((row) => {
    const newCells = [...row.cells];
    newCells.splice(colIndex, 0, "");
    return { ...row, cells: newCells };
  });
};

export const insertColumnRight = (data, colIndex) => {
  return data.map((row) => {
    const newCells = [...row.cells];
    newCells.splice(colIndex + 1, 0, "");
    return { ...row, cells: newCells };
  });
};

// BULK INSERT OPERATIONS
export const insertMultipleRows = (data, startIndex, count, numColumns) => {
  const newRows = [];
  for (let i = 0; i < count; i++) {
    newRows.push({
      id: `row_${Date.now()}_${Math.random()}_${i}`,
      cells: Array(numColumns).fill(""),
    });
  }
  const newData = [...data];
  newData.splice(startIndex, 0, ...newRows);
  return newData;
};

export const insertMultipleColumns = (data, startIndex, count) => {
  return data.map((row) => {
    const newCells = [...row.cells];
    const columnsToInsert = Array(count).fill("");
    newCells.splice(startIndex, 0, ...columnsToInsert);
    return { ...row, cells: newCells };
  });
};

// Add multiple columns functions
export const addMultipleColumns = (data, count = 5) => {
  return data.map((row) => ({
    ...row,
    cells: [...row.cells, ...Array(count).fill("")],
  }));
};

export const insertMultipleColumnsLeft = (data, colIndex, count = 3) => {
  return insertMultipleColumns(data, colIndex, count);
};

export const insertMultipleColumnsRight = (data, colIndex, count = 3) => {
  return insertMultipleColumns(data, colIndex + 1, count);
};

export const insertMultipleRowsAbove = (
  data,
  rowIndex,
  count = 5,
  numColumns
) => {
  return insertMultipleRows(data, rowIndex, count, numColumns);
};

export const insertMultipleRowsBelow = (
  data,
  rowIndex,
  count = 5,
  numColumns
) => {
  return insertMultipleRows(data, rowIndex + 1, count, numColumns);
};

// ADVANCED FILTERING UTILITIES
export const getUniqueColumnValues = (data, columnIndex) => {
  const uniqueValues = new Set();
  data.forEach((row) => {
    const value = row.cells[columnIndex] || "";
    if (value.toString().trim() !== "") {
      uniqueValues.add(value.toString());
    }
  });
  return Array.from(uniqueValues).sort();
};

export const detectColumnDataType = (data, columnIndex) => {
  const values = data
    .map((row) => row.cells[columnIndex] || "")
    .filter((val) => val.toString().trim() !== "");

  if (values.length === 0) return "text";

  const numericCount = values.filter((val) => !isNaN(parseFloat(val))).length;
  const dateCount = values.filter(
    (val) => !isNaN(new Date(val).getTime())
  ).length;

  const numericRatio = numericCount / values.length;
  const dateRatio = dateCount / values.length;

  if (numericRatio > 0.8) return "number";
  if (dateRatio > 0.8) return "date";
  return "text";
};

// FILTER PRESETS
export const getFilterPresets = () => [
  { label: "Contains", value: "contains", icon: "🔍" },
  { label: "Equals", value: "equals", icon: "=" },
  { label: "Starts With", value: "startsWith", icon: "🔤" },
  { label: "Ends With", value: "endsWith", icon: "🔚" },
  { label: "Greater Than", value: "greaterThan", icon: ">" },
  { label: "Less Than", value: "lessThan", icon: "<" },
  { label: "Not Empty", value: "notEmpty", icon: "📄" },
  { label: "Empty", value: "empty", icon: "📋" },
];

// Handle cell value changes
export const updateCellValue = (data, rowId, colIndex, value) => {
  return data.map((row) => {
    if (row.id === rowId) {
      const newCells = [...row.cells];
      newCells[colIndex] = value;
      return { ...row, cells: newCells };
    }
    return row;
  });
};

// UTILITY: Find row index by row ID with error handling
export const findRowIndexById = (data, rowId) => {
  if (!data || !Array.isArray(data)) return -1;
  return data.findIndex((row) => row && row.id === rowId);
};

// FIXED: Clear cell data function - simplified and consistent
export const clearCellData = (data, rowIdentifier, colIndex) => {
  console.log("Clear cell data called:", {
    rowIdentifier,
    colIndex,
    dataLength: data.length,
  });

  return data.map((row, rIndex) => {
    // Check if rowIdentifier is a number (rowIndex) or string (rowId)
    const isMatch =
      typeof rowIdentifier === "number"
        ? rIndex === rowIdentifier
        : row.id === rowIdentifier;

    if (isMatch) {
      const newCells = [...row.cells];
      // Ensure the column index exists
      if (colIndex >= 0 && colIndex < newCells.length) {
        console.log(
          "Clearing cell at row",
          rIndex,
          "col",
          colIndex,
          "old value:",
          newCells[colIndex]
        );
        newCells[colIndex] = "";
      }
      return { ...row, cells: newCells };
    }
    return row;
  });
};

// FIXED: Clear cell by ID
export const clearCellDataById = (data, rowId, colIndex) => {
  console.log("Clear cell by ID:", { rowId, colIndex });

  return data.map((row) => {
    if (row.id === rowId) {
      const newCells = [...row.cells];
      if (colIndex >= 0 && colIndex < newCells.length) {
        console.log("Clearing cell by ID, old value:", newCells[colIndex]);
        newCells[colIndex] = "";
      }
      return { ...row, cells: newCells };
    }
    return row;
  });
};

// FIXED: Clear cell by index
export const clearCellDataByIndex = (data, rowIndex, colIndex) => {
  console.log("Clear cell by index:", {
    rowIndex,
    colIndex,
    dataLength: data.length,
  });

  if (rowIndex < 0 || rowIndex >= data.length) {
    console.error("Invalid row index:", rowIndex);
    return data;
  }

  return data.map((row, rIndex) => {
    if (rIndex === rowIndex) {
      const newCells = [...row.cells];
      if (colIndex >= 0 && colIndex < newCells.length) {
        console.log("Clearing cell by index, old value:", newCells[colIndex]);
        newCells[colIndex] = "";
      }
      return { ...row, cells: newCells };
    }
    return row;
  });
};

// Clear multiple cells
export const clearCellsData = (data, cellPositions) => {
  return data.map((row, rIndex) => {
    const newCells = [...row.cells];
    cellPositions.forEach(({ row: targetRow, col: targetCol }) => {
      if (rIndex === targetRow) {
        newCells[targetCol] = "";
      }
    });
    return { ...row, cells: newCells };
  });
};

// Clear entire row
export const clearRowData = (data, rowIndex) => {
  return data.map((row, rIndex) => {
    if (rIndex === rowIndex) {
      return {
        ...row,
        cells: row.cells.map(() => ""),
      };
    }
    return row;
  });
};

// Clear entire column
export const clearColumnData = (data, colIndex) => {
  return data.map((row) => {
    const newCells = [...row.cells];
    newCells[colIndex] = "";
    return { ...row, cells: newCells };
  });
};

// Add new row
export const addNewRow = (data, numColumns) => {
  const newRow = {
    id: `row_${data.length}_${Date.now()}_${Math.random()}`,
    cells: Array(numColumns).fill(""),
  };
  return [...data, newRow];
};

// Add new column
export const addNewColumn = (data) => {
  return data.map((row) => ({
    ...row,
    cells: [...row.cells, ""],
  }));
};

// Delete row
export const deleteRow = (data, rowIndex) => {
  if (data.length <= 1) return data;
  return data.filter((_, index) => index !== rowIndex);
};

// Delete column
export const deleteColumn = (data, colIndex) => {
  const numColumns = data[0]?.cells?.length || 0;
  if (numColumns <= 1) return data;

  return data.map((row) => ({
    ...row,
    cells: row.cells.filter((_, index) => index !== colIndex),
  }));
};

// Clear all data
export const clearAllData = (data) => {
  return data.map((row) => ({
    ...row,
    cells: row.cells.map(() => ""),
  }));
};

// Navigation utilities
export const getNextFocusedCell = (
  focusedCell,
  direction,
  maxRows,
  maxCols
) => {
  let newRow = focusedCell.row;
  let newCol = focusedCell.col;

  switch (direction) {
    case "up":
      newRow = newRow > 0 ? newRow - 1 : maxRows - 1;
      break;
    case "down":
      newRow = newRow < maxRows - 1 ? newRow + 1 : 0;
      break;
    case "left":
      newCol = newCol > 0 ? newCol - 1 : maxCols - 1;
      break;
    case "right":
      newCol = newCol < maxCols - 1 ? newCol + 1 : 0;
      break;
    case "tab":
      if (newCol < maxCols - 1) {
        newCol = newCol + 1;
      } else {
        newCol = 0;
        newRow = newRow < maxRows - 1 ? newRow + 1 : 0;
      }
      break;
    case "shift-tab":
      if (newCol > 0) {
        newCol = newCol - 1;
      } else {
        newCol = maxCols - 1;
        newRow = newRow > 0 ? newRow - 1 : maxRows - 1;
      }
      break;
    case "enter":
      newRow = newRow < maxRows - 1 ? newRow + 1 : 0;
      break;
    default:
      break;
  }

  return { row: newRow, col: newCol };
};

// File operations
export const saveToFile = (data, fileName) => {
  const dataToSave = {
    fileName,
    data: data.map((row) => row.cells),
    timestamp: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(dataToSave, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}.json`;
  a.click();
  URL.revokeObjectURL(url);
};

export const importFromFile = (file, callback) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importedData = JSON.parse(e.target.result);
      if (importedData.data && Array.isArray(importedData.data)) {
        callback(importedData.data);
      } else {
        throw new Error("Invalid file format");
      }
    } catch (error) {
      alert("Error importing file. Please make sure it's a valid JSON file.");
    }
  };
  reader.readAsText(file);
};

// History management utilities
export const addToHistory = (history, historyIndex, newData) => {
  const newHistory = history.slice(0, historyIndex + 1);
  newHistory.push(JSON.parse(JSON.stringify(newData)));
  return {
    history: newHistory,
    historyIndex: newHistory.length - 1,
  };
};

// Column width calculation
export const calculateColumnWidth = (containerWidth, numColumns) => {
  const availableWidth = containerWidth - 60;
  return Math.max(80, Math.floor(availableWidth / numColumns));
};

// Focus adjustment utilities
export const adjustFocusAfterRowDeletion = (focusedCell, dataLength) => {
  if (focusedCell.row >= dataLength) {
    return { ...focusedCell, row: dataLength - 1 };
  }
  return focusedCell;
};

export const adjustFocusAfterColumnDeletion = (focusedCell, numColumns) => {
  if (focusedCell.col >= numColumns) {
    return { ...focusedCell, col: numColumns - 1 };
  }
  return focusedCell;
};

// Auto-fit column width based on content
export const autoFitColumnWidth = (data, colIndex) => {
  let maxWidth = 50; // Minimum width

  data.forEach((row) => {
    const cellValue = row.cells[colIndex] || "";
    const textWidth = cellValue.toString().length * 8; // Rough estimate
    maxWidth = Math.max(maxWidth, textWidth);
  });

  return Math.min(maxWidth, 300); // Maximum width of 300px
};

// SIMPLIFIED CONTEXT MENU WITH ESSENTIAL OPTIONS
export const getContextMenuItems = () => [
  { label: "Insert Row Above", action: "insertRowAbove", icon: "⬆️" },
  { label: "Insert Row Below", action: "insertRowBelow", icon: "⬇️" },
  { label: "---", action: null },
  { label: "Insert Column Left", action: "insertColumnLeft", icon: "⬅️" },
  { label: "Insert Column Right", action: "insertColumnRight", icon: "➡️" },
  { label: "---", action: null },
  { label: "Copy", action: "copy", icon: "📋", shortcut: "Ctrl+C" },
  { label: "Cut", action: "cut", icon: "✂️", shortcut: "Ctrl+X" },
  { label: "Paste", action: "paste", icon: "📋", shortcut: "Ctrl+V" },
  { label: "---", action: null },
  { label: "Delete Row", action: "deleteRow", icon: "🗑️" },
  { label: "Delete Column", action: "deleteColumn", icon: "🗑️" },
  { label: "---", action: null },
];

// FIXED: Handle backspace key for erasing cell content
export const handleBackspaceKey = (data, rowIdentifier, colIndex) => {
  console.log("Backspace key pressed:", { rowIdentifier, colIndex });
  return clearCellData(data, rowIdentifier, colIndex);
};

// FIXED: Context menu handler with proper error handling and debugging
export const handleContextMenuAction = (action, data, focusedCell) => {
  console.log("=== CONTEXT MENU ACTION ===");
  console.log("Action:", action);
  console.log("Focused cell:", focusedCell);
  console.log("Data length:", data.length);
  console.log("===========================");

  if (
    !focusedCell ||
    typeof focusedCell.row === "undefined" ||
    typeof focusedCell.col === "undefined"
  ) {
    console.error("Invalid focused cell:", focusedCell);
    return data;
  }

  const { row, col } = focusedCell;

  switch (action) {
    case "clearCell":
      console.log("Executing clear cell action...");
      // Handle both row index and row ID
      if (typeof row === "number") {
        console.log("Clearing cell by index:", row, col);
        const result = clearCellDataByIndex(data, row, col);
        console.log("Clear cell result:", result);
        return result;
      } else {
        console.log("Clearing cell by ID:", row, col);
        const result = clearCellDataById(data, row, col);
        console.log("Clear cell result:", result);
        return result;
      }

    case "insertRowAbove":
      const rowIdx1 =
        typeof row === "number" ? row : findRowIndexById(data, row);
      if (rowIdx1 === -1) {
        console.error("Row not found for insertRowAbove");
        return data;
      }
      return insertRowAbove(data, rowIdx1, data[0]?.cells?.length || 0);

    case "insertRowBelow":
      const rowIdx2 =
        typeof row === "number" ? row : findRowIndexById(data, row);
      if (rowIdx2 === -1) {
        console.error("Row not found for insertRowBelow");
        return data;
      }
      return insertRowBelow(data, rowIdx2, data[0]?.cells?.length || 0);

    case "insertColumnLeft":
      return insertColumnLeft(data, col);

    case "insertColumnRight":
      return insertColumnRight(data, col);

    case "deleteRow":
      const rowIdx3 =
        typeof row === "number" ? row : findRowIndexById(data, row);
      if (rowIdx3 === -1) {
        console.error("Row not found for deleteRow");
        return data;
      }
      return deleteRow(data, rowIdx3);

    case "deleteColumn":
      return deleteColumn(data, col);

    default:
      console.log("Unknown action:", action);
      return data;
  }
};

// DEBUGGING: Function to log current state
export const debugClearCell = (data, focusedCell) => {
  console.log("=== DEBUG CLEAR CELL ===");
  console.log("Data length:", data.length);
  console.log("Focused cell:", focusedCell);
  if (
    focusedCell &&
    typeof focusedCell.row === "number" &&
    focusedCell.row >= 0
  ) {
    console.log(
      "Current cell value:",
      data[focusedCell.row]?.cells[focusedCell.col]
    );
    console.log("Row ID:", data[focusedCell.row]?.id);
  }
  console.log("========================");
};

// TESTING: Simple test function for clear cell
export const testClearCellFunction = (data, focusedCell) => {
  console.log("=== TESTING CLEAR CELL ===");
  debugClearCell(data, focusedCell);

  if (
    !focusedCell ||
    typeof focusedCell.row === "undefined" ||
    typeof focusedCell.col === "undefined"
  ) {
    console.error("Invalid focused cell for testing");
    return data;
  }

  const result = clearCellData(data, focusedCell.row, focusedCell.col);
  console.log("Test result:", result);
  console.log("==========================");
  return result;
};
