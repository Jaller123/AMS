import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./MappingsPage.module.css";
import SortControls from "./SortControls";
import MappingList from "./MappingList";

const MappingsPage = ({
  mappings,
  responses,
  handleUpdateRequest,
  handleUpdateResponse,
  handleDelete,
  setMappings,
  handleSendToWireMock,
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [expandedMappings, setExpandedMappings] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});
  const [editedRequests, setEditedRequests] = useState({});
  const [editedResponses, setEditedResponses] = useState({});
  const [sortCriterion, setSortCriterion] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    title: "",
    url: "",
    method: "",
  });
  const [filteredMappings, setFilteredMappings] = useState(mappings);
  const [search, setSearch] = useState("");

  // ✅ Lägg upp variabeln tidigt
  const autoExpandMappingId = location.state?.expandMappingId;
  console.log("Auto-expand mapping id from location:", autoExpandMappingId);

  useEffect(() => {
    if (autoExpandMappingId) {
      setExpandedMappings((prev) => ({
        ...prev,
        [autoExpandMappingId]: true,
      }));
    }
  }, [autoExpandMappingId]);

  const sendToWireMockAndUpdateUI = async (mappingId) => {
    if (!handleSendToWireMock) {
      console.error("❌ handleSendToWireMock is not defined");
      return;
    }

    const data = await handleSendToWireMock(mappingId);

    if (data?.success) {
      setMappings((prevMappings) =>
        prevMappings.map((mapping) =>
          mapping.id === mappingId
            ? { ...mapping, isActive: true, wireMockId: data.wireMockId }
            : mapping
        )
      );

      setFilteredMappings((prevMappings) =>
        prevMappings.map((mapping) =>
          mapping.id === mappingId
            ? { ...mapping, isActive: true, wireMockId: data.wireMockId }
            : mapping
        )
      );
    }
  };

  useEffect(() => {
    const initialSelections = {};
    mappings.forEach((mapping) => {
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );
      if (relevantResponses.length > 0) {
        initialSelections[mapping.id] = relevantResponses[0].resId;
      }
    });
    setSelectedResponses(initialSelections);
  }, [mappings, responses]);

  useEffect(() => {
    let filtered = mappings.filter((mapping) => {
      const request = mapping.request || {};
      const title = (request.title || "").toLowerCase();
      const url = (request.url || "").toLowerCase();
      const method = (request.method || "").toLowerCase();

      return (
        title.includes(searchFilters.title) &&
        url.includes(searchFilters.url) &&
        method.includes(searchFilters.method)
      );
    });

    filtered = filtered.filter((mapping) => {
      const searchLower = search.toLowerCase();
      const requestBody = JSON.stringify(
        mapping.request?.body || {}
      ).toLowerCase();
      const requestHeaders = JSON.stringify(
        mapping.request?.headers || {}
      ).toLowerCase();

      return (
        mapping.request?.title?.toLowerCase().includes(searchLower) ||
        mapping.request?.url?.toLowerCase().includes(searchLower) ||
        requestBody.includes(searchLower) ||
        requestHeaders.includes(searchLower) ||
        mapping.request?.method?.toLowerCase().includes(searchLower)
      );
    });

    if (sortCriterion) {
      filtered = filtered.sort((a, b) => {
        const fieldA = (a.request?.[sortCriterion] || "").toLowerCase();
        const fieldB = (b.request?.[sortCriterion] || "").toLowerCase();
        return fieldA.localeCompare(fieldB);
      });
    }

    setFilteredMappings(filtered);
  }, [mappings, search, searchFilters, sortCriterion]);

  const handleImportJson = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const json = JSON.parse(text);

      if (!json.request || !json.response) {
        alert("Invalid mapping format. Must include 'request' and 'response'.");
        return;
      }

      navigate("/mappings", {
        state: {
          prefillRequest: json.request,
          prefillResponse: json.response,
        },
      });
    } catch (err) {
      console.error("Failed to import JSON:", err);
      alert("Error reading or importing file.");
    }
  };

  return (
    <div className={styles.sectionContainer}>
      <section className={styles.section}>
        <h2>Saved Mappings</h2>
        <div className={styles["searchable-mappings"]}>
          <form
            onSubmit={(e) => e.preventDefault()}
            className={styles["search-form"]}
          >
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              data-testid="search-input"
              className={styles.searchInput}
            />
          </form>
        </div>

        <SortControls
          setSortCriterion={setSortCriterion}
          searchFilters={searchFilters}
          setSearchFilters={setSearchFilters}
        />

        <MappingList
          mappings={filteredMappings}
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
          sendToWireMockAndUpdateUI={sendToWireMockAndUpdateUI}
          autoExpandMappingId={autoExpandMappingId}
        />

        <input
          type="file"
          accept="application/json"
          onChange={handleImportJson}
          style={{ display: "none" }}
          id="import-json"
        />
        <label htmlFor="import-json" className={styles.sendButton}>
          Import JSON
        </label>

        <div className={styles.createMappingContainer}>
          <button
            onClick={() => navigate("/mappings")}
            className={styles.createMappingButton}
          >
            ➕ Create New Mapping
          </button>
        </div>
      </section>
    </div>
  );
};

export default MappingsPage;
