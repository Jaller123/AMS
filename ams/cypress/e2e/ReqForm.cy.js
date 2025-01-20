describe("Mappings Page", () => {
    it('should interact with the form fields correctly', () => {
      // Besök sidan
      cy.visit('http://localhost:5173/mappings');
      
      // Kontrollera om titel inputfält är synligt och skriv "gunnar"
      cy.get('[data-testid="title-input"]').type("titel");
  
      // Kontrollera om URL inputfält är synligt och skriv en URL
      cy.get('[data-testid="url-input"]').type("http://example.com");
  
      // Kontrollera om metod dropdown är synlig och välj "POST"
      cy.get('[data-testid="method-select"]').select("POST");
  
      // Kontrollera om headers textarea är synlig och skriv JSON
      cy.get('[data-testid="headers-input-req"]').type('{"Content-Type": "application/json"}', { parseSpecialCharSequences: false });
  
      // Kontrollera om body textarea är synlig och skriv JSON
      cy.get('[data-testid="body-input-req"]').should('be.visible').type('{"key": "value"}', { parseSpecialCharSequences: false });
      
      // Skicka in formuläret om det finns en submit-knapp
      // cy.get('[data-testid="submit-button"]').click();
    });
  });