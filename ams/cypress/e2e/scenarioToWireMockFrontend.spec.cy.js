describe("Send Scenario to WireMock via UI", () => {
  beforeEach(() => {
    cy.intercept("GET", "http://localhost:8080/scenarios", {
      statusCode: 200,
      body: {
        scenarios: [
          {
            id: "1",
            name: "TestingScenarios",
            mappings: [
              {
                request: { reqId: "1" },
                response: {}
              }
            ]
          }
        ]
      }
    }).as("getScenarios");

    cy.intercept("POST", "http://localhost:8080/scenarios/1/send", {
      statusCode: 200,
      body: { success: true },
    }).as("sendScenario");

    cy.visit("http://localhost:5173/scenarios");
    cy.wait("@getScenarios");
  });

  it("should click 'Send to WireMock' and trigger the proper UI actions", () => {
    // Verify the scenario name is visible
    cy.contains("TestingScenarios").should("exist");

    // Click on the scenario to reveal actions
    cy.contains("TestingScenarios").click();

    // Then find the parent element (with placeholder="mappingItem") and click the button
    cy.contains("TestingScenarios")
      cy.get('[data-testid="mappingItem"]').should("exist")
      cy.get('[data-testid="sendToWireMockButton"]').should("exist");
   
    
    // Optionally, check for the success alert
    cy.on("window:alert", (text) => {
      expect(text).to.contain("Scenario sent successfully!");
    });

    cy.get('[data-testid="sendToWireMockButton"]').click();

    cy.wait("@sendScenario");
  });
});
