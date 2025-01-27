describe("Mappings Page", () => {
  it('should interact with both request and response form fields correctly and navigate to homepage after saving', () => {
    // Visit the page
    cy.visit('http://localhost:5173/mappings');
    
    // Interact with Request Form (ReqForm)
    // Verify the title input field is visible and type "titel"
    cy.get('[data-testid="title-input"]').type("titel");

    // Verify the URL input field is visible and type a URL
    cy.get('[data-testid="url-input"]').type("http://example.com");

    // Verify the method dropdown is visible and select "POST"
    cy.get('[data-testid="method-select"]').select("POST");

    // Verify the headers textarea is visible and type JSON
    cy.get('[data-testid="headers-input-req"]').type('{"Content-Type": "application/json"}', { parseSpecialCharSequences: false });

    // Verify the body textarea is visible and type JSON
    cy.get('[data-testid="body-input-req"]').should('be.visible').type('{"key": "value"}', { parseSpecialCharSequences: false });
    
    // Interact with Response Form (ResForm)
    // Verify the status input field is visible and type a status code
    cy.get('[data-testid="status-input"]').type("200");

    // Verify the headers textarea is visible and type JSON
    cy.get('[data-testid="headers-input"]').type('{"Content-Type": "application/json"}', { parseSpecialCharSequences: false });

    // Verify the body textarea is visible and type JSON
    cy.get('[data-testid="body-input"]').should('be.visible').type('{"key": "value"}', { parseSpecialCharSequences: false });

   

    // Click the "Save Mapping" button
    cy.get('button').contains('Save Mapping').click();

    
   

   
  });
});
