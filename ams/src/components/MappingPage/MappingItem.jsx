import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./MappingsPage.module.css";
import RequestEditor from "./RequestEditor";
import ResponseEditor from "./ResponseEditor";

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
  const [isActive, setIsActive] = useState(!!mapping.wireMockId);

  const mappingId = mapping.id || mapping.request.id;

  // Synka wireMockId => aktiv status
  useEffect(() => {
    setIsActive(!!mapping.wireMockId);
  }, [mapping.wireMockId]);

  // Initiera state för request, response & selectedResponse (endast en gång)
  useEffect(() => {
    if (!editedRequests[mappingId]) {
      setEditedRequests((prev) => {
        if (prev[mappingId]) return prev;
        return {
          ...prev,
          [mappingId]: {
            ...mapping.request.reqJson,
            title: mapping.request.title || "",
          },
        };
      });
    }

    if (!editedResponses[mappingId]) {
      const firstResponse = responses.find((res) => res.reqId === mappingId);
      setEditedResponses((prev) => {
        if (prev[mappingId]) return prev;
        return {
          ...prev,
          [mappingId]: firstResponse?.resJson || {},
        };
      });
    }

    if (!selectedResponses[mappingId]) {
      const first = responses.find((res) => res.reqId === mappingId);
      if (first) {
        setSelectedResponses((prev) => {
          if (prev[mappingId]) return prev;
          return {
            ...prev,
            [mappingId]: first.resId,
          };
        });
      }
    }
  }, [mappingId, responses]);

  // Expandera mappningen automatiskt (endast en gång)
  useEffect(() => {
    if (!hasAutoExpanded && autoExpandMappingId === mappingId) {
      setExpandedMappings((prev) => ({ ...prev, [mappingId]: true }));
      setHasAutoExpanded(true);
    }
  }, [autoExpandMappingId, mappingId, hasAutoExpanded, setExpandedMappings]);

  // Scrolla in i vy när expanderad
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

  const toggleExpanded = () => {
    setExpandedMappings((prev) => ({
      ...prev,
      [mappingId]: !prev[mappingId],
    }));
  };

  const currentRequest =
    editedRequests[mappingId] || mapping.request.reqJson || {};
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
          {isActive ? "✅" : "❌"}
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
            relevantResponses={responses.filter(
              (res) => res.reqId === mappingId
            )}
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
              if (result?.success) setIsActive(true);
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
