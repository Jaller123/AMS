describe('ReqForm Component Tests', () => {

    it('renders the form correctly', () => {
  
      cy.visit('http://localhost:5173/'); 
     
      cy.get('h2').should('contain', 'Request');
  
      cy.get('[ data-test-id="input-url"]').type("url")
      cy.get('[ data-test-id="input-field"]').type("url")
      
    });
  
  
  });
  