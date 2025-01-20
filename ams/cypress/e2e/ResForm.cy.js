describe("Mappings Page", () => {
    it('should interact with the form fields correctly', () => {
      // Besök sidan
      cy.visit('http://localhost:5173/mappings');
      
      // Kontrollera om titel inputfält är synligt och skriv "gunnar"
      cy.get('[ data-testid="status-input"]').type("200");
  
      // Kontrollera om URL inputfält är synligt och skriv en URL
      cy.get('[ data-testid="headers-input"]').type("headers");
  
      // Kontrollera om metod dropdown är synlig och välj "POST"
      cy.get('[data-testid="body-input"]').type("body");
  
    
    });
  });