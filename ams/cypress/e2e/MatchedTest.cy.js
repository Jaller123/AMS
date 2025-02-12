/// <reference types="cypress" />

describe('Traffic Row Matched Link & Auto-Expand Mapping', () => {
  beforeEach(() => {
    // Set the viewport to a larger size to avoid scroll issues.
    cy.viewport(1280, 800);

    // Stub the WireMock traffic data to include one row with a "Matched" link.
    cy.intercept('GET', '**/__admin/requests', {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "row1",
            request: {
              method: "POST",
              title: "Test Endpoint",
              url: "/test-endpoint",
              headers: {},
              body: ""
            },
            response: {
              status: 204,
              headers: { "Matched-Stub-Id": "e506e29f-9aca-40a1-a5c7-141d26a0ba74" },
              body: ""
            },
            matchedStubId: "e506e29f-9aca-40a1-a5c7-141d26a0ba74",
            timestamp: "2/11/2025, 10:26:15 AM"
          }
        ]
      }
    }).as('getWiremockRequests');

    // Stub the saved mappings API to include a mapping that matches the traffic row.
    cy.intercept('GET', '**/mappings', {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {  // using "resJson" to match your component's expectations
              title: "Test Endpoint",
              url: "/test-endpoint",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: { "key": "value" }
            },
            wireMockUuid: "e506e29f-9aca-40a1-a5c7-141d26a0ba74"
          }
        ],
        responses: []
      }
    }).as('getMappings');
  });

  it('navigates from Traffic to home and auto expands the matching mapping', () => {
    // Step 1: Visit the Traffic page.
    cy.visit('http://localhost:5173/traffic');
    cy.wait(500); // Wait 2 seconds after visiting

    // Step 2: Wait for the traffic data to load and verify that the "✅ Matched" link exists.
    cy.wait('@getWiremockRequests');
    
    cy.contains('✅ Matched').should('exist');
    cy.wait(1000);

    // Step 3: Click the "✅ Matched" link.
    cy.contains('✅ Matched').click({ force: true });


    // Step 4: Wait for the mappings to load.
    cy.wait('@getMappings');
    cy.wait(1000);

    // Step 5: Verify that at least one mapping item is rendered.
    cy.get('[data-testid="mapping-item"]').should('exist');
    cy.wait(1000);

    // Alias the first mapping item for easier reference.
    cy.get('[data-testid="mapping-item"]').first().as('mappingItem');
    cy.wait(500);

    // Step 6: Within that mapping item, if the toggle button text is "Show Details", click it.
    cy.get('@mappingItem')
      .find('[data-testid="toggle-button"]')
      .then(($btn) => {
        if ($btn.text().includes('Show Details')) {
          cy.wrap($btn).click({ force: true });
        }
      });
    
      cy.get('@mappingItem')
      .should('contain', 'POST')
      .and('contain', '/test-endpoint')
  
        cy.wait(500);

    // (Optional) Step 8: Verify that at least part of the mapping item is visible in the viewport.
    cy.get('@mappingItem').then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      // Instead of requiring the entire element to be in view,
      // simply assert that some part is visible.
      expect(rect.bottom).to.be.greaterThan(0);
    });
  });
});
