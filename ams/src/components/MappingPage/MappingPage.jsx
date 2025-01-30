import React, { useState, useEffect } from "react";
import styles from "./MappingsPage.module.css";
import SortControls from "./SortControls";
import MappingList from "./MappingList";
import { fetchMappings } from "../../backend/api";

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

  const [updatedMappings, setUpdatedMappings] = useState([]);

  const [localMappings, setLocalMappings] = useState([]);

  useEffect(() => {
    const loadMappings = async () => {
      const data = await fetchMappings();
      console.log("Fetched data:", data);
      setLocalMappings(Array.isArray(data) ? data : []);
    };
    loadMappings();
  }, []);

  useEffect(() => {
    // Hämta aktiva mappningar från WireMock och uppdatera status
    const fetchActiveMappings = async () => {
      try {
        const response = await fetch("http://localhost:8081/__admin/mappings");

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Kolla om responsen är JSON
        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text(); // Läs text istället för JSON
          throw new Error(`Expected JSON, but got: ${text}`);
        }

        const data = await response.json();
        console.log("Fetched mappings:", data);

        // Resten av din logik...
      } catch (error) {
        console.error("Error fetching active mappings:", error);
      }
    };

    fetchActiveMappings();
  }, [mappings]);

  useEffect(() => {
    // Uppdatera val av responses när mappings ändras
    const initialSelections = {};
    mappings.forEach((mapping) => {
      // Hitta relevanta responses för den aktuella mappingen
      const relevantResponses = responses.filter(
        (res) => res.reqId === mapping.id
      );

      // Kontrollera om relevanta responses hittades
      if (relevantResponses.length > 0) {
        // Välj den första relevanta responsen (kan anpassas om du har fler kriterier)
        initialSelections[mapping.id] = relevantResponses[0].id;
      } else {
        console.log(
          `No relevant responses found for mapping with id: ${mapping.id}`
        );
      }
    });

    // Uppdatera selectedResponses med initialSelections
    setSelectedResponses(initialSelections);
  }, []);

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
      const requestBody = JSON.stringify(
        mapping.request.body || {}
      ).toLowerCase();
      const requestHeaders = JSON.stringify(
        mapping.request.headers || {}
      ).toLowerCase();

      return (
        mapping.request.title?.toLowerCase().includes(searchLower) ||
        mapping.request.url?.toLowerCase().includes(searchLower) ||
        requestBody.includes(searchLower) ||
        requestHeaders.includes(searchLower) ||
        mapping.request.method?.toLowerCase().includes(searchLower)
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
      <ul>
        {localMappings.map((mapping) => (
          <li
            key={mapping.id}
            style={{ display: "flex", alignItems: "center" }}
          >
            {activeMappings.some(
              (activeMapping) => activeMapping.uuid === mapping.wireMockId
            ) && (
              <span
                style={{
                  width: 10,
                  height: 10,
                  backgroundColor: "green",
                  borderRadius: "50%",
                  display: "inline-block",
                  marginRight: 10,
                }}
              ></span>
            )}
            {mappings.request.url} - {mapping.response.status} -
            {mapping.wireMockId}
          </li>
        ))}
      </ul>

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

      {/* Sorterings- och sökkomponent */}
      <SortControls
        setSortCriterion={setSortCriterion}
        searchFilters={searchFilters}
        setSearchFilters={setSearchFilters}
      />

      {/* Lista med filtrerade och sorterade mappningar */}
      <MappingList
        mappings={
          updatedMappings.length > 0 ? updatedMappings : filteredMappings
        } // Använd de filtrerade mappningarna här
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
