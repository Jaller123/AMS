// MappingsPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLocation } from "react-router-dom";
import styles from "./MappingsPage.module.css";
import SortControls from "./SortControls";
import MappingList from "./MappingList";

const MappingsPage = ({
  mappings,
  responses,
  handleUpdateRequest,
  handleUpdateResponse,
  handleDelete,
}) => {
  const navigate = useNavigate();
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

  const location = useLocation();

  useEffect(() => {
    // Uppdatera val av responses när mappings ändras
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

  useEffect(() => {
    // Filter och sortera mappings
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

    // Apply sorting
    if (sortCriterion) {
      filtered = filtered.sort((a, b) => {
        const fieldA = (a.request?.[sortCriterion] || "").toLowerCase();
        const fieldB = (b.request?.[sortCriterion] || "").toLowerCase();
        return fieldA.localeCompare(fieldB);
      });
    }

    setFilteredMappings(filtered);
  }, [mappings, search, searchFilters, sortCriterion]);

  // Read the mapping id to auto-expand from location.state (if provided)
  const autoExpandMappingId = location.state?.expandMappingId;
  console.log("Auto-expand mapping id from location:", autoExpandMappingId);

  // (Your filtering and sorting useEffects remain unchanged)
  // …

  return (
    <section className={styles.sectionn}>
      <h2>Saved Mappings</h2>
      <div className={styles["searchable-mappings"]}>
        <form
          onSubmit={(e) => e.preventDefault()}
          className={styles["search-form"]}
        >
          <input
            type="text"
            placeholder="Search "
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
        autoExpandMappingId={autoExpandMappingId} // Pass the auto-expand id down
      />

      <div className={styles.createMappingContainer}>
        <button
          onClick={() => navigate("/mappings")}
          className={styles.createMappingButton}
        >
          ➕ Create New Mapping
        </button>
      </div>
    </section>
  );
};

export default MappingsPage;
