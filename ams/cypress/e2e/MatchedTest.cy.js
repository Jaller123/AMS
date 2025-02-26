/// <reference types="cypress" />

describe('Traffic Row Matched Link & Auto-Expand Mapping', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);

    // Stub GET __admin/requests to return a traffic row with a matchedStubId.
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
            // This property will help us match the mapping.
            matchedStubId: "e506e29f-9aca-40a1-a5c7-141d26a0ba74",
            timestamp: "2/11/2025, 10:26:15 AM"
          }
        ]
      }
    }).as('getWiremockRequests');

    // Stub GET /mappings to return a saved mapping that matches the above traffic row.
    cy.intercept('GET', '**/mappings', {
      statusCode: 200,
      body: {
        requests: [
          {
            id: "1",
            resJson: {
              title: "Test Endpoint",
              url: "/test-endpoint",
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: { "key": "value" }
            },
            wireMockId: "e506e29f-9aca-40a1-a5c7-141d26a0ba74"
          }
        ],
        responses: []
      }
    }).as('getMappings');
  });

  it('navigates from Traffic to home and auto expands the matching mapping', () => {
    // Step 1: Visit the Traffic page.
    cy.visit('http://localhost:5173/traffic');
    
    // Step 2: Wait for the traffic data to load.
    cy.wait('@getWiremockRequests');
    cy.contains('✅ Matched').should('exist');

    // Step 3: Click the "✅ Matched" link.
    cy.contains('✅ Matched').click({ force: true });

    // Step 4: Wait for the mappings to load.
    cy.wait('@getMappings');

    // Step 5: Verify that at least one mapping item is rendered.
    cy.get('[data-testid="mapping-item"]').should('exist');

    // Alias the first mapping item for easier reference.
    cy.get('[data-testid="mapping-item"]').first().as('mappingItem');

    // Step 6: Verify that the mapping item contains the expected details.
    cy.get('@mappingItem')
      .should('contain', 'POST')
      .and('contain', '/test-endpoint')
      .and('contain', 'Test Endpoint');

    // Step 7: Verify that the mapping item is auto expanded 
    // (i.e. the toggle button now shows "Hide Details").
    cy.get('@mappingItem')
      .find('[data-testid="toggle-button"]')
      .should('contain', 'Hide Details');

    // (Optional) Step 8: Verify that the mapping item is visible in the viewport.
    cy.get('@mappingItem').then(($el) => {
      const rect = $el[0].getBoundingClientRect();
      expect(rect.bottom).to.be.greaterThan(0);
    });
  });
});
