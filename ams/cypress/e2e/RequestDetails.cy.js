/// <reference types="cypress" />

// Define the different URL matching types along with the new URL input and expected rendered key/value.
const urlMatchTypes = [
  {
    type: "url", // exact URL matching (default)
    input: "/exact-url",
    expectedKey: "url",
    expectedValue: "/exact-url",
  },
  {
    type: "urlPath", // matches only the path (ignoring query params)
    input: "/path-url",
    expectedKey: "urlPath",
    expectedValue: "/path-url",
  },
  {
    type: "urlPathPattern", // regex pattern for the URL path
    input: "/path-[0-9]+",
    expectedKey: "urlPathPattern",
    expectedValue: "/path-[0-9]+",
  },
  {
    type: "urlPathTemplate", // templated URL matching (e.g. /user/{userId})
    input: "/user/{userId}",
    expectedKey: "urlPathTemplate",
    expectedValue: "/user/{userId}",
  },
  {
    type: "urlPattern", // regex pattern for the entire URL
    input: ".*pattern.*",
    expectedKey: "urlPattern",
    expectedValue: ".*pattern.*",
  },
];

describe("Mappings Page - URL Matching Types", () => {
  urlMatchTypes.forEach(({ type, input, expectedKey, expectedValue }) => {
    it(`should allow editing request to use ${type} matching`, () => {
      // Stub GET /mappings so that the page initially renders a mapping using the default "url" key.
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
              uuid: "abc-123",
            },
          ],
          responses: [],
        },
      }).as("getMappings");

      // Visit the homepage.
      cy.visit("http://localhost:5173");
      cy.wait("@getMappings");

      // Verify that the summary details are rendered.
      cy.contains("POST").should("exist");
      cy.contains("/test-url").should("exist");
      cy.contains("Test Request").should("exist");

      // Expand the request details.
      cy.contains("Show Details").click();

      // Verify that the details are rendered.
      cy.contains('"url": "/test-url"').should("exist");
      cy.contains('"method": "POST"').should("exist");
      cy.contains('"Content-Type": "application/json"').should("exist");
      cy.contains('"body": "Test Body"').should("exist");

      // Click the "Edit Request" button.
      cy.contains("Edit Request").should("exist").click();

      // In the edit form, select the new URL matching type.
      cy.get('[data-testid="url-match-type-select"]')
        .should("exist")
        .select(type);

      // Clear and update the URL input field.
      cy.get('[data-testid="url-input-field"]')
      .should("exist")
      .clear()
      .type(input, { parseSpecialCharSequences: false });

      // Click the "Save Request" button.
      cy.contains("Save Request").click();

      // Verify that the updated mapping details now show the new matching key and value.
      cy.contains(`"${expectedKey}": "${expectedValue}"`).should("exist");

      // Optionally, if the matching type is not the default "url", the old "url" key should no longer be visible.
      if (type !== "url") {
        cy.contains('"url":').should("not.exist");
      }
    });
  });
});
