describe("Mappings Page", () => {
  beforeEach(() => {
    // Mock the API response for getting saved mappings
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: { title: "Sample Request 1", endpoint: "/api/sample1" },
          },
        ],
        responses: [
          {
            id: "1.1",
            reqId: "1",
            resJson: { status: "200" },
            timestamp: "2025-01-01 10:00:00",
          },
        ],
      },
    }).as("getMappings");

    cy.visit("http://localhost:5173");
    cy.wait("@getMappings");

    // Mock the API responses for editing, deleting, etc.
    cy.intercept("PUT", "http://localhost:8080/requests/1", {
      statusCode: 200,
      body: {
        success: true,
        updatedRequest: {
          id: "1",
          resJson: { name: "Updated Request", endpoint: "/api/updated" },
        },
      },
    }).as("editRequest");

    cy.intercept("PUT", "http://localhost:8080/responses/1.1", {
      statusCode: 200,
      body: {
        success: true,
        updatedResponse: {
          id: "1.1",
          reqId: "1",
          resJson: { status: "404" },
          timestamp: "2025-01-01 10:05:00",
        },
      },
    }).as("editResponse");

    cy.intercept("DELETE", "http://localhost:8080/mappings/1", {
      statusCode: 200,
      body: { success: true },
    }).as("deleteMapping");

    cy.visit("http://localhost:5173");
    cy.wait("@getMappings"); // Wait for the GET request to finish
  });

  it("should display the saved mappings", () => {
    cy.contains("Saved Mappings").should("exist");
    cy.contains("Sample Request 1").should("exist");
    cy.contains("/api/sample1").should("exist");
  });

  it("should allow editing and saving a request", () => {
    cy.contains("Edit Request").click();
    cy.get('input[type="text"]').clear().type("/api/updated");
    cy.contains("Save Request").click();

    cy.wait("@editRequest");
    cy.contains("/api/updated").should("exist");

    // Verify that the Save action persists
    cy.reload();
    cy.wait("@getMappings");
  });

  it("should allow editing and saving a response", () => {
    cy.contains("Edit Response").click();
    cy.get('input[type="text"]').clear().type("404");
    cy.contains("Save Response").click();

    cy.wait("@editResponse");

    // Verify that the Save action persists
    cy.reload();
    cy.wait("@getMappings");
  });

  it("should delete a mapping", () => {
    cy.contains("Delete Mapping").click();

    cy.wait("@deleteMapping");
    cy.contains("Sample Request 1").should("not.exist");
  });

  it("should display a message when no mappings are available", () => {
    // Mock empty response
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: { requests: [], responses: [] },
    }).as("getEmptyMappings");

    cy.reload(); // Reload the page to trigger the new mock
    cy.wait("@getEmptyMappings");
    cy.contains("No mappings saved yet.").should("exist");
  });
});
