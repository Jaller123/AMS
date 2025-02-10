// MappingsPage.jsx
import React, { useState, useEffect } from "react";
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
  // Read the mapping id to auto-expand from location.state (if provided)
  const autoExpandMappingId = location.state?.expandMappingId;
  console.log("Auto-expand mapping id from location:", autoExpandMappingId);

  // (Your filtering and sorting useEffects remain unchanged)
  // …

  return (
    <section className={styles.sectionn}>
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
        autoExpandMappingId={autoExpandMappingId}  // Pass the auto-expand id down
      />
    </section>
  );
};

export default MappingsPage;