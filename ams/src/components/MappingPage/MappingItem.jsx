import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";
import RequestEditor from "./RequestEditor";
import ResponseEditor from "./ResponseEditor";

// Helper: Extract the actual URL value from the request object.
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
  sendToWireMockAndUpdateUI,
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
  const mappingId = mapping.id || mapping.request.id;
  const [isActive, setIsActive] = useState(!!mapping.wireMockId);

  
  useEffect(() => {
    setIsActive(!!mapping.wireMockId);
  }, [mapping.wireMockId]);

  // Initialize local states if not already done.
  useEffect(() => {
    if (!editedRequests[mappingId]) {
      setEditedRequests((prev) => ({
        ...prev,
        [mappingId]: {
          ...mapping.request.reqJson,
          title: mapping.request.title || "",
        },
      }));
    }
    
  
    if (!editedResponses[mappingId]) {
      const firstResponse = responses.find((res) => res.reqId === mappingId);
      setEditedResponses((prev) => ({
        ...prev,
        [mappingId]: firstResponse?.resJson || {},
      }));
    }
  
    if (
      !selectedResponses[mappingId] &&
      responses.filter((res) => res.reqId === mappingId).length > 0
    ) {
      const first = responses.find((res) => res.reqId === mappingId);
      setSelectedResponses((prev) => ({
        ...prev,
        [mappingId]: first?.resId,
      }));
    }
  }, [
    mappingId,
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
      [mappingId]: !prev[mappingId],
    }));
  };  

  // Auto-expand the mapping if its ID matches autoExpandMappingId.
  useEffect(() => {
    if (!hasAutoExpanded && autoExpandMappingId && mappingId === autoExpandMappingId) {
      setExpandedMappings((prev) => ({ ...prev, [mappingId]: true }));
      setHasAutoExpanded(true);
    }
  }, [autoExpandMappingId, mappingId, hasAutoExpanded, setExpandedMappings]);
  
  useEffect(() => {
    if (
      expandedMappings[mappingId] &&
      mappingId === autoExpandMappingId &&
      mappingItemRef.current
    ) {
      mappingItemRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [expandedMappings, autoExpandMappingId, mappingId]);
  

  // After expansion, scroll the mapping item into view.
  useEffect(() => {
    if (
      expandedMappings[mappingId] &&
      mappingId === autoExpandMappingId &&
      mappingItemRef.current
    ) {
      mappingItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [expandedMappings, autoExpandMappingId, mappingId]);

  

  const currentRequest = editedRequests[mappingId] || mapping.request.reqJson || {};

  const displayURL = extractURLValue(currentRequest);

  return (
    <li
      className={styles.mappingItem}
      ref={mappingItemRef}
      data-testid="mapping-item"
    >
      <div className={styles.titleRow} onClick={toggleExpanded}>
        <h3>{currentRequest.method || "Unidentified Method"}</h3>
        <h3>{displayURL || "No URL"}</h3>
        <h3>{mapping.request.title || "Untitled Mapping"}</h3>
        <span
          className={
            mapping.status === "Active" ? styles.active : styles.unmapped
          }
        >
          {mapping.status}
        </span>
       <h3 className={isActive ? styles.active : styles.inactive}>
          {isActive ? "✅ " : "❌"}
      </h3>

        <button
          ref={toggleButtonRef}
          className={styles.toggleButton}
          data-testid="toggle-button"
        >
          {expandedMappings[mappingId] ? "Hide Details" : "Show Details"}
        </button>
      </div>
      {expandedMappings[mappingId] && (
        <>
          <RequestEditor
  mappingId={mappingId}
  editedRequest={editedRequests[mappingId] || mapping.request.reqJson}
  setEditedRequest={(data) =>
    setEditedRequests((prev) => ({ ...prev, [mappingId]: data }))
  }
  handleUpdateRequest={(id, updatedRequest) => {
    setEditedRequests((prev) => ({ ...prev, [id]: updatedRequest }));
    handleUpdateRequest(id, updatedRequest);
  }}
/>

<ResponseEditor
  mappingId={mappingId}
  relevantResponses={responses.filter(res => res.reqId === mappingId)} // ✅ This should be an array
  editedResponse={editedResponses[mappingId]}
  setEditedResponse={(data) =>
    setEditedResponses((prev) => ({ ...prev, [mappingId]: data }))
  }
  selectedResponse={selectedResponses[mappingId]}
  setSelectedResponse={(responseId) =>
    setSelectedResponses((prev) => ({
      ...prev,
      [mappingId]: responseId,
    }))
  }
  handleUpdateResponse={handleUpdateResponse}
/>

          {isActive && (
            <button
              className={styles.sendButton}
              onClick={() => {
                const wireMockId = mapping.wireMockId || mapping.uuid;
                navigate("/traffic", {
                  state: { filterTraffic: wireMockId, matchOnly: true },
                });
              }}
            >
              Traffic
            </button>
          )}

          <button
            onClick={async () => {
              const result = await sendToWireMockAndUpdateUI(mappingId);
              if (result?.success) {
                setIsActive(true); // ✅ THIS is the key to reflect the new state locally
              }
            }}
            className={styles.sendButton}
          >
            Send to WireMock
          </button>

          <button
            onClick={() => handleDelete(mappingId)}
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
