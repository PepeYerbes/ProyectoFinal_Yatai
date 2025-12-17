// filepath: ecommerce-app/cypress.config.ts
import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // URL base de tu app Angular (debe coincidir con el servidor de desarrollo).
    baseUrl: 'http://localhost:4200',
    // Patrón para encontrar archivos de prueba (busca en cypress/e2e/).
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    // Desactiva el archivo de soporte por defecto (puedes agregarlo si necesitas hooks globales).
    supportFile: false,
  },
});
