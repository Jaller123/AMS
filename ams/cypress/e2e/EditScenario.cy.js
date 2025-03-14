describe("Edit Scenario Page", () => {
  beforeEach(() => {
    // Mocka GET /api/scenarios/*
    cy.intercept("GET", "/api/scenarios/*", {
      statusCode: 200,
      body: {
        id: 1,
        title: "Test Scenario",
        mappings: [
          { id: 1, name: "Mapping 1" },
          { id: 2, name: "Mapping 2" },
        ],
      },
    }).as("getScenario");

    // Mocka GET /api/mappings
    cy.intercept("GET", "/api/mappings", {
      statusCode: 200,
      body: [
        { id: 1, name: "Mapping 1" },
        { id: 2, name: "Mapping 2" },
      ],
    }).as("getMappings");

    // Mocka PUT /api/scenarios/*
    cy.intercept("PUT", "/api/scenarios/*", {
      statusCode: 200,
      body: { success: true },
    }).as("updateScenario");

    cy.visit("/http://localhost:5173/edit-scenario/1"); // Besök sidan med scenarioId = 1
    cy.wait(["@getScenario", "@getMappings"]);
  });

  it("should load and display the existing scenario", () => {
    cy.get("input[placeholder='Enter Scenario Title Here']").should(
      "have.value",
      "Test Scenario"
    );

    cy.get(".mappingList .mappingItem").should("have.length.greaterThan", 0);
  });

  it("should allow editing the scenario title", () => {
    cy.get("input[placeholder='Enter Scenario Title Here']")
      .clear()
      .type("Updated Scenario Title");

    cy.get("input[placeholder='Enter Scenario Title Here']").should(
      "have.value",
      "Updated Scenario Title"
    );
  });

  it("should allow adding a new mapping", () => {
    cy.get(".rightPanel .mappingItem").first().trigger("dragstart");

    cy.get(".leftPanel").trigger("drop");

    cy.get(".leftPanel .mappingList .mappingItem").should(
      "have.length.greaterThan",
      1
    );
  });

  it("should allow removing a mapping", () => {
    cy.get(".leftPanel .mappingList .mappingItem")
      .first()
      .within(() => {
        cy.get("button").contains("❌").click();
      });

    cy.get(".leftPanel .mappingList .mappingItem").should(
      "have.length.lessThan",
      1
    );
  });

  it("should save the scenario after editing", () => {
    cy.get("input[placeholder='Enter Scenario Title Here']")
      .clear()
      .type("Final Scenario Title");

    cy.get(".leftPanel button").contains("Update Scenario").click();

    cy.wait("@updateScenario").its("response.statusCode").should("eq", 200);
  });
});
