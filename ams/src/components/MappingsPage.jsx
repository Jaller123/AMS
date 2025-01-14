import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";

const MappingsPage = ({
  mappings = [],
  responses = [],
  handleDelete,
  handleUpdateRequest,
  handleUpdateResponse,
}) => {
  const navigate = useNavigate();

  const goToDetails = (mappingId) => {
    navigate(`/request/${mappingId}`);
  };

  const [isEditingRequest, setIsEditingRequest] = useState({});
  const [editedRequests, setEditedRequests] = useState({});
  const [isEditingResponse, setIsEditingResponse] = useState({});
  const [editedResponses, setEditedResponses] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});

  useEffect(() => {
    const initialEditedRequests = {};
    const initialEditedResponses = {};
    const initialSelections = {};

    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter((res) => res.reqId === mapping.id);
      initialEditedRequests[mapping.id] = {
        url: mapping.request.url || "",
        headers: JSON.stringify(mapping.request.headers || {}, null, 2),
        body: JSON.stringify(mapping.request.body || {}, null, 2),
      };

      if (relevantResponses.length > 0) {
        const defaultResponse = relevantResponses[0];
        initialSelections[mapping.id] = defaultResponse.id;
        initialEditedResponses[mapping.id] = {
          status: defaultResponse.resJson.status || "",
          headers: JSON.stringify(defaultResponse.resJson.headers || {}, null, 2),
          body: JSON.stringify(defaultResponse.resJson.body || {}, null, 2),
        };
      }
    });

    setEditedRequests(initialEditedRequests);
    setEditedResponses(initialEditedResponses);
    setSelectedResponses(initialSelections);
  }, [mappings, responses]);

  const handleRequestFieldChange = (reqId, field, value) => {
    setEditedRequests((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        [field]: value,
      },
    }));
  };

  const handleResponseFieldChange = (reqId, field, value) => {
    setEditedResponses((prev) => ({
      ...prev,
      [reqId]: {
        ...prev[reqId],
        [field]: value,
      },
    }));
  };

  const saveEditedRequest = (reqId) => {
    try {
      const updatedRequest = {
        url: editedRequests[reqId].url,
        headers: editedRequests[reqId].headers
          ? JSON.parse(editedRequests[reqId].headers)
          : {},
        body: editedRequests[reqId].body
          ? JSON.parse(editedRequests[reqId].body)
          : {},
      };
      handleUpdateRequest(reqId, updatedRequest);
      setIsEditingRequest((prev) => ({ ...prev, [reqId]: false }));
      alert("Request updated successfully!");
    } catch (error) {
      console.error("Error parsing request JSON:", error);
      alert("Invalid JSON format in the request. Please check headers or body.");
    }
  };

  const saveEditedResponse = (responseId, reqId) => {
    try {
      const updatedResponse = {
        status: editedResponses[reqId].status,
        headers: editedResponses[reqId].headers
          ? JSON.parse(editedResponses[reqId].headers)
          : {},
        body: editedResponses[reqId].body
          ? JSON.parse(editedResponses[reqId].body)
          : {},
      };
      handleUpdateResponse(responseId, updatedResponse);
      setIsEditingResponse((prev) => ({ ...prev, [reqId]: false }));
      alert("Response updated successfully!");
    } catch (error) {
      console.error("Error parsing response JSON:", error);
      alert("Invalid JSON format in the response. Please check headers or body.");
    }
  };

  const handleResponseSelectionChange = (mappingId, responseId) => {
    const selectedResponse = responses.find((res) => res.id === responseId);
    if (selectedResponse) {
      setEditedResponses((prev) => ({
        ...prev,
        [mappingId]: {
          status: selectedResponse.resJson.status || "",
          headers: JSON.stringify(selectedResponse.resJson.headers || {}, null, 2),
          body: JSON.stringify(selectedResponse.resJson.body || {}, null, 2),
        },
      }));
    }
    setSelectedResponses((prev) => ({
      ...prev,
      [mappingId]: responseId,
    }));
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
            const selectedResponseId = selectedResponses[mapping.id] || "";
            const editedRequest = editedRequests[mapping.id] || {};
            const editedResponse = editedResponses[mapping.id] || {};

            return (
              <li key={index} className={styles.mappingItem}>
                <h3>Request</h3>
                {isEditingRequest[mapping.id] ? (
                  <div>
                    <label>URL</label>
                    <input
                      type="text"
                      value={editedRequest.url}
                      onChange={(e) =>
                        handleRequestFieldChange(mapping.id, "url", e.target.value)
                      }
                    />
                    <label>Headers (JSON)</label>
                    <textarea
                      value={editedRequest.headers}
                      onChange={(e) =>
                        handleRequestFieldChange(mapping.id, "headers", e.target.value)
                      }
                    />
                    <label>Body (JSON)</label>
                    <textarea
                      value={editedRequest.body}
                      onChange={(e) =>
                        handleRequestFieldChange(mapping.id, "body", e.target.value)
                      }
                    />
                    <button
                      onClick={() => saveEditedRequest(mapping.id)}
                      className={styles.saveButton}
                    >
                      Save Request
                    </button>
                  </div>
                ) : (
                  <div>
                    <pre>{JSON.stringify(mapping.request, null, 2)}</pre>
                    <button
                      onClick={() =>
                        setIsEditingRequest((prev) => ({ ...prev, [mapping.id]: true }))
                      }
                      className={styles.editButton}
                    >
                      Edit Request
                    </button>
                  </div>
                )}

                <h3>Response</h3>
                {relevantResponses.length > 0 ? (
                  <div>
                    <select
                      onChange={(e) =>
                        handleResponseSelectionChange(mapping.id, e.target.value)
                      }
                      value={selectedResponseId}
                      disabled={isEditingRequest[mapping.id] || isEditingResponse[mapping.id]}
                    >
                      {relevantResponses.map((response) => (
                        <option key={response.id} value={response.id}>
                          {response.id} - {response.timestamp}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => goToDetails(mapping.id)}
                      className={styles.detailsButton}
                    >
                      Add New Response
                    </button>
                    {isEditingResponse[mapping.id] ? (
                      <div>
                        <label>Status</label>
                        <input
                          type="text"
                          value={editedResponse.status}
                          onChange={(e) =>
                            handleResponseFieldChange(mapping.id, "status", e.target.value)
                          }
                        />
                        <label>Headers (JSON)</label>
                        <textarea
                          value={editedResponse.headers}
                          onChange={(e) =>
                            handleResponseFieldChange(mapping.id, "headers", e.target.value)
                          }
                        />
                        <label>Body (JSON)</label>
                        <textarea
                          value={editedResponse.body}
                          onChange={(e) =>
                            handleResponseFieldChange(mapping.id, "body", e.target.value)
                          }
                        />
                        <button
                          onClick={() =>
                            saveEditedResponse(selectedResponseId, mapping.id)
                          }
                          className={styles.saveButton}
                        >
                          Save Response
                        </button>
                      </div>
                    ) : (
                      <pre>
                        {JSON.stringify(
                          relevantResponses.find(
                            (res) => res.id === selectedResponseId
                          )?.resJson,
                          null,
                          2
                        )}
                      </pre>
                    )}
                    {!isEditingResponse[mapping.id] && (
                      <button
                        onClick={() =>
                          setIsEditingResponse((prev) => ({
                            ...prev,
                            [mapping.id]: true,
                          }))
                        }
                        className={styles.editButton}
                      >
                        Edit Response
                      </button>
                    )}
                  </div>
                ) : (
                  <div>
                    <p>No responses available</p>
                    <button
                      onClick={() => goToDetails(mapping.id)}
                      className={styles.detailsButton}
                    >
                      Add New Response
                    </button>
                  </div>
                )}
                <button
                  onClick={() => handleDelete(mapping.id)}
                  className={styles.deleteButton}
                >
                  Delete Mapping
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
