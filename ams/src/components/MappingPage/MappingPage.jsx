import React, { useState, useEffect } from "react";
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
  const [expandedMappings, setExpandedMappings] = useState({});
  const [selectedResponses, setSelectedResponses] = useState({});
  const [editedRequests, setEditedRequests] = useState({});
  const [editedResponses, setEditedResponses] = useState({});
  const [sortCriterion, setSortCriterion] = useState(""); // För sortering
  const [searchFilters, setSearchFilters] = useState({
    title: "",
    url: "",
    method: "",
  }); // För sökning
  const [filteredMappings, setFilteredMappings] = useState(mappings);
  const [search, setSearch] = useState("");


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

    // Filter by search input
    filtered = filtered.filter((mapping) => {
      const searchLower = search.toLowerCase();
      const requestBody = JSON.stringify(mapping.request?.body || {}).toLowerCase();
      const requestHeaders = JSON.stringify(mapping.request?.headers || {}).toLowerCase();

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

  return (
    <section className={styles.section}>
      <h2>Saved Mappings</h2>

      <div className={styles["searchable-mappings"]}>
        <form onSubmit={(e) => e.preventDefault()} className={styles["search-form"]}>
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

      {/* Sorterings- och sökkomponent */}
      <SortControls
        setSortCriterion={setSortCriterion}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      {/* Lista med filtrerade och sorterade mappningar */}
      <MappingList
        mappings={filteredMappings} // Använd de filtrerade mappningarna här
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
      />
    </section>
  );
};

export default MappingsPage;