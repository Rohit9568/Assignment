import { useState, useCallback, useEffect } from 'react'; // Import useEffect
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getPropTypes } from "../../utils";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExpandAlt, faCompressAlt } from '@fortawesome/free-solid-svg-icons';

// Sample queries for users to try
const SAMPLE_QUERIES = [
    'SELECT * FROM customers',
    'SELECT product_name, price FROM products WHERE category = "electronics"',
    'SELECT orders.order_id, customers.name FROM orders JOIN customers ON orders.customer_id = customers.id'
];

const QuerySpace = ({ defaultQuery = 'SELECT * FROM employees', onChange, isQuerySpaceFullscreen }) => {
    const [value, setValue] = useState(defaultQuery);
    const [isDarkTheme, setIsDarkTheme] = useState(false);

    const handleChange = useCallback((value) => {
        setValue(value);
        if (onChange) onChange(value);
    }, [onChange]);

    const toggleTheme = useCallback(() => {
        setIsDarkTheme(!isDarkTheme);
    }, [isDarkTheme]);

    // Update the 'value' state when the 'defaultQuery' prop changes
    useEffect(() => {
        setValue(defaultQuery);
    }, [defaultQuery]);

    return (
        <div className={`query-editor ${isQuerySpaceFullscreen ? 'fullscreen' : ''}`}>
            <div className="editor-actions d-flex justify-content-between align-items-center mb-2">
                <div className="editor-title">
                    <h5 className="m-0">SQL Query Editor</h5>
                </div>
                <ButtonGroup>
                    <Button
                        variant={isDarkTheme ? 'outline-light' : 'outline-dark'}
                        onClick={toggleTheme}
                        size="sm"
                    >
                        {isDarkTheme ? '☀️ Light' : '🌙 Dark'}
                    </Button>
                </ButtonGroup>
            </div>
            <div className={`code-editor-container ${isDarkTheme ? 'theme-dark' : 'theme-light'}`}>
                <CodeMirror
                    value={value}
                    height={isQuerySpaceFullscreen ? 'calc(100vh - 56px)' : '200px'} // Adjust height calculation
                    theme={isDarkTheme ? 'dark' : 'light'}
                    extensions={[sql()]}
                    onChange={handleChange}
                    className="code-editor"
                    style={{
                        fontSize: '14px',
                        fontFamily: '"Fira Code", monospace',
                        borderRadius: '4px',
                        border: '1px solid #dee2e6'
                    }}
                />
            </div>
        </div>
    );
};

QuerySpace.propTypes = getPropTypes("defaultQuery", "onChange", "isQuerySpaceFullscreen");

export default QuerySpace;