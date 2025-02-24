import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";
import RequestEditor from "./RequestEditor";
import ResponseEditor from "./ResponseEditor";

// Helper to extract the actual URL value from the request object.
const extractURLValue = (reqObj) => {
  return (
    reqObj.url ||
    reqObj.urlPath ||
    reqObj.urlPathPattern ||
    reqObj.urlPathTemplate ||
    reqObj.urlPattern ||
    ""
  );
};

const MappingItem = ({
  mapping,
  handleSendToWireMock,
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
  autoExpandMappingId,
}) => {
  const navigate = useNavigate();
  const mappingItemRef = useRef(null);
  const toggleButtonRef = useRef(null);
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      if (!editedRequests[mapping.id]) {
        setEditedRequests((prev) => ({
          ...prev,
          [mapping.id]: mapping.request || {},
        }));
      }
      if (!editedResponses[mapping.id]) {
        const firstResponse =
          responses.filter((res) => res.reqId === mapping.id)[0] || {};
        setEditedResponses((prev) => ({
          ...prev,
          [mapping.id]: firstResponse.resJson || {},
        }));
      }
      if (
        !selectedResponses[mapping.id] &&
        responses.filter((res) => res.reqId === mapping.id).length > 0
      ) {
        setSelectedResponses((prev) => ({
          ...prev,
          [mapping.id]: responses.filter((res) => res.reqId === mapping.id)[0]
            .id,
        }));
      }
      hasInitialized.current = true;
    }
  }, [
    mapping.id,
    responses,
    editedRequests,
    editedResponses,
    selectedResponses,
    setEditedRequests,
    setEditedResponses,
    setSelectedResponses,
  ]);

  const toggleExpanded = () => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mapping.id]: !prev[mapping.id],
    }));
  };

  const relevantResponses = responses.filter((res) => res.reqId === mapping.id);
  const requestData = editedRequests[mapping.id] || {};
  // Extract the actual URL value.
  const displayURL = extractURLValue(requestData);

  return (
    <li
      className={styles.mappingItem}
      ref={mappingItemRef}
      data-testid="mapping-item"
    >
      <div className={styles.titleRow} onClick={toggleExpanded}>
        <h3>{requestData.method || "Unidentified Method"}</h3>
        <h3>{displayURL || "No URL"}</h3>
        <h3>{requestData.title || "Untitled Mapping"}</h3>
        <span
          className={
            mapping.status === "Active" ? styles.active : styles.unmapped
          }
        >
          {mapping.status}
        </span>
        <h3 className={mapping.isActive ? styles.active : styles.inactive}>
          {mapping.isActive ? "✅ " : "❌ "}
        </h3>
        <button
          ref={toggleButtonRef}
          className={styles.toggleButton}
          data-testid="toggle-button"
        >
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
              setEditedRequests((prev) => ({ ...prev, [id]: updatedRequest }));
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
              setSelectedResponses((prev) => ({
                ...prev,
                [mapping.id]: responseId,
              }))
            }
            handleUpdateResponse={handleUpdateResponse}
          />
          {mapping.isActive && (
            <button
              className={styles.sendButton}
              onClick={() =>
                navigate("/traffic", {
                  state: { filterTraffic: displayURL, matchOnly: true },
                })
              }
            >
              Traffic
            </button>
          )}
          <button
            onClick={() => handleSendToWireMock(mapping.id)}
            className={styles.sendButton}
          >
            Send to WireMock
          </button>
          <button
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
