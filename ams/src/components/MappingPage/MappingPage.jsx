import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SortControls from "./SortControls";
import styles from "./MappingsPage.module.css";
import MappingList from "./MappingList"; 

const MappingsPage = ({
  mappings,
  responses,
  handleUpdateRequest,
  handleUpdateResponse,
  handleDelete,
}) => {
  

  const [expandedMappings, setExpandedMappings] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});
  const [editedRequests, setEditedRequests] = useState({});
  const [editedResponses, setEditedResponses] = useState({});

  useEffect(() => {
    const initialSelections = {};
    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );
      if (relevantResponses.length > 0) {
        initialSelections[mapping.id] = relevantResponses[0].id;
      }
    });
    setSelectedResponses(initialSelections);
  }, [mappings, responses]);


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
                            })
                          }
                        />
=======
  return (
    <section className={styles.section}>
      <h2>Saved Mappings</h2>
      <MappingList
        mappings={mappings}
        responses={responses}
        expandedMappings={expandedMappings}
        setExpandedMappings={setExpandedMappings}
        selectedResponses={selectedResponses}
        setSelectedResponses={setSelectedResponses}
        editedRequests={editedRequests}
        setEditedRequests={setEditedRequests}
        editedResponses={editedResponses}
        setEditedResponses={setEditedResponses}
        handleDelete={handleDelete}
        handleUpdateRequest={handleUpdateRequest}
        handleUpdateResponse={handleUpdateResponse}
      />
>>>>>>> ad48271b01ef6a0a3a4ac6980b8684d6b1e3fd3f
    </section>
  );
};

export default MappingsPage;
