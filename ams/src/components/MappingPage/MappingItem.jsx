import React from "react";
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

  return (
    <li className={styles.mappingItem}>
      <div className={styles.titleRow} onClick={toggleExpanded}>
        <h3>{editedRequests[mapping.id]?.method || "Unidentified Method"}</h3>
        <h3>{editedRequests[mapping.id]?.url || "Unidentified URL"}</h3>
        <h3>{editedRequests[mapping.id]?.title || "Untitled Mapping"}</h3>
        <button className={styles.toggleButton}>{expandedMappings[mapping.id] ? "Hide Details" : "Show Details"}</button>
      </div>
      {expandedMappings[mapping.id] && (
        <div>
          <RequestEditor
            mappingId={mapping.id}
            editedRequest={editedRequests[mapping.id]}
            setEditedRequest={(data) =>
              setEditedRequests((prev) => ({ ...prev, [mapping.id]: data }))
            }
            handleUpdateRequest={handleUpdateRequest}
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
          <button className={styles.deleteButton} onClick={() => handleDelete(mapping.id)}>Delete Mapping</button>
        </div>
      )}
    </li>
  );
};

export default MappingItem;
