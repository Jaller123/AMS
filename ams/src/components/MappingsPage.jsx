import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";

const MappingsPage = ({ mappings = [], responses = [], handleDelete }) => {
  const [selectedResponses, setSelectedResponses] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const initialSelections = {};
    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );
      if (relevantResponses.length > 0) {
        initialSelections[mapping.id] = relevantResponses[0].id; // Default to first response
      }
    });
    setSelectedResponses(initialSelections);
  }, [mappings, responses]);

  const handleResponseChange = (reqId, responseId) => {
    setSelectedResponses((prev) => ({
      ...prev,
      [reqId]: responseId,
    }));
  };

  const goToDetails = (mappingId, selectedResponseId) => {
    navigate(`/mapping/${mappingId}`, { state: { selectedResponseId } });
  };

  return (
    <section className={styles.section}>
      <h2>Saved Mappings</h2>
      {mappings.length === 0 ? (
        <p>No mappings saved yet.</p>
      ) : (
        <ul className={styles.mappingList}>
          {mappings.map((mapping, index) => {
            const relevantResponses = responses.filter(
              (res) => res.reqId === mapping.id
            );

            return (
              <li key={index} className={styles.mappingItem}>
                <h3>Request</h3>
                <pre>{JSON.stringify(mapping.request, null, 2)}</pre>
                <h3>Response</h3>
                {relevantResponses.length > 0 ? (
                  <div>
                    <label htmlFor={`response-dropdown-${index}`}>
                      Select Response:
                    </label>
                    <select
                      id={`response-dropdown-${index}`}
                      className={styles.selectDropdown}
                      onChange={(e) =>
                        handleResponseChange(mapping.id, e.target.value)
                      }
                      value={selectedResponses[mapping.id] || ""}
                    >
                      {relevantResponses.map((response) => (
                        <option key={response.id} value={response.id}>
                          {response.id} - {response.timestamp}
                        </option>
                      ))}
                    </select>{" "}
                    <button
                      onClick={() => navigate(`/request/${mapping.id}`)}
                      className={styles.detailsButton}
                    >
                      Add New Response
                    </button>
                    {selectedResponses[mapping.id] && (
                      <pre>
                        {JSON.stringify(
                          relevantResponses.find(
                            (res) => res.id === selectedResponses[mapping.id]
                          )?.resJson,
                          null,
                          2
                        )}
                      </pre>
                    )}
                  </div>
                ) : (
                  <pre>No responses</pre>
                )}
                <button
                  onClick={() =>
                    goToDetails(mapping.id, selectedResponses[mapping.id])
                  }
                  className={styles.detailsButton}
                >
                  View Details
                </button>
                <button
                  onClick={() => handleDelete(mapping.id)}
                  className={styles.deleteButton}
                >
                  Delete
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default MappingsPage;
