describe("Mappings Page - Future Test", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              title: "Test Request",
              url: "/test-url",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: { body: "Test Body" },
            },
          },
        ],
        responses: [],
      },
    }).as("getMappings");

    cy.visit("http://localhost:5173");
    cy.wait("@getMappings");
  });

  it("should display request details and allow editing", () => {
    // Kontrollera att request-detaljerna syns på sidan
    cy.contains("POST").should("exist");
    cy.contains("/test-url").should("exist");
    cy.contains("Test Request").should("exist");

    // Expandera request-detaljer
    cy.contains("Show Details").click();

    // Kontrollera att detaljerna visas
    cy.contains("Test Request").should("exist");

    cy.contains('"url": "/test-url"').should("exist");
    cy.contains('"method": "POST"').should("exist");
    cy.contains('"Content-Type": "application/json"').should("exist");
    cy.contains('"body": "Test Body"').should("exist");

    // Kontrollera att "Edit Request"-knappen finns och klicka på den
    cy.contains("Edit Request").should("exist").click();

    // Spara ändringen
    cy.contains("Save Request").click();
  });
});
