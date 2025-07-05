// themes.js - Theme configuration for the Excel Grid component

export const themes = {
  light: {
    // Main container
    container: {
      backgroundColor: "#ffffff",
      color: "#333333",
      fontFamily: "Arial, sans-serif",
    },

    // Header styles
    header: {
      backgroundColor: "#f1f1f1",
      color: "#333333",
      border: "1px solid #ddd",
    },

    // Header focused state
    headerFocused: {
      backgroundColor: "#f8f9fa",
      color: "#333333",
    },

    // Cell styles
    cell: {
      backgroundColor: "#ffffff",
      color: "#333333",
      border: "1px solid #ccc",
      focusOutline: "2px solid #007bff",
      focusBackground: "#e6f7ff",
    },

    // Cell editing state
    cellEditing: {
      backgroundColor: "#fff8dc",
      color: "#333333",
      border: "none",
      outline: "none",
    },

    // Filter input
    filterInput: {
      backgroundColor: "#ffffff",
      color: "#333333",
      border: "1px solid #ccc",
      borderRadius: "2px",
    },

    // Context menu
    contextMenu: {
      backgroundColor: "#ffffff",
      color: "#333333",
      border: "1px solid #ccc",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
      hoverBackground: "#f0f0f0",
    },

    // Buttons
    button: {
      backgroundColor: "#007bff",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      hoverBackground: "#0056b3",
    },

    // File manager button
    fileManagerButton: {
      backgroundColor: "#6f42c1",
      color: "#ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },

    // Modal
    modal: {
      backgroundColor: "#ffffff",
      color: "#333333",
      overlay: "rgba(0,0,0,0.5)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    },

    // Form elements
    form: {
      input: {
        backgroundColor: "#ffffff",
        color: "#333333",
        border: "1px solid #ddd",
        borderRadius: "4px",
      },
      label: {
        color: "#333333",
        fontWeight: "bold",
      },
    },

    // Action buttons
    actionButtons: {
      save: { backgroundColor: "#28a745", color: "#ffffff" },
      import: { backgroundColor: "#007bff", color: "#ffffff" },
      refresh: { backgroundColor: "#ffc107", color: "#000000" },
      cancel: { backgroundColor: "#6c757d", color: "#ffffff" },
      delete: { backgroundColor: "#dc3545", color: "#ffffff" },
      add: { backgroundColor: "#28a745", color: "#ffffff" },
      undo: { backgroundColor: "#28b745", color: "#ffffff" },
      clear: { backgroundColor: "#fd7e14", color: "#ffffff" },
    },
  },

  dark: {
    // Main container
    container: {
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0",
      fontFamily: "Arial, sans-serif",
    },

    // Header styles
    header: {
      backgroundColor: "#2d2d2d",
      color: "#e0e0e0",
      border: "1px solid #404040",
    },

    // Header focused state
    headerFocused: {
      backgroundColor: "#3d3d3d",
      color: "#e0e0e0",
    },

    // Cell styles
    cell: {
      backgroundColor: "#1a1a1a",
      color: "#e0e0e0",
      border: "1px solid #404040",
      focusOutline: "2px solid #4CAF50",
      focusBackground: "#2d4a32",
    },

    // Cell editing state
    cellEditing: {
      backgroundColor: "#2d2d2d",
      color: "#e0e0e0",
      border: "1px solid #4CAF50",
      outline: "none",
    },

    // Filter input
    filterInput: {
      backgroundColor: "#2d2d2d",
      color: "#e0e0e0",
      border: "1px solid #404040",
      borderRadius: "2px",
    },

    // Context menu
    contextMenu: {
      backgroundColor: "#2d2d2d",
      color: "#e0e0e0",
      border: "1px solid #404040",
      borderRadius: "4px",
      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
      hoverBackground: "#3d3d3d",
    },

    // Buttons
    button: {
      backgroundColor: "#4CAF50",
      color: "#ffffff",
      border: "none",
      borderRadius: "4px",
      hoverBackground: "#45a049",
    },

    // File manager button
    fileManagerButton: {
      backgroundColor: "#9c27b0",
      color: "#ffffff",
      boxShadow: "0 2px 10px rgba(0,0,0,0.5)",
    },

    // Modal
    modal: {
      backgroundColor: "#2d2d2d",
      color: "#e0e0e0",
      overlay: "rgba(0,0,0,0.8)",
      boxShadow: "0 4px 20px rgba(0,0,0,0.6)",
    },

    // Form elements
    form: {
      input: {
        backgroundColor: "#3d3d3d",
        color: "#e0e0e0",
        border: "1px solid #404040",
        borderRadius: "4px",
      },
      label: {
        color: "#e0e0e0",
        fontWeight: "bold",
      },
    },

    // Action buttons
    actionButtons: {
      save: { backgroundColor: "#4CAF50", color: "#ffffff" },
      import: { backgroundColor: "#2196F3", color: "#ffffff" },
      refresh: { backgroundColor: "#FF9800", color: "#ffffff" },
      cancel: { backgroundColor: "#757575", color: "#ffffff" },
      delete: { backgroundColor: "#f44336", color: "#ffffff" },
      add: { backgroundColor: "#4CAF50", color: "#ffffff" },
      undo: { backgroundColor: "#757575", color: "#ffffff" },
      clear: { backgroundColor: "#FF5722", color: "#ffffff" },
    },
  },
};

// Theme utility functions
export const getTheme = (themeName) => {
  return themes[themeName] || themes.light;
};

export const createThemeStyles = (theme) => {
  return {
    // Container styles
    container: {
      padding: "20px",
      fontFamily: theme.container.fontFamily,
      backgroundColor: theme.container.backgroundColor,
      color: theme.container.color,
      minHeight: "100vh",
    },

    // Header styles
    header: {
      backgroundColor: theme.header.backgroundColor,
      color: theme.header.color,
      border: theme.header.border,
    },

    headerFocused: {
      backgroundColor: theme.headerFocused.backgroundColor,
      color: theme.headerFocused.color,
    },

    // Cell styles
    cell: {
      backgroundColor: theme.cell.backgroundColor,
      color: theme.cell.color,
      border: theme.cell.border,
    },

    cellFocused: {
      outline: theme.cell.focusOutline,
      backgroundColor: theme.cell.focusBackground,
    },

    cellEditing: {
      backgroundColor: theme.cellEditing.backgroundColor,
      color: theme.cellEditing.color,
      border: theme.cellEditing.border,
      outline: theme.cellEditing.outline,
    },

    // Filter input
    filterInput: {
      backgroundColor: theme.filterInput.backgroundColor,
      color: theme.filterInput.color,
      border: theme.filterInput.border,
      borderRadius: theme.filterInput.borderRadius,
    },

    // Context menu
    contextMenu: {
      backgroundColor: theme.contextMenu.backgroundColor,
      color: theme.contextMenu.color,
      border: theme.contextMenu.border,
      borderRadius: theme.contextMenu.borderRadius,
      boxShadow: theme.contextMenu.boxShadow,
    },

    contextMenuHover: {
      backgroundColor: theme.contextMenu.hoverBackground,
    },

    // Buttons
    button: {
      backgroundColor: theme.button.backgroundColor,
      color: theme.button.color,
      border: theme.button.border,
      borderRadius: theme.button.borderRadius,
    },

    fileManagerButton: {
      backgroundColor: theme.fileManagerButton.backgroundColor,
      color: theme.fileManagerButton.color,
      boxShadow: theme.fileManagerButton.boxShadow,
    },

    // Modal
    modal: {
      backgroundColor: theme.modal.backgroundColor,
      color: theme.modal.color,
      boxShadow: theme.modal.boxShadow,
    },

    modalOverlay: {
      backgroundColor: theme.modal.overlay,
    },

    // Form elements
    formInput: {
      backgroundColor: theme.form.input.backgroundColor,
      color: theme.form.input.color,
      border: theme.form.input.border,
      borderRadius: theme.form.input.borderRadius,
    },

    formLabel: {
      color: theme.form.label.color,
      fontWeight: theme.form.label.fontWeight,
    },
  };
};

// Theme context for React
export const defaultThemeContext = {
  theme: "light",
  setTheme: () => {},
  styles: createThemeStyles(themes.light),
};

// CSS variables generator for dynamic theming
export const generateCSSVariables = (theme) => {
  const variables = {};

  // Generate CSS custom properties
  Object.keys(theme).forEach((category) => {
    if (typeof theme[category] === "object") {
      Object.keys(theme[category]).forEach((property) => {
        if (typeof theme[category][property] === "string") {
          variables[
            `--${category}-${property.replace(/([A-Z])/g, "-$1").toLowerCase()}`
          ] = theme[category][property];
        }
      });
    }
  });

  return variables;
};

// Apply theme to document root
export const applyThemeToDocument = (themeName) => {
  const theme = getTheme(themeName);
  const variables = generateCSSVariables(theme);

  Object.keys(variables).forEach((key) => {
    document.documentElement.style.setProperty(key, variables[key]);
  });
};

export default themes;
