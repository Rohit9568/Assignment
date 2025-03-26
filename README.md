# Modern SQL Editor

A powerful, modern SQL editor built with React 18 and Vite. Write and execute SQL queries in a clean, tab-based interface with a beautiful UI.

## Tech Stack

This project uses modern technologies:

- **[Vite](https://vitejs.dev/)** - Lightning-fast frontend build tool
- **[React 18](https://react.dev/)** - Latest React with improved rendering and hooks
- **[React Bootstrap](https://react-bootstrap.github.io/)** - Bootstrap components built for React
- **[CodeMirror 6](https://codemirror.net/)** - Modern code editor with SQL syntax highlighting
- **[React Table](https://react-table.tanstack.com/)** - Powerful tables with sorting and filtering

## Features

✨ **Modern Interface**: Clean, responsive design with light/dark editor themes
✨ **Tab-Based Workflow**: Work on multiple queries simultaneously
✨ **Smart SQL Editor**: Syntax highlighting, auto-completion, and line wrapping
✨ **Dynamic Data Loading**: Tables load on demand for maximum performance
✨ **Result Statistics**: Track query execution time and result counts
✨ **Responsive Design**: Works well on desktops, tablets, and mobile devices

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm 7.x or higher

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/modern-sql-editor.git
   cd modern-sql-editor
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
sqleditor/
├── public/           # Static assets and data files
├── src/              # Source code
│   ├── components/   # React components
│   │   ├── navigation/  # Navigation components
│   │   ├── query/       # SQL editor components
│   │   ├── table/       # Table components
│   │   └── tabs/        # Tab management components
│   ├── css/          # CSS styles
│   ├── data/         # Data utilities and definitions
│   ├── hooks/        # Custom React hooks
│   ├── App.jsx       # Main application component
│   ├── App.css       # Application styles
│   ├── index.css     # Global styles
│   ├── main.jsx      # Application entry point
│   └── utils.jsx     # Utility functions
├── index.html        # HTML template
├── vite.config.js    # Vite configuration
└── package.json      # Dependencies and scripts
```

## Available Scripts

In the project directory, you can run:

### `npm run dev`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run build`

Builds the app for production to the `build` folder.\
It optimizes the build for the best performance.

### `npm run preview`

Previews the production build locally.

## Performance Optimizations

- **Vite HMR**: Fast hot module replacement during development
- **Code Splitting**: Load components on demand for faster initial load
- **Dynamic Data Loading**: Fetch data only when needed
- **Modern React Patterns**: Functional components and hooks throughout
- **CSS Optimizations**: Clean, minimal styles for fast rendering

## License

This project is open source and available under the MIT License.
