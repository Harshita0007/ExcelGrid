import React, { useState, useEffect, useRef, useCallback } from "react";

// Generate column headers (A, B, C, ..., Z, AA, AB, etc.)
const generateColumnHeaders = (numCols) => {
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

// Context Menu Component
const ContextMenu = ({
  isOpen,
  position,
  onClose,
  onInsertRowAbove,
  onInsertRowBelow,
  onInsertColumnLeft,
  onInsertColumnRight,
  onDeleteRow,
  onDeleteColumn,
  onCopy,
  onPaste,
  onCut,
  focusedCell,
}) => {
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const menuItems = [
    { label: "Insert Row Above", action: onInsertRowAbove, icon: "⬆️" },
    { label: "Insert Row Below", action: onInsertRowBelow, icon: "⬇️" },
    { label: "Insert Column Left", action: onInsertColumnLeft, icon: "⬅️" },
    { label: "Insert Column Right", action: onInsertColumnRight, icon: "➡️" },
    { label: "---", action: null },
    { label: "Copy", action: onCopy, icon: "📋", shortcut: "Ctrl+C" },
    { label: "Cut", action: onCut, icon: "✂️", shortcut: "Ctrl+X" },
    { label: "Paste", action: onPaste, icon: "📋", shortcut: "Ctrl+V" },
    { label: "---", action: null },
    { label: "Delete Row", action: onDeleteRow, icon: "🗑️" },
    { label: "Delete Column", action: onDeleteColumn, icon: "🗑️" },
  ];

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: position.y,
        left: position.x,
        backgroundColor: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        zIndex: 1000,
        minWidth: "200px",
        padding: "4px 0",
      }}
    >
      {menuItems.map((item, index) =>
        item.label === "---" ? (
          <div
            key={index}
            style={{ height: "1px", backgroundColor: "#eee", margin: "4px 0" }}
          />
        ) : (
          <div
            key={index}
            style={{
              padding: "8px 12px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "14px",
              backgroundColor: "white",
              borderRadius: "2px",
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f0f0f0";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
            }}
            onClick={() => {
              if (item.action) {
                item.action();
                onClose();
              }
            }}
          >
            <span>
              {item.icon && (
                <span style={{ marginRight: "8px" }}>{item.icon}</span>
              )}
              {item.label}
            </span>
            {item.shortcut && (
              <span style={{ fontSize: "12px", color: "#666" }}>
                {item.shortcut}
              </span>
            )}
          </div>
        )
      )}
    </div>
  );
};

// File Manager Modal Component
const FileManagerModal = ({ isOpen, onClose, onSave, onImport, onRefresh }) => {
  const [fileName, setFileName] = useState("spreadsheet");
  const fileInputRef = useRef(null);

  const handleSave = () => {
    onSave(fileName);
    onClose();
  };

  const handleImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      onImport(file);
      onClose();
    }
  };

  const handleRefresh = () => {
    onRefresh();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "30px",
          borderRadius: "8px",
          minWidth: "350px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#333" }}>
          File Manager
        </h3>

        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontWeight: "bold",
            }}
          >
            File Name:
          </label>
          <input
            type="text"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "14px",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "12px 20px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            💾 Save as JSON
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: "12px 20px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            📂 Import JSON
          </button>

          <button
            onClick={handleRefresh}
            style={{
              padding: "12px 20px",
              backgroundColor: "#ffc107",
              color: "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            🔄 Refresh/Reset
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "12px 20px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Cancel
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          style={{ display: "none" }}
        />
      </div>
    </div>
  );
};

