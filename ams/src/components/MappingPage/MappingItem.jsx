import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom"
import styles from "./MappingsPage.module.css";
import RequestEditor from "./RequestEditor";
import ResponseEditor from "./ResponseEditor";

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
  autoExpandMappingId, // received from MappingList (or MappingsPage)
}) => {
  const navigate = useNavigate()
  // Create refs for the mapping item container and the toggle button
  const mappingItemRef = useRef(null);
  const toggleButtonRef = useRef(null);
  // Local flag so that auto expansion only happens once
  const [hasAutoExpanded, setHasAutoExpanded] = useState(false);
  const hasInitialized = useRef(false)

  

  useEffect(() => {
    if (!hasInitialized.current) {
      if (!editedRequests[mapping.id]) {
        setEditedRequests((prev) => ({
          ...prev,
          [mapping.id]: mapping.request || {},
        }));
      }
      if (!editedResponses[mapping.id]) {
        const firstResponse = responses.filter((res) => res.reqId === mapping.id)[0] || {};
        setEditedResponses((prev) => ({
          ...prev,
          [mapping.id]: firstResponse.resJson || {},
        }));
      }
      if (!selectedResponses[mapping.id] && responses.filter((res) => res.reqId === mapping.id).length > 0) {
        setSelectedResponses((prev) => ({
          ...prev,
          [mapping.id]: responses.filter((res) => res.reqId === mapping.id)[0].id,
        }));
      }
      hasInitialized.current = true;
    }
  }, [mapping.id, responses, editedRequests, editedResponses, selectedResponses, setEditedRequests, setEditedResponses, setSelectedResponses]);

  const toggleExpanded = () => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mapping.id]: !prev[mapping.id],
    }));
  };

  const relevantResponses = responses.filter((res) => res.reqId === mapping.id);
  const isActive = mapping.isActive ? "Active" : "Inactive";

  // Initialize local editing state
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
  }, [
    mapping,
    relevantResponses,
    selectedResponses,
    setEditedRequests,
    setEditedResponses,
    setSelectedResponses,
  ]);

  // Auto-trigger expansion only once when autoExpandMappingId is provided.
  useEffect(() => {
    if (
      !hasAutoExpanded && // only if we haven't auto-expanded before
      autoExpandMappingId &&
      mapping.id === autoExpandMappingId &&
      !expandedMappings[mapping.id]
    ) {
      if (toggleButtonRef.current) {
        toggleButtonRef.current.click();
        setHasAutoExpanded(true);
      }
    }
  }, [hasAutoExpanded, autoExpandMappingId, mapping.id, expandedMappings]);

  // After expansion, scroll the mapping item into view
  useEffect(() => {
    if (
      expandedMappings[mapping.id] &&
      mapping.id === autoExpandMappingId &&
      mappingItemRef.current
    ) {
      mappingItemRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [expandedMappings, autoExpandMappingId, mapping.id]);

  return (
    <li className={styles.mappingItem} ref={mappingItemRef} data-testid="mapping-item">
      <div className={styles.titleRow} onClick={toggleExpanded}>
        <h3>{editedRequests[mapping.id]?.method || "Unidentified Method"}</h3>
        <h3>{editedRequests[mapping.id]?.url || "Unidentified URL"}</h3>
        <h3>{editedRequests[mapping.id]?.title || "Untitled Mapping"}</h3>
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
        {/* Attach the ref so we can trigger click programmatically */}
        <button ref={toggleButtonRef} className={styles.toggleButton} data-testid="toggle-button">
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
              state: { filterTraffic: mapping.request.url, matchOnly: true },
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
