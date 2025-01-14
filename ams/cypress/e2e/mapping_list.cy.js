describe("Mapping List Page", () => {
  // Mock data for the mappings API
  const mockMappings = [
    {
      id: 1,
      request: {
        key: "value",
      },
    },
    {
      id: 2,
      request: {
        key: "another value",
      },
    },
  ];

  beforeEach(() => {
    // Mock the API call to return the mock mappings
    cy.intercept("GET", "/api/mappings", {
      statusCode: 200,
      body: mockMappings,
    }).as("getMappings");

    // Visit the page where the mappings are listed
    cy.visit("/"); // Make sure this is the correct URL for your MappingsPage
    cy.wait("@getMappings"); // Wait for the mock API request to finish
  });

  it("should display the request data and empty response fields on click", () => {
    // Verify that at least one mapping item is present
    cy.get(".mappingItem", { timeout: 10000 }).should(
      "have.length.greaterThan",
      0
    );

    // Ensure the first mapping item is clickable
    cy.get(".mappingItem").first().click();

    // Verify that the URL has changed to the details page
    cy.url().should("include", "/mapping/1"); // Adjust based on your routing logic

    // Verify that the request data is displayed in the "container" section
    cy.get(".container").find("pre").should("exist");
  });
});