// Main Excel Grid Component
const ExcelGrid = ({
  initialData = [],
  rows: initialRows = 20,
  columns: initialColumns = 10,
  onDataChange = () => {},
  currentFileName = "default",
}) => {
  const [data, setData] = useState(() => {
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
  });

  const [focusedCell, setFocusedCell] = useState({ row: 0, col: 0 });
  const [editingCell, setEditingCell] = useState(null);
  const [filters, setFilters] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [colWidth, setColWidth] = useState(120);
  const [showFileManager, setShowFileManager] = useState(false);
  const [contextMenu, setContextMenu] = useState({
    isOpen: false,
    position: { x: 0, y: 0 },
  });
  const [clipboard, setClipboard] = useState({ data: null, type: null });
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const gridRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const currentEditValue = useRef("");

  const currentRows = data.length;
  const currentColumns = data[0]?.cells?.length || 0;
  const columnHeaders = generateColumnHeaders(currentColumns);

  // Add to history for undo/redo
  const addToHistory = useCallback(
    (newData) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push(JSON.parse(JSON.stringify(newData)));
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const previousData = history[historyIndex - 1];
      setData(previousData);
      setHistoryIndex(historyIndex - 1);
      onDataChange(previousData);
    }
  }, [history, historyIndex, onDataChange]);

  // Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextData = history[historyIndex + 1];
      setData(nextData);
      setHistoryIndex(historyIndex + 1);
      onDataChange(nextData);
    }
  }, [history, historyIndex, onDataChange]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(data))]);
      setHistoryIndex(0);
    }
  }, []);

  // Resize observer to dynamically adjust column width
  useEffect(() => {
    const updateColumnWidth = () => {
      if (gridWrapperRef.current) {
        const containerWidth = gridWrapperRef.current.offsetWidth;
        const availableWidth = containerWidth - 60; // subtract row index column
        const newColWidth = Math.max(
          80,
          Math.floor(availableWidth / currentColumns)
        );
        setColWidth(newColWidth);
      }
    };

    const observer = new ResizeObserver(updateColumnWidth);
    if (gridWrapperRef.current) observer.observe(gridWrapperRef.current);
    updateColumnWidth();

    return () => observer.disconnect();
  }, [currentColumns]);

  // Global keyboard event handler
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      // Only handle if not in file manager modal or context menu
      if (showFileManager || contextMenu.isOpen) return;

      const key = e.key;
      const ctrlKey = e.ctrlKey || e.metaKey;
      let newRow = focusedCell.row;
      let newCol = focusedCell.col;

      // Handle Ctrl+Z (Undo) and Ctrl+Y (Redo)
      if (ctrlKey && key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      if (ctrlKey && (key === "y" || (key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
        return;
      }

      // Handle Ctrl+C (Copy)
      if (ctrlKey && key === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }

      // Handle Ctrl+X (Cut)
      if (ctrlKey && key === "x") {
        e.preventDefault();
        handleCut();
        return;
      }

      // Handle Ctrl+V (Paste)
      if (ctrlKey && key === "v") {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Handle Delete key
      if (key === "Delete" || key === "Backspace") {
        e.preventDefault();
        if (editingCell) return; // Don't clear if editing
        const rowId = filteredData[focusedCell.row]?.id;
        if (rowId) {
          handleCellChange(rowId, focusedCell.col, "");
        }
        return;
      }

      // Handle Tab key - move to next cell
      if (key === "Tab") {
        e.preventDefault();
        if (e.shiftKey) {
          // Shift+Tab: Move to previous cell
          if (newCol > 0) {
            newCol = newCol - 1;
          } else {
            newCol = currentColumns - 1;
            newRow = newRow > 0 ? newRow - 1 : filteredData.length - 1;
          }
        } else {
          // Tab: Move to next cell
          if (newCol < currentColumns - 1) {
            newCol = newCol + 1;
          } else {
            newCol = 0;
            newRow = newRow < filteredData.length - 1 ? newRow + 1 : 0;
          }
        }
        setFocusedCell({ row: newRow, col: newCol });
        setEditingCell(null);
        return;
      }

      // Navigation keys
      switch (key) {
        case "ArrowUp":
          e.preventDefault();
          newRow = newRow > 0 ? newRow - 1 : filteredData.length - 1;
          setFocusedCell({ row: newRow, col: newCol });
          setEditingCell(null);
          return;
        case "ArrowDown":
          e.preventDefault();
          newRow = newRow < filteredData.length - 1 ? newRow + 1 : 0;
          setFocusedCell({ row: newRow, col: newCol });
          setEditingCell(null);
          return;
        case "ArrowLeft":
          e.preventDefault();
          newCol = newCol > 0 ? newCol - 1 : currentColumns - 1;
          setFocusedCell({ row: newRow, col: newCol });
          setEditingCell(null);
          return;
        case "ArrowRight":
          e.preventDefault();
          newCol = newCol < currentColumns - 1 ? newCol + 1 : 0;
          setFocusedCell({ row: newRow, col: newCol });
          setEditingCell(null);
          return;
        case "Enter":
          e.preventDefault();
          if (editingCell) {
            setEditingCell(null);
            // Move down to next row after Enter
            newRow = newRow < filteredData.length - 1 ? newRow + 1 : 0;
            setFocusedCell({ row: newRow, col: newCol });
          } else {
            setEditingCell({ rowIndex: focusedCell.row, col: focusedCell.col });
            const currentValue =
              filteredData[focusedCell.row]?.cells[focusedCell.col] || "";
            currentEditValue.current = currentValue;
          }
          return;
        case "Escape":
          e.preventDefault();
          if (editingCell) {
            // Restore original value
            const rowId = filteredData[focusedCell.row]?.id;
            if (rowId) {
              handleCellChange(
                rowId,
                focusedCell.col,
                currentEditValue.current
              );
            }
            setEditingCell(null);
          }
          return;
        case "F2":
          e.preventDefault();
          setEditingCell({ rowIndex: focusedCell.row, col: focusedCell.col });
          const currentValue =
            filteredData[focusedCell.row]?.cells[focusedCell.col] || "";
          currentEditValue.current = currentValue;
          return;
        default:
          // Start editing if alphanumeric key is pressed
          if (key.length === 1 && !ctrlKey && !editingCell) {
            e.preventDefault();
            setEditingCell({ rowIndex: focusedCell.row, col: focusedCell.col });
            // Clear cell and start with new character
            const rowId = filteredData[focusedCell.row]?.id;
            if (rowId) {
              handleCellChange(rowId, focusedCell.col, key);
            }
          }
          return;
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);
    return () => document.removeEventListener("keydown", handleGlobalKeyDown);
  }, [
    focusedCell,
    editingCell,
    showFileManager,
    contextMenu.isOpen,
    undo,
    redo,
  ]);

  // Filter data based on active filters
  const filteredData = data.filter((row) => {
    return Object.entries(filters).every(([colIndex, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = row.cells[parseInt(colIndex)] || "";
      return cellValue
        .toString()
        .toLowerCase()
        .includes(filterValue.toLowerCase());
    });
  });

  // Sort data if sort config is set
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key) return 0;

    const aValue = a.cells[sortConfig.key] || "";
    const bValue = b.cells[sortConfig.key] || "";

    // Try to parse as numbers for proper numeric sorting
    const aNum = parseFloat(aValue);
    const bNum = parseFloat(bValue);

    if (!isNaN(aNum) && !isNaN(bNum)) {
      return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
    }

    // String comparison
    const aStr = aValue.toString().toLowerCase();
    const bStr = bValue.toString().toLowerCase();

    if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleCellClick = (rowIndex, col) => {
    setFocusedCell({ row: rowIndex, col });
    setEditingCell(null);
  };

  const handleCellDoubleClick = (rowIndex, col) => {
    setEditingCell({ rowIndex, col });
    const currentValue = sortedData[rowIndex]?.cells[col] || "";
    currentEditValue.current = currentValue;
  };

  const handleCellChange = (rowId, col, value) => {
    const newData = data.map((row) => {
      if (row.id === rowId) {
        const newCells = [...row.cells];
        newCells[col] = value;
        return { ...row, cells: newCells };
      }
      return row;
    });
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const handleSort = (colIndex) => {
    let direction = "asc";
    if (sortConfig.key === colIndex && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key: colIndex, direction });
  };

  const handleFilterChange = (colIndex, value) => {
    setFilters((prev) => ({
      ...prev,
      [colIndex]: value,
    }));
  };

  // Context menu handlers
  const handleContextMenu = (e, rowIndex, colIndex) => {
    e.preventDefault();
    setFocusedCell({ row: rowIndex, col: colIndex });
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
    });
  };

  const handleInsertRowAbove = () => {
    const newRow = {
      id: `row_${Date.now()}_${Math.random()}`,
      cells: Array(currentColumns).fill(""),
    };
    const newData = [...data];
    newData.splice(focusedCell.row, 0, newRow);
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const handleInsertRowBelow = () => {
    const newRow = {
      id: `row_${Date.now()}_${Math.random()}`,
      cells: Array(currentColumns).fill(""),
    };
    const newData = [...data];
    newData.splice(focusedCell.row + 1, 0, newRow);
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const handleInsertColumnLeft = () => {
    const newData = data.map((row) => {
      const newCells = [...row.cells];
      newCells.splice(focusedCell.col, 0, "");
      return { ...row, cells: newCells };
    });
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const handleInsertColumnRight = () => {
    const newData = data.map((row) => {
      const newCells = [...row.cells];
      newCells.splice(focusedCell.col + 1, 0, "");
      return { ...row, cells: newCells };
    });
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const handleCopy = () => {
    const value = sortedData[focusedCell.row]?.cells[focusedCell.col] || "";
    setClipboard({ data: value, type: "copy" });
  };

  const handleCut = () => {
    const value = sortedData[focusedCell.row]?.cells[focusedCell.col] || "";
    setClipboard({ data: value, type: "cut" });
    const rowId = sortedData[focusedCell.row]?.id;
    if (rowId) {
      handleCellChange(rowId, focusedCell.col, "");
    }
  };

  const handlePaste = () => {
    if (clipboard.data !== null) {
      const rowId = sortedData[focusedCell.row]?.id;
      if (rowId) {
        handleCellChange(rowId, focusedCell.col, clipboard.data);
      }
    }
  };

  // Add/Delete/Clear functions
  const addRow = () => {
    const newRow = {
      id: `row_${data.length}_${Date.now()}_${Math.random()}`,
      cells: Array(currentColumns).fill(""),
    };
    const newData = [...data, newRow];
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const deleteRow = (rowIndex) => {
    if (data.length <= 1) return; // Keep at least one row
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);

    // Adjust focused cell if necessary
    if (focusedCell.row >= newData.length) {
      setFocusedCell({ row: newData.length - 1, col: focusedCell.col });
    }
  };

  const addColumn = () => {
    const newData = data.map((row) => ({
      ...row,
      cells: [...row.cells, ""],
    }));
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);
  };

  const deleteColumn = (colIndex) => {
    if (currentColumns <= 1) return; // Keep at least one column
    const newData = data.map((row) => ({
      ...row,
      cells: row.cells.filter((_, index) => index !== colIndex),
    }));
    setData(newData);
    onDataChange(newData);
    addToHistory(newData);

    // Adjust focused cell if necessary
    if (focusedCell.col >= newData[0]?.cells.length) {
      setFocusedCell({
        row: focusedCell.row,
        col: newData[0]?.cells.length - 1,
      });
    }
  };

  const clearAllData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      const newData = data.map((row) => ({
        ...row,
        cells: row.cells.map(() => ""),
      }));
      setData(newData);
      onDataChange(newData);
      addToHistory(newData);
      setFilters({});
      setSortConfig({ key: null, direction: "asc" });
    }
  };

  // File Manager functions
  const handleSave = (fileName) => {
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

  const handleImport = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result);
        if (importedData.data && Array.isArray(importedData.data)) {
          const newData = [];
          for (
            let i = 0;
            i < Math.max(importedData.data.length, initialRows);
            i++
          ) {
            newData[i] = {
              id: `row_${i}_${Date.now()}_${Math.random()}`,
              cells: importedData.data[i] || Array(initialColumns).fill(""),
            };
          }
          setData(newData);
          onDataChange(newData);
          addToHistory(newData);
          setFilters({});
          setSortConfig({ key: null, direction: "asc" });
        }
      } catch (error) {
        alert("Error importing file. Please make sure it's a valid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleRefresh = () => {
    if (
      window.confirm(
        "Are you sure you want to refresh? This will reset all data to the initial state."
      )
    ) {
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
      setData(gridData);
      onDataChange(gridData);
      addToHistory(gridData);
      setFilters({});
      setSortConfig({ key: null, direction: "asc" });
      setFocusedCell({ row: 0, col: 0 });
    }
  };

  const getSortIcon = (colIndex) => {
    if (sortConfig.key !== colIndex) return "⇅";
    return sortConfig.direction === "asc" ? "↑" : "↓";
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      {/* File Manager Button */}
      <button
        onClick={() => setShowFileManager(true)}
        style={{
          position: "fixed",
          top: "20px",
          right: "20px",
          padding: "12px 16px",
          backgroundColor: "#6f42c1",
          color: "white",
          border: "none",
          borderRadius: "50px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "bold",
          boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
          zIndex: 100,
        }}
      >
        📁 File Manager
      </button>

      {/* Control Panel */}
      <div style={{ marginBottom: "20px" }}>
        <h2 style={{ margin: 0, marginBottom: "15px", color: "#333" }}>
          Enhanced Excel-like Grid
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
          }}
        >
          <button onClick={addRow}>➕ Add Row</button>
          <button onClick={addColumn}>➕ Add Column</button>
          <button onClick={() => deleteRow(focusedCell.row)}>
            🗑️ Delete Row
          </button>
          <button onClick={() => deleteColumn(focusedCell.col)}>
            🗑️ Delete Column
          </button>
          <button onClick={clearAllData}>🧹 Clear All</button>
          <button onClick={undo} disabled={historyIndex <= 0}>
            ↩️ Undo
          </button>
          <button onClick={redo} disabled={historyIndex >= history.length - 1}>
            ↪️ Redo
          </button>
        </div>
      </div>

      {/* Spreadsheet Grid */}
      <div
        ref={gridWrapperRef}
        style={{
          overflow: "auto",
          border: "1px solid #ccc",
          maxHeight: "70vh",
          position: "relative",
        }}
      >
        <table
          ref={gridRef}
          style={{ borderCollapse: "collapse", width: "100%" }}
        >
          <thead>
            <tr>
              <th style={{ width: "60px" }}></th>
              {columnHeaders.map((header, colIndex) => (
                <th
                  key={colIndex}
                  onClick={() => handleSort(colIndex)}
                  style={{
                    width: `${colWidth}px`,
                    backgroundColor:
                      focusedCell.col === colIndex ? "#f8f9fa" : "#f1f1f1",
                    border: "1px solid #ddd",
                    padding: "6px",
                    textAlign: "center",
                    cursor: "pointer",
                    position: "sticky",
                    top: 0,
                    zIndex: 1,
                  }}
                >
                  <div>
                    {header} {getSortIcon(colIndex)}
                  </div>
                  <input
                    type="text"
                    value={filters[colIndex] || ""}
                    onChange={(e) =>
                      handleFilterChange(colIndex, e.target.value)
                    }
                    style={{ width: "90%", padding: "2px" }}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, rowIndex) => (
              <tr key={row.id}>
                <th
                  style={{
                    backgroundColor:
                      focusedCell.row === rowIndex ? "#f8f9fa" : "#f1f1f1",
                    border: "1px solid #ddd",
                    textAlign: "center",
                    position: "sticky",
                    left: 0,
                    zIndex: 1,
                    width: "60px",
                  }}
                >
                  {rowIndex + 1}
                </th>
                {row.cells.map((cell, colIndex) => {
                  const isFocused =
                    focusedCell.row === rowIndex &&
                    focusedCell.col === colIndex;
                  const isEditing =
                    editingCell?.rowIndex === rowIndex &&
                    editingCell?.col === colIndex;
                  return (
                    <td
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onDoubleClick={() =>
                        handleCellDoubleClick(rowIndex, colIndex)
                      }
                      onContextMenu={(e) =>
                        handleContextMenu(e, rowIndex, colIndex)
                      }
                      style={{
                        width: `${colWidth}px`,
                        border: "1px solid #ccc",
                        padding: "8px",
                        cursor: "pointer",
                        outline: isFocused ? "2px solid blue" : "none",
                        backgroundColor: isFocused ? "#e6f7ff" : "white",
                      }}
                    >
                      {isEditing ? (
                        <input
                          autoFocus
                          value={cell}
                          onChange={(e) =>
                            handleCellChange(row.id, colIndex, e.target.value)
                          }
                          onBlur={() => setEditingCell(null)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") setEditingCell(null);
                          }}
                          style={{
                            width: "100%",
                            border: "none",
                            background: "#fff8dc",
                            outline: "none",
                          }}
                        />
                      ) : (
                        <span>{cell}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        onClose={() => setContextMenu({ ...contextMenu, isOpen: false })}
        focusedCell={focusedCell}
        onInsertRowAbove={handleInsertRowAbove}
        onInsertRowBelow={handleInsertRowBelow}
        onInsertColumnLeft={handleInsertColumnLeft}
        onInsertColumnRight={handleInsertColumnRight}
        onDeleteRow={() => deleteRow(focusedCell.row)}
        onDeleteColumn={() => deleteColumn(focusedCell.col)}
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
      />

      {/* File Manager Modal */}
      <FileManagerModal
        isOpen={showFileManager}
        onClose={() => setShowFileManager(false)}
        onSave={handleSave}
        onImport={handleImport}
        onRefresh={handleRefresh}
      />
    </div>
  );
};

export default ExcelGrid;
