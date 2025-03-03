import { useState, useEffect } from "react";

const useMappingSearch = (mappings, initialSort = "") => {
  const [search, setSearch] = useState("");
  const [searchFilters, setSearchFilters] = useState({
    title: "",
    url: "",
    method: "",
  });
  const [sortCriterion, setSortCriterion] = useState(initialSort);
  const [filteredMappings, setFilteredMappings] = useState(mappings);

  useEffect(() => {
    let filtered = mappings.filter((mapping) => {
      const request = mapping.request || {};
      const title = (request.title || "").toLowerCase();
      const url = (request.url || "").toLowerCase();
      const method = (request.method || "").toLowerCase();

      // Apply specific filters.
      const passesFilters =
        title.includes(searchFilters.title.toLowerCase()) &&
        url.includes(searchFilters.url.toLowerCase()) &&
        method.includes(searchFilters.method.toLowerCase());

      // Apply general search.
      const searchLower = search.toLowerCase();
      const passesSearch =
        title.includes(searchLower) ||
        url.includes(searchLower) ||
        method.includes(searchLower) ||
        JSON.stringify(request.body || {})
          .toLowerCase()
          .includes(searchLower) ||
        JSON.stringify(request.headers || {})
          .toLowerCase()
          .includes(searchLower);

      return passesFilters && passesSearch;
    });

    // Optionally sort the mappings.
    if (sortCriterion) {
      filtered = filtered.sort((a, b) => {
        const fieldA = (a.request?.[sortCriterion] || "").toLowerCase();
        const fieldB = (b.request?.[sortCriterion] || "").toLowerCase();
        return fieldA.localeCompare(fieldB);
      });
    }
    setFilteredMappings(filtered);
  }, [mappings, search, searchFilters, sortCriterion]);

  return {
    filteredMappings,
    search,
    setSearch,
    searchFilters,
    setSearchFilters,
    sortCriterion,
    setSortCriterion,
  };
};

export default useMappingSearch;