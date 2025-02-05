import React, { useState } from "react";
import styles from "./SortControls.module.css";

const SortControls = ({
  setSortCriterion,
  searchFilters,
  setSearchFilters,
}) => {
  const handleSortChange = (e) => {
    setSortCriterion(e.target.value);
  };

  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value.toLowerCase() }));
  };

  return (
    <div className={styles.sortControls}>
    

      <div className={styles.searchSection}>
        <label htmlFor="titleSearch">Title:</label>
        <input
          type="text"
          id="titleSearch"
          name="title"
          placeholder="Search by Title"
          value={searchFilters.title || ""}
          onChange={handleSearchChange}
        />

        <label htmlFor="urlSearch">URL:</label>
        <input
          type="text"
          id="urlSearch"
          name="url"
          placeholder="Search by URL"
          value={searchFilters.url || ""}
          onChange={handleSearchChange}
        />

        <label htmlFor="methodSearch">Method:</label>
        <input
          type="text"
          id="methodSearch"
          name="method"
          placeholder="Search by Method"
          value={searchFilters.method || ""}
          onChange={handleSearchChange}
        />
      </div>
    </div>
  );
};

export default SortControls;  