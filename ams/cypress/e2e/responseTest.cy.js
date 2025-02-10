/// <reference types="cypress" />

describe("Mappings Page - Response Functionalities", () => {
  beforeEach(() => {
    // Intercept the GET /mappings request using a relative URL.
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

    // Visit the mappings page (adjust the URL if needed)
    cy.visit("http://localhost:5173");
    cy.wait("@getMappings");
  });

  it("should edit an existing response and verify changes", () => {
    // Expand the mapping details
    cy.contains("Saved Mappings").click();

    cy.contains("Show Details").click();

    // Enter editing mode for the response editor
    cy.contains("Edit Response").click();

    // Modify response status
    cy.get('input[placeholder="Status"]').clear().type("202");

    // Modify response headers
    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/xml"}', {
        parseSpecialCharSequences: false,
      });

    // Modify response body
    cy.get("textarea").eq(1).clear().type('{"body":"updated response"}', {
      parseSpecialCharSequences: false,
    });
    // Modify response headers (assumes the first textarea corresponds to headers)
    cy.get('textarea')
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/xml"}', { parseSpecialCharSequences: false });

    // Modify response body (assumes the second textarea corresponds to the body)
    cy.get('textarea')
      .eq(1)
      .clear()
      .type('{"body":"updated response"}', { parseSpecialCharSequences: false });

    // Click the "Save Response" button
    cy.contains("Save Response").click();

    // Verify that the updated response details are rendered in the <pre> element
    cy.get("pre").should("contain.text", '"status": "202"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/xml"');
    cy.get("pre").should("contain.text", '"body": "updated response"');
  });

  it("should add a new response, navigate back, and select the latest response", () => {
    cy.contains("Saved Mappings").click();
    // Expand mapping details
    cy.contains("Show Details").click();
    // Click "Add New Response" which should navigate to the add response page
    cy.contains("Add New Response").click();

    // Verify that the URL now matches the add response route (e.g. /request/1)
    cy.url().should("match", /\/request\/\d+/);

    // Fill in new response details
    cy.get('input[placeholder="Status"]').type("201");
    cy.get("textarea")
      .eq(0)
      .clear()
      .type('{"Content-Type":"application/json"}', {
        parseSpecialCharSequences: false,
      });
    cy.get("textarea").eq(1).clear().type('{"body":"new response body"}', {
      parseSpecialCharSequences: false,
    });
    // Fill in the new response details.
    // Assuming the form uses:
    //   - an input with placeholder "Status"
    //   - a textarea for headers (the first textarea)
    //   - a textarea for body (the second textarea)
    cy.get('input[placeholder="Status"]').clear().type("201");
    cy.get('textarea').eq(0).clear().type('{"Content-Type":"application/json"}', { parseSpecialCharSequences: false });
    cy.get('textarea').eq(1).clear().type('{"body":"new response body"}', { parseSpecialCharSequences: false });

    // Intercept the POST request for saving the new response using a relative URL.
    cy.intercept("POST", "/responses").as("saveResponse");
    cy.contains("Save Response").click();
    cy.wait("@saveResponse");

    // Intercept the updated GET /mappings (simulate that the new response has been added)
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
            id: "1.2",
            reqId: "1",
            resJson: {
              status: "202",
              headers: { "Content-Type": "application/xml" },
              body: { body: "updated response" },
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

    // Click "Back to Mappings" to return to the mappings page
    cy.contains("Back to Mappings").click();
    

    // Expand mapping details again
    cy.contains("Saved Mappings").first().click();

    cy.contains("Show Details").click();

    // Get the last (latest) response option dynamically
    cy.get("select[placeholder='Select Response'] option")
      .last()
      .then(($latestResponse) => {
        const latestResponseText = $latestResponse.text();
        cy.get("select[placeholder='Select Response']").select(
          latestResponseText
        );
      });
    // Verify that the response dropdown now contains the new response.
    cy.get("select[placeholder='Select Response']")
      .find("option")
      .should("have.length", 2)
      .and("contain", "201");

    // Select the new response (assuming it's the last option)
    cy.get("select[placeholder='Select Response']").then(($select) => {
      const options = $select.find("option");
      const newResponseValue = options[options.length - 1].value;
      cy.wrap($select).select(newResponseValue);
    });

    // Verify that the response editor displays the new response details
    cy.get("pre").should("contain.text", '"status": "201"');
    cy.get("pre").should("contain.text", '"Content-Type": "application/json"');
    cy.get("pre").should("contain.text", '"body": "new response body"');
  });
});
