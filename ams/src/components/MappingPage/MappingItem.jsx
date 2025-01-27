import React, { useEffect } from "react";
import styles from "./MappingsPage.module.css";
import RequestEditor from "./RequestEditor";
import ResponseEditor from "./ResponseEditor";

const MappingItem = ({
  mapping,
  responses,
  expandedMappings,
  setExpandedMappings,
  editedRequests,
  setEditedRequests,
  editedResponses,
  setEditedResponses,
  selectedResponses,
  setSelectedResponses,
  handleDelete,
  handleUpdateRequest,
  handleUpdateResponse,
}) => {
  const toggleExpanded = () => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mapping.id]: !prev[mapping.id],
    }));
  };

  const relevantResponses = responses.filter((res) => res.reqId === mapping.id);

  // Initialize editedRequests and editedResponses
  useEffect(() => {
    if (!editedRequests[mapping.id]) {
      setEditedRequests((prev) => ({
        ...prev,
        [mapping.id]: mapping.request || {},
      }));
    }

    if (!editedResponses[mapping.id]) {
      const firstResponse = relevantResponses[0] || {};
      setEditedResponses((prev) => ({
        ...prev,
        [mapping.id]: firstResponse.resJson || {},
      }));
    }

    if (!selectedResponses[mapping.id] && relevantResponses.length > 0) {
      setSelectedResponses((prev) => ({
        ...prev,
        [mapping.id]: relevantResponses[0].id,
      }));
    }
  }, [mapping, relevantResponses, selectedResponses, setEditedRequests, setEditedResponses, setSelectedResponses]);

  return (
    <li className={styles.mappingItem}>
      <div className={styles.titleRow} onClick={toggleExpanded}>
        <h3>{editedRequests[mapping.id]?.method || "Unidentified Method"}</h3>
        <h3>{editedRequests[mapping.id]?.url || "Unidentified URL"}</h3>
        <h3>{editedRequests[mapping.id]?.title || "Untitled Mapping"}</h3>
        <button className={styles.toggleButton}>
          {expandedMappings[mapping.id] ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {expandedMappings[mapping.id] && (
        <div>
          <RequestEditor
            mappingId={mapping.id}
            editedRequest={editedRequests[mapping.id]}
            setEditedRequest={(data) =>
              setEditedRequests((prev) => ({ ...prev, [mapping.id]: data }))
            }
            handleUpdateRequest={(id, updatedRequest) => {
              // Update title and other fields in editedRequests
              setEditedRequests((prev) => ({
                ...prev,
                [id]: updatedRequest,
              }));
              handleUpdateRequest(id, updatedRequest); // Call the original handler
            }}
          />
          <ResponseEditor
            mappingId={mapping.id}
            relevantResponses={relevantResponses}
            editedResponse={editedResponses[mapping.id]}
            setEditedResponse={(data) =>
              setEditedResponses((prev) => ({ ...prev, [mapping.id]: data }))
            }
            selectedResponse={selectedResponses[mapping.id]}
            setSelectedResponse={(responseId) =>
              setSelectedResponses((prev) => ({ ...prev, [mapping.id]: responseId }))
            }
            handleUpdateResponse={handleUpdateResponse}
          />
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
};

export default MappingItem;
