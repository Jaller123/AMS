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

  // Initialize local states if not already done.
  useEffect(() => {
    if (!editedRequests[mapping.id]) {
      setEditedRequests((prev) => ({
        ...prev,
        [mapping.id]: mapping.request.reqJson || {},
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
        [mapping.id]: responses.filter((res) => res.reqId === mapping.id)[0].id,
      }));
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

  // Auto-expand the mapping if its ID matches autoExpandMappingId.
  useEffect(() => {
    if (
      !hasAutoExpanded &&
      autoExpandMappingId &&
      mapping.id === autoExpandMappingId
    ) {
      setExpandedMappings((prev) => ({ ...prev, [mapping.id]: true }));
      setHasAutoExpanded(true);
    }
  }, [autoExpandMappingId, mapping.id, hasAutoExpanded, setExpandedMappings]);

  // After expansion, scroll the mapping item into view.
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

  const currentRequest =
    editedRequests[mapping.id] || mapping.request.reqJson || {};
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
        <h3>{currentRequest.title || "Untitled Mapping"}</h3>
        <span
          className={
            mapping.status === "Active" ? styles.active : styles.unmapped
          }
        >
          {mapping.status}
        </span>
        <h3 className={mapping.isActive ? styles.active : styles.inactive}>
          {mapping.isActive ? "✅ " : "❌"}
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
            editedRequest={editedRequests[mapping.id] || mapping.request}
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
            relevantResponses={responses.filter(
              (res) => res.reqId === mapping.id
            )}
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
