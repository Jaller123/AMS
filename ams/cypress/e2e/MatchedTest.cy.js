/// <reference types="cypress" />

describe('Traffic Row Matched Link & Auto-Expand Mapping', () => {
    beforeEach(() => {
      // Stub the WireMock traffic data to include one row with a "Matched" link.
      cy.intercept('GET', '**/__admin/requests', {
        statusCode: 200,
        body: {
          requests: [
            {
              id: "row1",
              request: { method: "POST", url: "/tva", headers: {}, body: "" },
              response: {
                status: 204,
                headers: { "Matched-Stub-Id": "some-wiremock-uuid" },
                body: ""
              },
              // This property will be used by your join logic to assign mappingId "8"
              matchedStubId: "some-wiremock-uuid",
              timestamp: "2/11/2025, 10:26:15 AM"
            }
          ]
        }
      }).as('getWiremockRequests');
  
      // Stub the saved mappings API to include a mapping with id "8" that matches the traffic row.
      // IMPORTANT: Use "request" instead of "resJson" so that your components can read request.url, etc.
      cy.intercept('GET', '**/mappings', {
        statusCode: 200,
        body: {
          requests: [
            {
              id: "8",
              request: {
                title: "TestMapping",
                url: "/tva",
                method: "POST",
                headers: { "Content-Type": "application/json" }
              },
              wireMockUuid: "some-wiremock-uuid"
            }
          ],
          responses: []
        }
      }).as('getMappings');
    });
  
    it('navigates from Traffic to home and auto expands the matching mapping', () => {
      // Step 1: Visit the Traffic page.
      // If you have set a baseUrl in your Cypress config (e.g., http://localhost:5173), you can use a relative URL.
      cy.visit('http://localhost:5173/traffic');
  
      // Wait for the traffic data to load.
      cy.wait('@getWiremockRequests');
  
      // Step 2: Verify that the traffic row displays the "✅ Matched" link.
      // (The row is assumed to have a CSS class similar to what you provided.)
      cy.get('div._tableRow_1qlz7_149').within(() => {
        cy.contains('✅ Matched').should('exist');
      });
  
      // Step 3: Click the "✅ Matched" link.
      cy.contains('✅ Matched').click();
  
      // Wait for the mappings to load.
      cy.wait('@getMappings');
  
      // Step 4: Verify that on the home (mappings) page the mapping with id "8" is auto-expanded.
      // For example, the mapping should show a "Hide Details" button instead of "Show Details".
      cy.get('.mappingItem')
        .contains('TestMapping')
        .parents('.mappingItem')
        .within(() => {
          cy.contains('Hide Details').should('exist');
        });
  
      // (Optional) Also verify that the mapping item is scrolled into view.
      cy.get('.mappingItem')
        .contains('TestMapping')
        .parents('.mappingItem')
        .then(($el) => {
          const rect = $el[0].getBoundingClientRect();
          // For instance, check that the top is not far off the visible viewport.
          expect(rect.top).to.be.lessThan(200);
        });
    });
  });
  