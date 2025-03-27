import { useState, useCallback, useEffect, useRef } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { sql } from '@codemirror/lang-sql';
import { Button, ButtonGroup } from 'react-bootstrap';
import { getPropTypes } from "../../utils";
import { autocompletion, CompletionContext } from '@codemirror/autocomplete';

const QuerySpace = ({ defaultQuery = 'SELECT * FROM employees', onChange, isQuerySpaceFullscreen }) => {
    const [value, setValue] = useState(defaultQuery);
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const cmRef = useRef();

    const handleChange = useCallback((value) => {
        setValue(value);
        if (onChange) onChange(value);
    }, [onChange]);

    const toggleTheme = useCallback(() => {
        setIsDarkTheme(!isDarkTheme);
    }, [isDarkTheme]);

    // ✅ List of SQL keywords for autocomplete (uppercase)
    const sqlKeywords = [
        "SELECT", "FROM", "WHERE", "INSERT", "UPDATE", "DELETE", "JOIN", "INNER JOIN",
        "LEFT JOIN", "RIGHT JOIN", "FULL JOIN", "GROUP BY", "ORDER BY", "HAVING", "DISTINCT",
        "IN", "NOT IN", "EXISTS", "LIKE", "IS NULL", "IS NOT NULL", "BETWEEN", "UNION", 
        "CASE", "WHEN", "THEN", "ELSE", "END", "LIMIT", "OFFSET", "AS"
    ];

    const uppercaseCompletionSource = (context) => {
        const word = context.matchBefore(/\w*$/);
        if (!word) return null;

        const completions = sqlKeywords.map(keyword => ({
            label: keyword,
            type: "keyword",
            apply: (view, completion) => {
                // ✅ Calculate start of the current word and replace it with the suggestion
                const from = word.from;
                const to = context.state.selection.main.head;
                const insertText = completion.label.toUpperCase();

                view.dispatch({
                    changes: [{ from, to, insert: insertText }],
                    selection: { anchor: from + insertText.length }
                });
            }
        }));

        return {
            from: word.from,
            options: completions,
            validFor: /^\w*$/,
        };
    };

    const customAutocomplete = () => [
        sql(),
        autocompletion({
            override: [uppercaseCompletionSource],
            activateOnTyping: true,
        }),
    ];

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
                    ref={cmRef}
                    value={value}
                    height={isQuerySpaceFullscreen ? 'calc(100vh - 56px)' : '200px'}
                    theme={isDarkTheme ? 'dark' : 'light'}
                    extensions={customAutocomplete()}
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
