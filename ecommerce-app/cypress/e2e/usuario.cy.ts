// Describe el conjunto de pruebas: agrupa tests relacionados bajo un título descriptivo.
// Enfocado en el flujo completo de un usuario en el e-commerce.
describe('Flujo completo de usuario', () => {
  // Variables de prueba: definen datos únicos para evitar conflictos (ej. usuarios duplicados en DB).
  // 'name' es el nombre del usuario simulado.
  const name = 'Rodrigo';
  // 'email' usa timestamp para unicidad (ej. usuario_1734567890123@correo.com).
  const email = `usuario_${Date.now()}@correo.com`;
  // Esto asegura una contraseña consistente basada en el nombre.
  const password = `${name}123456`;

  // Define el test individual: describe lo que valida (registro, login, perfil).
  // 'it' es el bloque ejecutable de Cypress.
  it('debe registrar, iniciar sesión y mostrar el perfil', () => {
    // Visita la página de registro: simula que el usuario abre /auth/register en el navegador.
    // Cypress carga la app Angular y navega a la ruta especificada.
    cy.visit('/auth/register');
    // Espera a que la página cargue completamente (útil para apps SPA).
    cy.wait(2000);

    // Selecciona el input de nombre: apunta al <input> dentro de <ui-input> con formcontrolname (minúscula en DOM).
    cy.get('ui-input[formcontrolname="displayName"] input').type(name);
    // Selecciona el input de email: similar, apunta al <input> dentro de <ui-input>.
    cy.get('ui-input[formcontrolname="email"] input').type(email);
    // Selecciona el input de password: apunta al <input> dentro de <ui-input>.
    cy.get('ui-input[formcontrolname="password"] input').type(password);
    // Selecciona el input de confirmación de password: apunta al <input> dentro de <ui-input>.
    cy.get('ui-input[formcontrolname="confirmar"] input').type(password);
    // Marca el checkbox de términos: usa formcontrolname minúscula.
    cy.get('input[formcontrolname="terminos"]').check();

    // Espera a que el botón se habilite (formulario válido) y hace clic.
    cy.get('.auth-submit-button button').should('not.be.disabled').click();

    // Verifica que el registro sea exitoso: busca el banner de éxito.
    cy.contains('Registro exitoso. Ahora inicia sesión').should('be.visible');
    // Espera adicional para el setTimeout de redirección (1200ms) + tiempo HTTP.
    cy.wait(3000);

    // Valida la redirección tras registro: asegura que la URL incluya '/auth/login'.
    // Confirma que el flujo continúa al login (basado en tu lógica de navegación).
    cy.url().should('include', '/auth/login');

    // Selecciona el input de email en login: apunta al <input> dentro de <ui-input>.
    cy.get('ui-input[formcontrolname="email"] input').type(email);
    // Selecciona el input de password en login: apunta al <input> dentro de <ui-input>.
    cy.get('ui-input[formcontrolname="password"] input').type(password);
    // Espera a que el botón se habilite (formulario válido) y hace clic.
    cy.get('.auth-submit-button button').should('not.be.disabled').click();

    // Valida la redirección tras login: asegura que la URL incluya '/' (home page).
    // Confirma acceso al home (basado en tu lógica de navegación).
    cy.url().should('include', '/');
    // Valida contenido en el home: busca la sección de productos destacados.
    // Confirma que el usuario está logueado y se muestra el catálogo.
    cy.contains('Productos Destacados');
  });
});
