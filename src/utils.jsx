import { PROP_TYPES } from "./data/propTypes";
import DEFAULT_QUERIES from "./data/defaultQueries";

export const addTab = (tabs, title, entries, queryCount) => {
  const newTab = {
    title: title,
    href: "#",
    eventKey: `query_${queryCount}`,
    entries: entries || [],
    content: DEFAULT_QUERIES.default,
  };
  
  const newTabs = [...tabs, newTab];
  const newActiveKey = newTab.eventKey;
  document.title = `${newActiveKey} | SQL Query Editor`;
  
  return [newTabs, newActiveKey];
};

export const openNewTab = (
  { title, entries },
  tabs,
  setTabs,
  setActiveKey,
  defaultQuery = ""
) => {
  const existingTab = tabs.filter((tab) => {
    return tab.eventKey === title;
  });
  
  const queryToUse = defaultQuery || 
                    (DEFAULT_QUERIES[title] || DEFAULT_QUERIES.default);
  
  if (existingTab.length === 0) {
    tabs.push({
      title: title,
      href: "#",
      eventKey: title,
      entries: entries || [],
      content: queryToUse,
    });
    setTabs(tabs);
    setActiveKey(tabs[tabs.length - 1].eventKey);
    document.title = `${
      tabs[tabs.length - 1].eventKey
    } | SQL Query Editor`;
  } else {
    setActiveKey(existingTab[0].eventKey);
    document.title = `${existingTab[0].eventKey} | SQL Query Editor`;
  }
};

export const closeTab = (eventKey, tabs) => {
  const tabToBeClosed = tabs.findIndex((tab) => tab.eventKey === eventKey);
  const copiedTabs = [...tabs];
  copiedTabs.splice(tabToBeClosed, 1);
  let newActiveKey = "";
  if (copiedTabs.length > 0) {
    newActiveKey = copiedTabs[tabToBeClosed % copiedTabs.length].eventKey;
    document.title = `${newActiveKey} | SQL Query Editor`;
  } else {
    document.title = "SQL Query Editor";
  }

  return [copiedTabs, newActiveKey];
};

/**
 * Custom function for parsing the CSVs obtained from the APIs.
 * @param {string} text
 * @param {string|RegExp} rowDelimiter
 * @param {string|RegExp} entryDelimiter
 */
export const parseCSV = (text, rowDelimiter = "\n", entryDelimiter = ",") => {
  const lines = text.split(rowDelimiter);
  const headers = lines[0].split(entryDelimiter);
  const rows = [];
  lines.slice(1, lines.length - 1).forEach((line) => {
    const entries = line.split(entryDelimiter);
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = index < entries.length ? entries[index] : null;
    });
    rows.push(obj);
  });
  return rows;
};

export const getFieldDetails = (fieldName) => {
  if (fieldName.search("ID") !== -1) {
    return {
      type: "Number",
      processFn: parseInt,
    };
  }
  return {
    type: "String",
    processFn: (x) => x,
  };
};

export const getPropTypes = function () {
  const propTypes = {};
  for (let i = 0; i < arguments.length; i++) {
    if (PROP_TYPES.hasOwnProperty(arguments[i])) {
      propTypes[arguments[i]] = PROP_TYPES[arguments[i]];
    }
  }
  return propTypes;
};
