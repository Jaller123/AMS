it('should add mappings to the "Create a New Scenario" panel', () => {
    // 1️⃣ Besök scenarios-sidan
    cy.visit('http://localhost:5173/scenarios');
    
    // Vänta en sekund innan nästa åtgärd
   
  
    // 2️⃣ Klicka på "➕ Add new Scenario"-knappen
    cy.contains('➕ Add new Scenario').click();
  
    // Vänta en sekund efter att ha klickat på knappen
  
  
    // 3️⃣ Verifiera att vi är på rätt sida
    cy.url().should('include', '/create-scenario');
  
    // Vänta ytterligare en sekund innan nästa steg
   
  
    // 4️⃣ Vänta på att mappings ska vara laddade i högra panelen
    cy.intercept('GET', '/api/mappings').as('getMappings'); // Intercepta API-anropet
  
  
    // Vänta ytterligare en sekund för att simulera långsammare rendering
   
  
    // Vänta på att mappings ska renderas innan vi klickar på "Add to Scenario"
    cy.contains('Add to Scenario').click();

    cy.get('input[placeholder="Enter Scenario Title Here"]').type('My Test Scenario');
    
    cy.contains('Save Scenario').click();

    cy.visit('http://localhost:5173/scenarios');
  
  
  });  