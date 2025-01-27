import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SortControls from "./SortControls";
import styles from "./MappingsPage.module.css";

const MappingsPage = ({
  mappings,
  responses,
  handleUpdateRequest,
  handleUpdateResponse,
  handleDelete,
}) => {
  const navigate = useNavigate();

  const goToDetails = (mappingId) => {
    navigate(`/request/${mappingId}`);
  };

  const [editingRequest, setEditingRequest] = useState(null);
  const [editingResponse, setEditingResponse] = useState(null);
  const [editedRequestData, setEditedRequestData] = useState({});
  const [editedResponseData, setEditedResponseData] = useState({});
  const [expandedMappings, setExpandedMappings] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});
  const [sortCriterion, setSortCriterion] = useState("title");
  const [searchFilters, setSearchFilters] = useState({
    title: "",
    url: "",
    method: "",
  });
  const [sortedFilteredMappings, setSortedFilteredMappings] = useState([]);

  useEffect(() => {
    const initialSelections = {};
    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );
      if (relevantResponses.length > 0) {
        initialSelections[mapping.id] = relevantResponses[0].id; // Default to the first response
      }
    });
    setSelectedResponses(initialSelections);
  }, [mappings, responses]);

  const toggleEditRequest = (mappingId, request) => {
    if (editingRequest === mappingId) {
      setEditingRequest(null);
    } else {
      setEditingRequest(mappingId);
      setEditedRequestData(request);
    }
  };

  useEffect(() => {
    const filteredMappings = mappings.filter((mapping) => {
      const { title, url, method } = searchFilters;

      const matchTitle =
        title === "" || mapping.request.title?.toLowerCase().includes(title);
      const matchURL =
        url === "" || mapping.request.url?.toLowerCase().includes(url);
      const matchMethod =
        method === "" || mapping.request.method?.toLowerCase().includes(method);

      return matchTitle && matchURL && matchMethod;
    });

    const sortedMappings = filteredMappings.sort((a, b) => {
      const fieldA = a.request[sortCriterion]?.toLowerCase() || "";
      const fieldB = b.request[sortCriterion]?.toLowerCase() || "";
      return fieldA.localeCompare(fieldB);
    });

    setSortedFilteredMappings(sortedMappings);
  }, [sortCriterion, searchFilters, mappings]);

  const toggleMappingDetails = (mappingId) => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mappingId]: !prev[mappingId],
    }));
  };

  const handleSaveRequest = (mappingId) => {
    handleUpdateRequest(mappingId, editedRequestData);
    setEditingRequest(null);
  };

  const handleSaveResponse = (responseId) => {
    handleUpdateResponse(responseId, editedResponseData);
    setEditingResponse(null);
  };

  const handleResponseSelectionChange = (mappingId, responseId) => {
    setSelectedResponses((prev) => ({
      ...prev,
      [mappingId]: responseId,
    }));
  };

  return (
    <section className={styles.section}>
      <h2>Saved Mappings</h2>
      <SortControls
        sortCriterion={sortCriterion}
        setSortCriterion={setSortCriterion}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      {sortedFilteredMappings.map((mapping) => {
        const relevantResponses = responses.filter(
          (res) => res.reqId === mapping.id
        );
        const selectedResponse =
          relevantResponses.find(
            (res) => res.id === selectedResponses[mapping.id]
          ) || {};

        return (
          <div key={mapping.id} className={styles.mappingItem}>
            <div
              className={styles.titleRow}
              onClick={() => toggleMappingDetails(mapping.id)}
            >
              <h3>{mapping.request.method || "Untitled Method"}</h3>
              <h3>{mapping.request.url || "Untitled URL"}</h3>
              <h3>{mapping.request.title || "Untitled Title"}</h3>
              <button className={styles.toggleButton}>
                {expandedMappings[mapping.id] ? "Hide Details" : "Show Details"}
              </button>
            </div>

            {expandedMappings[mapping.id] && (
              <div className={styles.details}>
                <h4>Request</h4>
                <pre>{JSON.stringify(mapping.request, null, 2)}</pre>

                {editingRequest === mapping.id ? (
                  <div>
                    <label>URL:</label>
                    <input
                      type="text"
                      value={editedRequestData.url || ""}
                      onChange={(e) =>
                        setEditedRequestData({
                          ...editedRequestData,
                          url: e.target.value,
                        })
                      }
                    />
                    <label>Method:</label>
                    <input
                      type="text"
                      value={editedRequestData.method || ""}
                      onChange={(e) =>
                        setEditedRequestData({
                          ...editedRequestData,
                          method: e.target.value,
                        })
                      }
                    />
                    <label>Headers (JSON):</label>
                    <textarea
                      value={JSON.stringify(
                        editedRequestData.headers || {},
                        null,
                        2
                      )}
                      onChange={(e) =>
                        setEditedRequestData({
                          ...editedRequestData,
                          headers: JSON.parse(e.target.value || "{}"),
                        })
                      }
                    />
                    <label>Body (JSON):</label>
                    <textarea
                      value={JSON.stringify(
                        editedRequestData.body || {},
                        null,
                        2
                      )}
                      onChange={(e) =>
                        setEditedRequestData({
                          ...editedRequestData,
                          body: JSON.parse(e.target.value || "{}"),
                        })
                      }
                    />
                    <button
                      onClick={() => handleSaveRequest(mapping.id)}
                      className={styles.saveButton}
                    >
                      Save Request
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() =>
                      toggleEditRequest(mapping.id, mapping.request)
                    }
                    className={styles.editButton}
                  >
                    Edit Request
                  </button>
                )}

                <h4>Responses</h4>
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
                        editingRequest === mapping.id ||
                        editingResponse === selectedResponses[mapping.id]
                      }
                    >
                      {relevantResponses.map((response) => (
                        <option key={response.id} value={response.id}>
                          {response.id} -{" "}
                          {response.resJson.status || "No Status"}
                        </option>
                      ))}
                    </select>

                    <pre>
                      {JSON.stringify(selectedResponse.resJson || {}, null, 2)}
                    </pre>

                    {editingResponse === selectedResponses[mapping.id] ? (
                      <div>
                        <label>Status:</label>
                        <input
                          type="text"
                          value={editedResponseData.status || ""}
                          onChange={(e) =>
                            setEditedResponseData({
                              ...editedResponseData,
                              status: e.target.value,
                            })
                          }
                        />
                        <label>Headers (JSON):</label>
                        <textarea
                          value={JSON.stringify(
                            editedResponseData.headers || {},
                            null,
                            2
                          )}
                          onChange={(e) =>
                            setEditedResponseData({
                              ...editedResponseData,
                              headers: JSON.parse(e.target.value || "{}"),
                            })
                          }
                        />
                        <label>Body (JSON):</label>
                        <textarea
                          value={JSON.stringify(
                            editedResponseData.body || {},
                            null,
                            2
                          )}
                          onChange={(e) =>
                            setEditedResponseData({
                              ...editedResponseData,
                              body: JSON.parse(e.target.value || "{}"),
                            })
                          }
                        />
                        <button
                          onClick={() =>
                            handleSaveResponse(selectedResponses[mapping.id])
                          }
                          className={styles.saveButton}
                        >
                          Save Response
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() =>
                          toggleEditResponse(
                            selectedResponses[mapping.id],
                            selectedResponse.resJson
                          )
                        }
                        className={styles.editButton}
                      >
                        Edit Response
                      </button>
                    )}
                  </div>
                ) : (
                  <p>No responses available.</p>
                )}

                <button
                  onClick={() => navigate(`/request/${mapping.id}`)}
                  className={styles.detailsButton}
                >
                  Add New Response
                </button>
                <button
                  onClick={() => handleDelete(mapping.id)}
                  className={styles.deleteButton}
                >
                  Delete Mapping
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
};

export default MappingsPage;
