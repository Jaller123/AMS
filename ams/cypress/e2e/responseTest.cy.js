/// <reference types="cypress" />

describe("Mappings Page - Response Functionalities", () => {
  beforeEach(() => {
    // Intercept the GET /mappings request
    cy.intercept("GET", "/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              url: "/test",
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
            isActive: true,
          },
        ],
        responses: [
          {
            id: "1.1",
            reqId: "1",
            resJson: {
              status: "200",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
        ],
      },
    }).as("getMappings");

    // Visit the mappings page
    cy.visit("http://localhost:5173");
    cy.wait("@getMappings");
  });

  it("should edit an existing response and verify changes", () => {
    // Expand the mapping details
    cy.contains("Saved Mappings").click();
    cy.contains("Show Details").click();
    cy.contains("Edit Response").click();

    // Intercept the PUT request for updating the response
    cy.intercept("PUT", "/mappings", {
      statusCode: 200,
      body: {
        id: "1.1",
        reqId: "1",
        resJson: {
          status: "202",
          headers: { "Content-Type": "application/xml" },
          body: { body: "updated response" },
        },
      },
    }).as("updateResponse");

    // Modify response status, headers, and body
    cy.get('input[placeholder="Status"]')
      .clear()
      .type("202");

    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/xml"}', { parseSpecialCharSequences: false });

    cy.get("textarea")
      .eq(1)
      .clear()
      .type('{"body":"updated response"}', { parseSpecialCharSequences: false });

    // Click "Save Response" and wait for the PUT intercept
    cy.contains("Save Response").click();

    // Verify that the updated response details are rendered in the <pre> element
    cy.get("pre").should("contain.text", '"status": "202"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/xml"');
    cy.get("pre").should("contain.text", '"body": "updated response"');
  });

  it("should add a new response, navigate back, and select the latest response", () => {
    cy.contains("Saved Mappings").click();
    cy.contains("Show Details").click();
    cy.contains("Add New Response").click();

    // Verify that the URL matches the add response route (e.g. /request/1)
    cy.url().should("match", /\/request\/\d+/);

    // Fill in new response details
    cy.get('input[placeholder="Status"]')
      .clear()
      .type("201");

    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/json"}', { parseSpecialCharSequences: false });

    cy.get("textarea")
      .eq(1)
      .clear()
      .type('{"body":"new response body"}', { parseSpecialCharSequences: false });

    // Intercept the POST request for saving the new response
    cy.intercept("POST", "/responses", {
      statusCode: 200,
      body: {
        id: "1.3",
        reqId: "1",
        resJson: {
          status: "201",
          headers: { "Content-Type": "application/json" },
          body: { body: "new response body" },
        },
      },
    }).as("saveResponse");

    // Save the new response and wait for the intercept
    cy.contains("Save Response").click();
    cy.wait("@saveResponse");

    // Intercept the updated GET /mappings to simulate that the new response has been added
    cy.intercept("GET", "/mappings", {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              url: "/test",
              method: "POST",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
            isActive: true,
          },
        ],
        responses: [
          {
            id: "1.1",
            reqId: "1",
            resJson: {
              status: "200",
              headers: { "Content-Type": "text/plain" },
              body: { body: "test1" },
            },
          },
          {
            id: "1.3",
            reqId: "1",
            resJson: {
              status: "201",
              headers: { "Content-Type": "application/json" },
              body: { body: "new response body" },
            },
          },
        ],
      },
    }).as("updatedMappings");

    // Navigate back to Mappings
    cy.contains("Back to Mappings").click();

    // Expand mapping details again
    cy.contains("Saved Mappings").first().click();
    cy.contains("Show Details").click();

    // Select the latest response from the dropdown
    cy.get("select[placeholder='Select Response'] option")
      .last()
      .then(($latestResponse) => {
        const latestResponseText = $latestResponse.text();
        cy.get("select[placeholder='Select Response']").select(latestResponseText);
      });

    // Verify that the response dropdown now contains the new response
    cy.get("select[placeholder='Select Response']")
      .find("option")
      .should("have.length", 2)
      .and("contain", "201");

    // Verify that the response editor displays the new response details
    cy.get("pre").should("contain.text", '"status": "201"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/json"');
    cy.get("pre").should("contain.text", '"body": "new response body"');
  });
});
