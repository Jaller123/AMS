describe("Scenario Management", () => {
  beforeEach(() => {
    // Stub the initial scenarios endpoint with a sample scenario.
    cy.intercept("GET", "http://localhost:8080/scenarios", {
      statusCode: 200,
      body: {
        scenarios: [
          {
            id: "1",
            name: "Testing Scenarios",
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

    // Stub the mappings endpoint used in the edit view.
    cy.intercept("GET", "http://localhost:8080/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              method: "POST",
              url: "/test",
              title: "Test Mapping"
            },
            wireMockId: null
          },
          {
            id: "2",
            resJson: {
              method: "POST",
              url: "/update",
              title: "Update Mapping"
            },
            wireMockId: null
          }
        ],
        responses: []
      }
    }).as("getMappings");

    // Start at the scenarios page.
    cy.visit("http://localhost:5173/scenarios");
    cy.wait("@getScenarios");
  });

  it("should expand a scenario, remove Test Mapping, add Update Mapping (2nd item), update title, save and verify changes", () => {
    // 1. Expand the scenario by clicking its title.
    cy.contains("Testing Scenarios").click();

    // 2. Click on the "Edit Scenario" button.
    cy.contains("Edit Scenario").click();
    cy.url().should("include", "/edit-scenario/1");

    // 3. Wait for the mappings to load.
    cy.wait("@getMappings");

    // 4. Remove the Test Mapping by clicking the delete (❌) button.
    cy.get('button[placeholder="Delete button"]').click();

    // 5. Update the scenario title by typing "Updated Scenario".
    cy.get('input[placeholder="Enter Scenario Title Here"]')
      .clear()
      .type("Updated Scenario");

    // 6. Add the second mapping ("Update Mapping") by clicking its "+" button.
    //    (Assumes each mapping is wrapped in an element with class "mappingItem")
    cy.get('[placeholder="mappingItem"]').eq(1)   // Select the second mapping item
      .find("button")
      .contains("+")
      .click();

    // 7. Verify that the Update Mapping appears with its title and URL (/update).
    cy.contains("Update Mapping").should("exist");
    cy.contains("/update").should("exist");

    // 8. Intercept the PUT request to update the scenario, returning the updated data.
    cy.intercept("PUT", "http://localhost:8080/scenarios/1", {
      statusCode: 200,
      body: {
        success: true,
        scenario: {
          id: "1",
          name: "Updated Scenario",
          mappings: [
            {
              request: { reqId: "2" },
              response: {}
            }
          ]
        }
      }
    }).as("updateScenario");

    // 9. Save the updated scenario.
    cy.contains("Update Scenario").click();
    cy.wait("@updateScenario");

    // 10. Override the GET scenarios intercept to return the updated scenario.
    cy.intercept("GET", "http://localhost:8080/scenarios", {
      statusCode: 200,
      body: {
        scenarios: [
          {
            id: "1",
            name: "Updated Scenario",
            mappings: [
              {
                request: { reqId: "2" },
                response: {}
              }
            ]
          }
        ]
      }
    }).as("getUpdatedScenarios");

    // 11. Redirect back to the scenarios page.
    cy.visit("http://localhost:5173/scenarios");
    cy.wait("@getUpdatedScenarios");

    // 12. Verify that the scenario title has been updated.
    cy.contains("Updated Scenario").should("exist");

    // 13. Expand the updated scenario.
    cy.contains("Updated Scenario").click();

    // 14. Verify that the expanded scenario includes the /update URL mapping.
    cy.contains("/update").should("exist");
  });
});
