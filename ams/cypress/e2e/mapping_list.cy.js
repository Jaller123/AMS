describe("Mapping List Functionality", () => {
  beforeEach(() => {
    cy.visit("/"); // Besök huvudsidan där Mapping List visas
  });

  it("should navigate to Mapping Details view with prefilled request and empty response fields", () => {
    // GIVEN: Ensure there are stored requests and responses
    cy.intercept("GET", "/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              url: "http://example.com",
              method: "GET",
              headers: { Accept: "application/json" },
              body: {},
            },
          },
        ],
        responses: [],
      },
    }).as("getMappings");

    // Reload page to pick up mocked data
    cy.reload();
    cy.wait("@getMappings");

    // AND: The user is on the Mapping List
    cy.contains("Saved Mappings").should("exist");

    // WHEN: The user clicks on a request
    cy.get("button.detailsButton").first().click();

    // THEN: The user should come to the Mapping Details view
    cy.url().should("include", "/mapping/1");

    // AND: The request fields should be prefilled with the chosen request data
    cy.get('[data-testid="request-url"]').should(
      "have.value",
      "http://example.com"
    );
    cy.get('[data-testid="request-method"]').should("have.value", "GET");
    cy.get('[data-testid="request-headers"]').should(
      "have.value",
      JSON.stringify({ Accept: "application/json" }, null, 2)
    );
    cy.get('[data-testid="request-body"]').should(
      "have.value",
      JSON.stringify({}, null, 2)
    );

    // AND: The response fields should be empty
    cy.get('[data-testid="response-status"]').should("have.value", "");
    cy.get('[data-testid="response-headers"]').should("have.value", "");
    cy.get('[data-testid="response-body"]').should("have.value", "");
  });
});
