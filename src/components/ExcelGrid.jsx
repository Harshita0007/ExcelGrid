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

// Excel-like Grid Component
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

  const gridRef = useRef(null);
  const gridWrapperRef = useRef(null);
  const cellRefs = useRef({});

  const currentRows = data.length;
  const currentColumns = data[0]?.cells?.length || 0;
  const columnHeaders = generateColumnHeaders(currentColumns);

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
    setEditingCell({ rowIndex, col });
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
  };

  const handleKeyDown = (e, rowIndex, col) => {
    const key = e.key;
    let newRow = rowIndex;
    let newCol = col;

    if (key === "Delete" || key === "Backspace") {
      e.preventDefault();
      const rowId = sortedData[rowIndex]?.id;
      if (rowId) {
        handleCellChange(rowId, col, "");
      }
      return;
    }

    switch (key) {
      case "Tab":
        e.preventDefault();
        if (e.shiftKey) {
          newCol = col > 0 ? col - 1 : currentColumns - 1;
          if (col === 0)
            newRow = rowIndex > 0 ? rowIndex - 1 : sortedData.length - 1;
        } else {
          newCol = col < currentColumns - 1 ? col + 1 : 0;
          if (col === currentColumns - 1)
            newRow = rowIndex < sortedData.length - 1 ? rowIndex + 1 : 0;
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        newRow = rowIndex > 0 ? rowIndex - 1 : sortedData.length - 1;
        break;
      case "ArrowDown":
        e.preventDefault();
        newRow = rowIndex < sortedData.length - 1 ? rowIndex + 1 : 0;
        break;
      case "ArrowLeft":
        e.preventDefault();
        newCol = col > 0 ? col - 1 : currentColumns - 1;
        break;
      case "ArrowRight":
        e.preventDefault();
        newCol = col < currentColumns - 1 ? col + 1 : 0;
        break;
      case "Enter":
        e.preventDefault();
        setEditingCell({ rowIndex, col });
        return;
      case "Escape":
        e.preventDefault();
        setEditingCell(null);
        return;
      default:
        return;
    }

    setFocusedCell({ row: newRow, col: newCol });
    const cellKey = `${newRow}-${newCol}`;
    if (cellRefs.current[cellKey]) {
      cellRefs.current[cellKey].focus();
    }
  };

  const handleCellBlur = (rowId, col, value) => {
    handleCellChange(rowId, col, value);
    setEditingCell(null);
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

  // Add/Delete/Clear functions
  const addRow = () => {
    const newRow = {
      id: `row_${data.length}_${Date.now()}_${Math.random()}`,
      cells: Array(currentColumns).fill(""),
    };
    const newData = [...data, newRow];
    setData(newData);
    onDataChange(newData);
  };

  const deleteRow = (rowIndex) => {
    if (data.length <= 1) return; // Keep at least one row
    const newData = data.filter((_, index) => index !== rowIndex);
    setData(newData);
    onDataChange(newData);

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
  };

  const deleteColumn = (colIndex) => {
    if (currentColumns <= 1) return; // Keep at least one column
    const newData = data.map((row) => ({
      ...row,
      cells: row.cells.filter((_, index) => index !== colIndex),
    }));
    setData(newData);
    onDataChange(newData);

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
          Excel-like Grid Component
        </h2>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "10px",
          }}
        >
          <button
            onClick={addRow}
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ➕ Add Row
          </button>

          <button
            onClick={addColumn}
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ➕ Add Column
          </button>

          <button
            onClick={() => deleteRow(focusedCell.row)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ❌ Delete Row {focusedCell.row + 1}
          </button>

          <button
            onClick={() => deleteColumn(focusedCell.col)}
            style={{
              padding: "8px 16px",
              backgroundColor: "#fd7e14",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            ❌ Delete Column {columnHeaders[focusedCell.col]}
          </button>

          <button
            onClick={clearAllData}
            style={{
              padding: "8px 16px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🗑️ Clear All Data
          </button>
        </div>
      </div>

      <div
        ref={(el) => {
          gridRef.current = el;
          gridWrapperRef.current = el;
        }}
        style={{
          border: "2px solid #ddd",
          borderRadius: "4px",
          overflow: "auto",
          maxHeight: "600px",
        }}
      >
        {/* Header row */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#e9ecef",
            position: "sticky",
            top: 0,
            zIndex: 10,
          }}
        >
          <div
            style={{
              width: "60px",
              minWidth: "60px",
              padding: "8px",
              fontWeight: "bold",
              textAlign: "center",
              borderRight: "1px solid #ddd",
              backgroundColor: "#dee2e6",
            }}
          >
            #
          </div>
          {columnHeaders.map((header, colIndex) => (
            <div
              key={colIndex}
              style={{
                width: `${colWidth}px`,
                minWidth: `${colWidth}px`,
                padding: "4px",
                textAlign: "center",
                borderRight: "1px solid #ddd",
                backgroundColor:
                  focusedCell.col === colIndex ? "#007bff" : "#e9ecef",
                color: focusedCell.col === colIndex ? "white" : "black",
                fontWeight: "bold",
                display: "flex",
                flexDirection: "column",
                gap: "2px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "5px",
                }}
              >
                {header}
                <button
                  onClick={() => handleSort(colIndex)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: "12px",
                    color: focusedCell.col === colIndex ? "white" : "black",
                  }}
                >
                  {getSortIcon(colIndex)}
                </button>
              </div>
              <input
                type="text"
                placeholder="Filter..."
                value={filters[colIndex] || ""}
                onChange={(e) => handleFilterChange(colIndex, e.target.value)}
                style={{
                  width: "100%",
                  padding: "2px 4px",
                  fontSize: "11px",
                  border: "1px solid #ccc",
                  borderRadius: "2px",
                  backgroundColor: "white",
                }}
              />
            </div>
          ))}
        </div>

        {/* Data rows */}
        {sortedData.map((row, rowIndex) => (
          <div
            key={row.id}
            style={{ display: "flex", borderBottom: "1px solid #ddd" }}
          >
            <div
              style={{
                width: "60px",
                minWidth: "60px",
                padding: "8px",
                textAlign: "center",
                borderRight: "1px solid #ddd",
                backgroundColor:
                  focusedCell.row === rowIndex ? "#007bff" : "#f8f9fa",
                color: focusedCell.row === rowIndex ? "white" : "black",
                fontWeight: "bold",
              }}
            >
              {rowIndex + 1}
            </div>
            {row.cells.map((cell, colIndex) => {
              const isEditing =
                editingCell &&
                editingCell.rowIndex === rowIndex &&
                editingCell.col === colIndex;
              const isFocused =
                focusedCell.row === rowIndex && focusedCell.col === colIndex;
              const cellKey = `${rowIndex}-${colIndex}`;

              return (
                <div key={colIndex} style={{ position: "relative" }}>
                  {isEditing ? (
                    <input
                      ref={(el) => (cellRefs.current[cellKey] = el)}
                      type="text"
                      style={{
                        width: `${colWidth}px`,
                        minWidth: `${colWidth}px`,
                        padding: "8px",
                        border: "none",
                        outline: "2px solid #007bff",
                        backgroundColor: "white",
                      }}
                      value={cell}
                      onChange={(e) =>
                        handleCellChange(row.id, colIndex, e.target.value)
                      }
                      onBlur={(e) =>
                        handleCellBlur(row.id, colIndex, e.target.value)
                      }
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                      autoFocus
                    />
                  ) : (
                    <div
                      ref={(el) => (cellRefs.current[cellKey] = el)}
                      tabIndex={0}
                      style={{
                        width: `${colWidth}px`,
                        minWidth: `${colWidth}px`,
                        padding: "8px",
                        borderRight: "1px solid #ddd",
                        outline: "none",
                        backgroundColor: isFocused ? "#e3f2fd" : "white",
                        cursor: "text",
                      }}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      onKeyDown={(e) => handleKeyDown(e, rowIndex, colIndex)}
                    >
                      {cell || ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
        <p>
          Navigation: Use arrow keys to move, Tab/Shift+Tab to navigate, Enter
          to edit, Escape to cancel editing
        </p>
        <p>
          Focused Cell: Row {focusedCell.row + 1}, Column{" "}
          {columnHeaders[focusedCell.col]} | Rows: {sortedData.length} (filtered
          from {data.length}) | Columns: {currentColumns}
        </p>
      </div>

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

// Demo component with sample data
const Demo = () => {
  const [gridData, setGridData] = useState([
    ["Name", "Age", "City", "Salary"],
    ["John Doe", "30", "New York", "75000"],
    ["Jane Smith", "25", "Los Angeles", "65000"],
    ["Bob Johnson", "35", "Chicago", "80000"],
    ["Alice Brown", "28", "Houston", "70000"],
    ["Charlie Wilson", "32", "Phoenix", "72000"],
  ]);

  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        padding: "20px",
        backgroundColor: "#f5f5f5",
      }}
    >
      <ExcelGrid
        initialData={gridData}
        rows={15}
        columns={8}
        onDataChange={setGridData}
        currentFileName="demo-spreadsheet"
      />
    </div>
  );
};

export default Demo;
