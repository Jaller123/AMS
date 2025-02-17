import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";

const ResponseEditor = ({
  mappingId,
  relevantResponses,
  editedResponse,
  setEditedResponse,
  selectedResponse,
  setSelectedResponse,
  handleUpdateResponse,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [localResponse, setLocalResponse] = useState({});

  const navigate = useNavigate();

  const goToDetails = (mappingId) => {
    navigate(`/request/${mappingId}`);
  };

  // Initialize `localResponse` when `editedResponse` or `selectedResponse` changes
  useEffect(() => {
    const selectedRes =
      relevantResponses.find((res) => res.id === selectedResponse) || {};
    setLocalResponse({
      ...selectedRes.resJson,
      headers: selectedRes.resJson?.headers || {}, // Keep as an object
      body: selectedRes.resJson?.body || {}, // Keep as an object
    });
    console.log("Updated Responses:", relevantResponses);
  }, [editedResponse, selectedResponse, relevantResponses]);

  const saveResponse = () => {
    try {
      const updatedResponse = {
        ...localResponse,
        headers:
          typeof localResponse.headers === "string"
            ? JSON.parse(localResponse.headers)
            : localResponse.headers,
        body:
          typeof localResponse.body === "string"
            ? JSON.parse(localResponse.body)
            : localResponse.body,
      };
      handleUpdateResponse(selectedResponse, updatedResponse);
      setIsEditing(false);
    } catch (error) {
      alert("Invalid JSON in headers or body.");
    }
  };

  return (
    <div className={styles.Response}>
      <h4>Response</h4>
      {isEditing ? (
        <div>
          <label>Status</label>
          <input
            placeholder="Status"
            type="text"
            value={localResponse.status || ""}
            onChange={(e) =>
              setLocalResponse({ ...localResponse, status: e.target.value })
            }
          />
          <label>Headers (JSON)</label>
          <textarea
            value={
              typeof localResponse.headers === "string"
                ? localResponse.headers
                : JSON.stringify(localResponse.headers, null, 2)
            }
            onChange={(e) =>
              setLocalResponse({ ...localResponse, headers: e.target.value })
            }
          />
          <label>Body (JSON)</label>
          <textarea
            placeholder="Body"
            value={
              typeof localResponse.body === "string"
                ? localResponse.body
                : JSON.stringify(localResponse.body, null, 2)
            }
            onChange={(e) =>
              setLocalResponse({ ...localResponse, body: e.target.value })
            }
          />
          <button className={styles.saveResponseButton} onClick={saveResponse}>Save Response</button>
        </div>
      ) : (
        <div>
          <select placeholder="Select Response"
            value={selectedResponse || ""}
            onChange={(e) => {
              const response = relevantResponses.find((res) => res.id === e.target.value);
              setSelectedResponse(response?.id || "");
              setEditedResponse(response?.resJson || {});
            }}
          >
            {relevantResponses.map((response) => (
              <option key={response.id} value={response.id}>
                {response.id} - {response.resJson?.status || "No Status"}
              </option>
            ))}
          </select>
          <pre className={styles.preresponse}>{JSON.stringify(localResponse, null, 2)}</pre>
          <div className={styles.buttonContainer}>
           <button onClick={() => setIsEditing(true)} className={styles.ButtonEdit}>Edit Response</button>
          <button
            onClick={() => navigate(`/request/${mappingId}`)}
            className={styles.detailsButton}
          >
            Add New Response
          </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseEditor;
