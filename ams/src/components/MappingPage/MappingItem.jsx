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
  
  // ✅ Ensure isActive is properly checked
  const isActive = mapping.isActive ? "✅ Active" : "❌ Inactive";

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
        {/* ✅ Ensure Active/Inactive is displayed correctly */}
        <h3 className={mapping.isActive ? styles.active : styles.inactive}>
          {isActive}
        </h3>
        <button className={styles.toggleButton}>
          {expandedMappings[mapping.id] ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {expandedMappings[mapping.id] && (
        <>
          <RequestEditor
            mappingId={mapping.id}
            editedRequest={editedRequests[mapping.id]}
            setEditedRequest={(data) =>
              setEditedRequests((prev) => ({ ...prev, [mapping.id]: data }))
            }
            handleUpdateRequest={(id, updatedRequest) => {
              setEditedRequests((prev) => ({
                ...prev,
                [id]: updatedRequest,
              }));
              handleUpdateRequest(id, updatedRequest);
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
            placeholder="Delete Button"
            onClick={() => handleDelete(mapping.id)}
            className={styles.deleteButton}
          >
            Delete Mapping
          </button>
        </>
      )}
    </li>
  );
};

export default MappingItem;
