import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import ButtonGroup from "react-bootstrap/ButtonGroup";
import Button from "react-bootstrap/Button";
import Spinner from "react-bootstrap/Spinner";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faDownload } from "@fortawesome/free-solid-svg-icons/faDownload";
import { faSave } from "@fortawesome/free-solid-svg-icons/faSave";

import { getPropTypes } from "../../utils";

/**
 * The component to display the buttons in the query space.
 * @param {Object} props - Component props
 * @param {Function} props.onRunQuery - Function to execute when Run Query button is clicked
 * @param {boolean} props.isLoading - Whether a query is currently running
 * @returns {JSX.Element}
 * @constructor
 */
function QueryButtons({ onRunQuery, isLoading = false }) {
  const handleRunQuery = (e) => {
    e.preventDefault();
    if (onRunQuery) {
      onRunQuery();
    }
  };

  return (
    <ButtonToolbar className="mb-3 mt-3">
      <ButtonGroup className="me-2">
        <Button
          size={"sm"}
          variant={isLoading ? "secondary" : "outline-primary"}
          disabled={isLoading}
          onClick={handleRunQuery}
          style={{
            borderLeft: "none",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: 0,
            padding: "0.5rem",
          }}
          className={"mr-2 query-button"}
        >
          {isLoading ? (
            <>
              <Spinner
                as="span"
                animation="border"
                size="sm"
                role="status"
                aria-hidden="true"
                className="me-1"
              />
              Running...
            </>
          ) : (
            <>
              <FontAwesomeIcon icon={faPlay} /> Run Query
            </>
          )}
        </Button>

        <Button
          size={"sm"}
          variant={"outline-primary"}
          style={{
            borderLeft: "none",
            borderTop: "none",
            borderBottom: "none",
            borderRadius: 0,
            padding: "0.5rem",
          }}
          className={"mr-2 query-button"}
          disabled={isLoading}
        >
          <FontAwesomeIcon icon={faSave} /> Save Query
        </Button>

      
       
      </ButtonGroup>
    </ButtonToolbar>
  );
}

QueryButtons.propTypes = getPropTypes("onRunQuery", "isLoading");

export default QueryButtons;
