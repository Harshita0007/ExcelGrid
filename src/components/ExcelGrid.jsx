import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  generateColumnHeaders,
  initializeGridData,
  filterData,
  sortData,
  getSortIcon,
  updateCellValue,
  insertRowAbove,
  insertRowBelow,
  insertColumnLeft,
  insertColumnRight,
  addNewRow,
  addNewColumn,
  deleteRow,
  deleteColumn,
  clearAllData,
  getNextFocusedCell,
  saveToFile,
  importFromFile,
  addToHistory,
  calculateColumnWidth,
  adjustFocusAfterRowDeletion,
  adjustFocusAfterColumnDeletion,
  getContextMenuItems,
} from "./ExcelUtils";

// Context Menu Component
const ContextMenu = ({
  isOpen,
  position,
  onClose,
  onMenuAction,
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

  const menuItems = getContextMenuItems();

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
                onMenuAction(item.action);
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
  const [data, setData] = useState(() =>
    initializeGridData(initialData, initialRows, initialColumns)
  );
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
  const addToHistoryHandler = useCallback(
    (newData) => {
      const historyResult = addToHistory(history, historyIndex, newData);
      setHistory(historyResult.history);
      setHistoryIndex(historyResult.historyIndex);
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
        const newColWidth = calculateColumnWidth(
          containerWidth,
          currentColumns
        );
        setColWidth(newColWidth);
      }
    };

    const observer = new ResizeObserver(updateColumnWidth);
    if (gridWrapperRef.current) observer.observe(gridWrapperRef.current);
    updateColumnWidth();

    return () => observer.disconnect();
  }, [currentColumns]);

  // Get filtered and sorted data
  const filteredData = filterData(data, filters);
  const sortedData = sortData(filteredData, sortConfig);

  // Cell change handler
  const handleCellChange = (rowId, col, value) => {
    const newData = updateCellValue(data, rowId, col, value);
    setData(newData);
    onDataChange(newData);
    addToHistoryHandler(newData);
  };

  // Context menu actions handler
  const handleContextMenuAction = (action) => {
    let newData;

    switch (action) {
      case "insertRowAbove":
        newData = insertRowAbove(data, focusedCell.row, currentColumns);
        break;
      case "insertRowBelow":
        newData = insertRowBelow(data, focusedCell.row, currentColumns);
        break;
      case "insertColumnLeft":
        newData = insertColumnLeft(data, focusedCell.col);
        break;
      case "insertColumnRight":
        newData = insertColumnRight(data, focusedCell.col);
        break;
      case "copy":
        handleCopy();
        return;
      case "cut":
        handleCut();
        return;
      case "paste":
        handlePaste();
        return;
      case "deleteRow":
        newData = deleteRow(data, focusedCell.row);
        const adjustedFocusRow = adjustFocusAfterRowDeletion(
          focusedCell,
          newData.length
        );
        setFocusedCell(adjustedFocusRow);
        break;
      case "deleteColumn":
        newData = deleteColumn(data, focusedCell.col);
        const adjustedFocusCol = adjustFocusAfterColumnDeletion(
          focusedCell,
          newData[0]?.cells?.length || 0
        );
        setFocusedCell(adjustedFocusCol);
        break;
      default:
        return;
    }

    if (newData) {
      setData(newData);
      onDataChange(newData);
      addToHistoryHandler(newData);
    }
  };

  // Copy, Cut, Paste handlers
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

  // Global keyboard event handler
  useEffect(() => {
    const handleGlobalKeyDown = (e) => {
      if (showFileManager || contextMenu.isOpen) return;

      const key = e.key;
      const ctrlKey = e.ctrlKey || e.metaKey;

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

      // Handle Ctrl+C (Copy), Ctrl+X (Cut), Ctrl+V (Paste)
      if (ctrlKey && key === "c") {
        e.preventDefault();
        handleCopy();
        return;
      }

      if (ctrlKey && key === "x") {
        e.preventDefault();
        handleCut();
        return;
      }

      if (ctrlKey && key === "v") {
        e.preventDefault();
        handlePaste();
        return;
      }

      // Handle Delete key
      if (key === "Delete" || key === "Backspace") {
        e.preventDefault();
        if (editingCell) return;
        const rowId = sortedData[focusedCell.row]?.id;
        if (rowId) {
          handleCellChange(rowId, focusedCell.col, "");
        }
        return;
      }

      // Handle navigation and editing
      let newFocusedCell;
      switch (key) {
        case "Tab":
          e.preventDefault();
          newFocusedCell = getNextFocusedCell(
            focusedCell,
            e.shiftKey ? "shift-tab" : "tab",
            sortedData.length,
            currentColumns
          );
          setFocusedCell(newFocusedCell);
          setEditingCell(null);
          return;
        case "ArrowUp":
          e.preventDefault();
          newFocusedCell = getNextFocusedCell(
            focusedCell,
            "up",
            sortedData.length,
            currentColumns
          );
          setFocusedCell(newFocusedCell);
          setEditingCell(null);
          return;
        case "ArrowDown":
          e.preventDefault();
          newFocusedCell = getNextFocusedCell(
            focusedCell,
            "down",
            sortedData.length,
            currentColumns
          );
          setFocusedCell(newFocusedCell);
          setEditingCell(null);
          return;
        case "ArrowLeft":
          e.preventDefault();
          newFocusedCell = getNextFocusedCell(
            focusedCell,
            "left",
            sortedData.length,
            currentColumns
          );
          setFocusedCell(newFocusedCell);
          setEditingCell(null);
          return;
        case "ArrowRight":
          e.preventDefault();
          newFocusedCell = getNextFocusedCell(
            focusedCell,
            "right",
            sortedData.length,
            currentColumns
          );
          setFocusedCell(newFocusedCell);
          setEditingCell(null);
          return;
        case "Enter":
          e.preventDefault();
          if (editingCell) {
            setEditingCell(null);
            newFocusedCell = getNextFocusedCell(
              focusedCell,
              "enter",
              sortedData.length,
              currentColumns
            );
            setFocusedCell(newFocusedCell);
          } else {
            setEditingCell({ rowIndex: focusedCell.row, col: focusedCell.col });
            const currentValue =
              sortedData[focusedCell.row]?.cells[focusedCell.col] || "";
            currentEditValue.current = currentValue;
          }
          return;
        case "Escape":
          e.preventDefault();
          if (editingCell) {
            const rowId = sortedData[focusedCell.row]?.id;
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
            sortedData[focusedCell.row]?.cells[focusedCell.col] || "";
          currentEditValue.current = currentValue;
          return;
        default:
          if (key.length === 1 && !ctrlKey && !editingCell) {
            e.preventDefault();
            setEditingCell({ rowIndex: focusedCell.row, col: focusedCell.col });
            const rowId = sortedData[focusedCell.row]?.id;
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
    sortedData,
    currentColumns,
    handleCopy,
    handleCut,
    handlePaste,
    handleCellChange,
  ]);

  // Cell interaction handlers
  const handleCellClick = (rowIndex, col) => {
    setFocusedCell({ row: rowIndex, col });
    setEditingCell(null);
  };

  const handleCellDoubleClick = (rowIndex, col) => {
    setEditingCell({ rowIndex, col });
    const currentValue = sortedData[rowIndex]?.cells[col] || "";
    currentEditValue.current = currentValue;
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

  // Button action handlers
  const handleAddRow = () => {
    const newData = addNewRow(data, currentColumns);
    setData(newData);
    onDataChange(newData);
    addToHistoryHandler(newData);
  };

  const handleAddColumn = () => {
    const newData = addNewColumn(data);
    setData(newData);
    onDataChange(newData);
    addToHistoryHandler(newData);
  };

  const handleDeleteRow = () => {
    if (data.length <= 1) return;
    const newData = deleteRow(data, focusedCell.row);
    const adjustedFocus = adjustFocusAfterRowDeletion(
      focusedCell,
      newData.length
    );
    setData(newData);
    setFocusedCell(adjustedFocus);
    onDataChange(newData);
    addToHistoryHandler(newData);
  };

  const handleDeleteColumn = () => {
    if (currentColumns <= 1) return;
    const newData = deleteColumn(data, focusedCell.col);
    const adjustedFocus = adjustFocusAfterColumnDeletion(
      focusedCell,
      newData[0]?.cells?.length || 0
    );
    setData(newData);
    setFocusedCell(adjustedFocus);
    onDataChange(newData);
    addToHistoryHandler(newData);
  };

  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      const newData = clearAllData(data);
      setData(newData);
      onDataChange(newData);
      addToHistoryHandler(newData);
      setFilters({});
      setSortConfig({ key: null, direction: "asc" });
    }
  };

  // File Manager functions
  const handleSave = (fileName) => {
    saveToFile(data, fileName);
  };

  const handleImport = (file) => {
    importFromFile(file, initialRows, initialColumns, (newData) => {
      setData(newData);
      onDataChange(newData);
      addToHistoryHandler(newData);
      setFilters({});
      setSortConfig({ key: null, direction: "asc" });
    });
  };

  const handleRefresh = () => {
    if (
      window.confirm(
        "Are you sure you want to refresh? This will reset all data to the initial state."
      )
    ) {
      const newData = initializeGridData(
        initialData,
        initialRows,
        initialColumns
      );
      setData(newData);
      onDataChange(newData);
      addToHistoryHandler(newData);
      setFilters({});
      setSortConfig({ key: null, direction: "asc" });
      setFocusedCell({ row: 0, col: 0 });
    }
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
          <button onClick={handleAddRow}>➕ Add Row</button>
          <button onClick={handleAddColumn}>➕ Add Column</button>
          <button onClick={handleDeleteRow}>🗑️ Delete Row</button>
          <button onClick={handleDeleteColumn}>🗑️ Delete Column</button>
          <button onClick={handleClearAll}>🧹 Clear All</button>
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
                    {header} {getSortIcon(colIndex, sortConfig)}
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
        onMenuAction={handleContextMenuAction}
        focusedCell={focusedCell}
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
