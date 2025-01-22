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
  const [expandedMappings, setExpandedMappings] = useState({});

  const toggleMappingsDetails = (mappingsId) => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mappingsId]: !prev[mappingsId],
    }));
  };

  useEffect(() => {
    const initialEditedRequests = {};
    const initialEditedResponses = {};
    const initialSelections = {};

    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );
      initialEditedRequests[mapping.id] = {
        url: mapping.request.url || "",
        headers: JSON.stringify(mapping.request.headers || {}, null, 2),
        body: JSON.stringify(mapping.request.body || {}, null, 2),
        title: mapping.request.title || "",
      };

      if (relevantResponses.length > 0) {
        const defaultResponse = relevantResponses[0];
        initialSelections[mapping.id] = defaultResponse.id;
        initialEditedResponses[mapping.id] = {
          status: defaultResponse.resJson.status || "",
          headers: JSON.stringify(
            defaultResponse.resJson.headers || {},
            null,
            2
          ),
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
        title: editedRequests[reqId].title,
        url: editedRequests[reqId].url,
        method: editedRequests[reqId].method,
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
      alert(
        "Invalid JSON format in the request. Please check headers or body."
      );
    }
  };

  const saveEditedResponse = (responseId, mappingId) => {
    if (!editedResponses[mappingId]) {
      alert("No edited response data found for this mapping.");
      return;
    }

    try {
      const updatedResponse = {
        status: editedResponses[mappingId]?.status,
        headers: editedResponses[mappingId]?.headers
          ? JSON.parse(editedResponses[mappingId]?.headers)
          : {},
        body: editedResponses[mappingId]?.body
          ? JSON.parse(editedResponses[mappingId]?.body)
          : {},
      };
      handleUpdateResponse(responseId, updatedResponse);
      setIsEditingResponse((prev) => ({ ...prev, [responseId]: false }));
      alert("Response updated successfully!");
    } catch (error) {
      console.error("Error parsing response JSON:", error);
      alert(
        "Invalid JSON format in the response. Please check headers or body."
      );
    }
  };

  const handleResponseSelectionChange = (mappingId, responseId) => {
    const selectedResponse = responses.find((res) => res.id === responseId);
    if (selectedResponse) {
      setEditedResponses((prev) => ({
        ...prev,
        [mappingId]: {
          status: selectedResponse.resJson.status || "",
          headers: JSON.stringify(
            selectedResponse.resJson.headers || {},
            null,
            2
          ),
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
            const isExpanded = expandedMappings[mapping.id];
            const editedRequest = editedRequests[mapping.id] || {};
            const relevantResponses = responses.filter(
              (res) => res.reqId === mapping.id
            );

            return (
              <li key={index} className={styles.mappingItem}>
                <div
                  className={styles.titleRow}
                  onClick={() => toggleMappingsDetails(mapping.id)}
                >
                  <h3>{editedRequest.title || "Untitled Mapping"}</h3>
                  <button className={styles.toggleButton}>
                    {isExpanded ? "Hide Details" : "Show Details"}
                  </button>
                </div>

                {isExpanded && (
                  <div className={styles.details}>
                    <h4>Request</h4>
                    <strong>Titel:</strong> {editedRequest.title}
                    <pre>
                      {JSON.stringify(
                        (({ title, ...rest }) => rest)(mapping.request),
                        null,
                        2
                      )}
                    </pre>
                    {isEditingRequest[mapping.id] ? (
                      <div>
                        <label>URL</label>
                        <input
                          type="text"
                          value={editedRequest.url || ""}
                          onChange={(e) =>
                            handleRequestFieldChange(
                              mapping.id,
                              "url",
                              e.target.value
                            )
                          }
                        />

                        <label>Method</label>
                        <input
                          type="text"
                          value={editedRequest.method || ""}
                          onChange={(e) =>
                            handleRequestFieldChange(
                              mapping.id,
                              "method",
                              e.target.value
                            )
                          }
                        />

                        <label>Headers (JSON)</label>
                        <textarea
                          value={editedRequest.headers}
                          onChange={(e) =>
                            handleRequestFieldChange(
                              mapping.id,
                              "headers",
                              e.target.value
                            )
                          }
                        />
                        <label>Body (JSON)</label>
                        <textarea
                          value={editedRequest.body}
                          onChange={(e) =>
                            handleRequestFieldChange(
                              mapping.id,
                              "body",
                              e.target.value
                            )
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
                        <button
                          onClick={() =>
                            setIsEditingRequest((prev) => ({
                              ...prev,
                              [mapping.id]: true,
                            }))
                          }
                          className={styles.editButton}
                        >
                          Edit Request
                        </button>
                      </div>
                    )}
                    <div>
                      <h4>
                        Responses{" "}
                        <button
                          onClick={() => navigate(`/request/${mapping.id}`)}
                          className={styles.detailsButton}
                        >
                          Add New Response
                        </button>
                      </h4>
                    </div>
                    {relevantResponses.length > 0 ? (
                      <div>
                        <select
                          value={selectedResponses[mapping.id] || ""}
                          onChange={(e) =>
                            handleResponseSelectionChange(
                              mapping.id,
                              e.target.value
                            )
                          }
                          disabled={
                            isEditingResponse[selectedResponses[mapping.id]]
                          }
                        >
                          {relevantResponses.map((response) => (
                            <option key={response.id} value={response.id}>
                              {response.id} -{" "}
                              {response.resJson.status || "No Status"}
                            </option>
                          ))}
                        </select>
                        {selectedResponses[mapping.id] ? (
                          <div>
                            <pre>
                              {JSON.stringify(
                                relevantResponses.find(
                                  (res) =>
                                    res.id === selectedResponses[mapping.id]
                                )?.resJson || {},
                                null,
                                2
                              )}
                            </pre>
                            {isEditingResponse[
                              selectedResponses[mapping.id]
                            ] ? (
                              <div>
                                <label>Status</label>
                                <input
                                  type="text"
                                  value={
                                    editedResponses[mapping.id]?.status || ""
                                  }
                                  onChange={(e) =>
                                    handleResponseFieldChange(
                                      mapping.id,
                                      "status",
                                      e.target.value
                                    )
                                  }
                                />
                                <label>Headers (JSON)</label>
                                <textarea
                                  value={
                                    editedResponses[mapping.id]?.headers || ""
                                  }
                                  onChange={(e) =>
                                    handleResponseFieldChange(
                                      mapping.id,
                                      "headers",
                                      e.target.value
                                    )
                                  }
                                />
                                <label>Body (JSON)</label>
                                <textarea
                                  value={
                                    editedResponses[mapping.id]?.body || ""
                                  }
                                  onChange={(e) =>
                                    handleResponseFieldChange(
                                      mapping.id,
                                      "body",
                                      e.target.value
                                    )
                                  }
                                />
                                <button
                                  onClick={() =>
                                    saveEditedResponse(
                                      selectedResponses[mapping.id],
                                      mapping.id
                                    )
                                  }
                                  className={styles.saveButton}
                                >
                                  Save Response
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setIsEditingResponse((prev) => ({
                                    ...prev,
                                    [selectedResponses[mapping.id]]: true,
                                  }))
                                }
                                className={styles.editButton}
                              >
                                Edit Response
                              </button>
                            )}
                          </div>
                        ) : (
                          <p>No selected response to display.</p>
                        )}
                      </div>
                    ) : (
                      <p>No responses available.</p>
                    )}
                    <button
                      onClick={() => handleDelete(mapping.id)}
                      className={styles.deleteButton}
                    >
                      Delete Mapping
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
};

export default MappingsPage;
