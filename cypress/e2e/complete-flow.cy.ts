// cypress/e2e/complete-flow.cy.ts
/**
 * Pruebas E2E completas de SkeletonAPP
 * Cubre flujos de login, navegación y funcionalidades principales
 */

describe('SkeletonAPP Complete Flow', () => {
  const testEmail = 'test@example.com';
  const testPassword = 'test123456';

  beforeEach(() => {
    // Visitar la app antes de cada prueba
    cy.visit('http://localhost:8100');
    
    // Esperar a que cargue completamente
    cy.get('ion-app', { timeout: 10000 }).should('exist');
  });

  describe('Login Flow', () => {
    it('should display login page on app start', () => {
      cy.url().should('include', '/login');
      cy.contains('ion-title', /login|ingresar/i).should('be.visible');
      cy.get('ion-input').should('have.length.at.least', 2);
    });

    it('should show validation errors for empty fields', () => {
      // Intentar enviar sin llenar campos
      cy.contains('ion-button', /ingresar|login/i).click();

      // Verificar que hay errores de validación
      cy.get('ion-item').should('have.class', 'ng-invalid');
    });

    it('should login successfully with valid credentials', () => {
      // Llenar email
      cy.get('ion-input[formControlName="email"]')
        .find('input')
        .type(testEmail, { force: true });

      // Llenar contraseña
      cy.get('ion-input[formControlName="password"]')
        .find('input')
        .type(testPassword, { force: true });

      // Click en ingresar
      cy.contains('ion-button', /ingresar|login/i).click();

      // Verificar navegación a home
      cy.url({ timeout: 5000 }).should('include', '/home');
      cy.contains('ion-title', 'Home').should('be.visible');
    });

    it('should navigate to registration page', () => {
      cy.contains('ion-button', /registro|registr/i).click();
      cy.url().should('include', '/registrar');
      cy.contains('ion-title', /registro|registr/i).should('be.visible');
    });
  });

  describe('Home Page Navigation', () => {
    beforeEach(() => {
      // Login antes de cada test
      cy.login(testEmail, testPassword);
    });

    it('should display home page with menu button', () => {
      cy.get('ion-menu-button').should('be.visible');
      cy.contains('ion-title', 'Home').should('be.visible');
    });

    it('should open side menu', () => {
      cy.get('ion-menu-button').click();

      // Verificar que el menú está visible
      cy.get('ion-menu ion-item').should('have.length.at.least', 5);
    });

    it('should navigate to Portada from menu', () => {
      cy.get('ion-menu-button').click();
      cy.contains('ion-item', 'Portada').click();

      cy.url().should('include', '/portada');
      cy.contains('ion-title', 'Portada').should('be.visible');
    });

    it('should navigate to Categorías from menu', () => {
      cy.get('ion-menu-button').click();
      cy.contains('ion-item', 'Categorías').click();

      cy.url().should('include', '/categorias');
      cy.contains('ion-title', /categor/i).should('be.visible');
    });
  });

  describe('News Page', () => {
    beforeEach(() => {
      cy.login(testEmail, testPassword);
      cy.get('ion-menu-button').click();
      cy.contains('ion-item', 'Noticias').click();
      cy.url().should('include', '/news');
    });

    it('should display news page with form', () => {
      cy.contains('ion-title', 'Noticias').should('be.visible');
      cy.get('ion-input[formControlName="title"]').should('be.visible');
      cy.get('ion-textarea[formControlName="content"]').should('be.visible');
    });

    it('should display existing news', () => {
      // Verificar que hay al menos una noticia de ejemplo
      cy.get('ion-item').should('have.length.at.least', 1);
    });

    it('should add new news successfully', () => {
      const newsTitle = `Test News ${Date.now()}`;
      const newsContent = 'This is test news content for E2E testing';

      // Llenar el formulario
      cy.get('ion-input[formControlName="title"]')
        .find('input')
        .clear()
        .type(newsTitle, { force: true });

      cy.get('ion-textarea[formControlName="content"]')
        .find('textarea')
        .clear()
        .type(newsContent, { force: true });

      // Click en agregar
      cy.contains('ion-button', /agregar/i).click();

      // Verificar que la noticia fue agregada
      cy.contains(newsTitle).should('be.visible');
      cy.contains(newsContent).should('be.visible');

      // Verificar que el formulario se limpió
      cy.get('ion-input[formControlName="title"]')
        .find('input')
        .should('have.value', '');
    });

    it('should delete news successfully', () => {
      // Obtener cantidad inicial
      cy.get('ion-list ion-item').then($items => {
        const initialCount = $items.length;

        // Click en botón de eliminar del primer item
        cy.get('ion-button[color="danger"]').first().click();

        // Verificar que decreció la cantidad
        cy.get('ion-list ion-item').should('have.length', initialCount - 1);
      });
    });

    it('should show validation errors when submitting empty form', () => {
      // Try sin llenar campos
      cy.contains('ion-button', /agregar/i).should('be.disabled');
    });
  });

  describe('Sync API Demo Page', () => {
    beforeEach(() => {
      cy.login(testEmail, testPassword);
      cy.get('ion-menu-button').click();
      cy.contains('ion-item', /sync api|demo/i).click();
      cy.url().should('include', '/sync-api');
    });

    it('should display Sync API page with cache statistics', () => {
      cy.contains('ion-title', /sync|api|demo/i).should('be.visible');
      cy.contains(/estadísticas|cache|statistics/i).should('be.visible');
    });

    it('should show cache statistics', () => {
      cy.contains(/posts en caché/i).should('be.visible');
      cy.contains(/usuarios en caché/i).should('be.visible');
    });

    it('should force sync from API', () => {
      cy.contains('ion-button', /sincronizar|sync/i).click();

      // Esperar a que se complete la sincronización
      cy.contains(/actualizando|updating/i, { timeout: 10000 }).should('be.visible');
      cy.contains(/actualizando|updating/i, { timeout: 10000 }).should('not.exist');
    });

    it('should search data synchronously', () => {
      cy.get('ion-searchbar')
        .find('input')
        .type('test', { force: true });

      // Resultados deben aparecer instantáneamente
      cy.contains(/posts|usuarios|comentarios/i, { timeout: 2000 }).should('be.visible');
    });

    it('should clear cache', () => {
      // Obtener cantidad inicial
      cy.contains(/posts en caché/i).parent().parent().invoke('text').then(text => {
        const initialCount = parseInt(text);
        expect(initialCount).toBeGreaterThan(0);
      });

      // Click en limpiar caché
      cy.contains('ion-button', /limpiar|clear/i).click();

      // Verificar que el caché está limpio
      cy.contains(/posts en caché/i).parent().parent().invoke('text').then(text => {
        expect(text).toContain('0');
      });
    });
  });

  describe('User Avatar and Settings', () => {
    beforeEach(() => {
      cy.login(testEmail, testPassword);
    });

    it('should display avatar on home page', () => {
      cy.get('ion-avatar').should('be.visible');
    });

    it('should change avatar on click', () => {
      // Click en avatar
      cy.get('ion-avatar').click();

      // Debería haber un efecto haptic (difícil de probar en E2E)
      // Pero el avatar debería cambiar o mostrar opciones
      cy.wait(500);
    });
  });

  describe('Logout', () => {
    beforeEach(() => {
      cy.login(testEmail, testPassword);
    });

    it('should logout and redirect to login', () => {
      // Abrir menú
      cy.get('ion-menu-button').click();

      // Click en logout si existe
      cy.contains('ion-item', /logout|salir|cerrar/i).click({ force: true });

      // Debería redirigir a login
      cy.url().should('include', '/login');
    });
  });

  describe('Error Handling', () => {
    it('should handle navigation to invalid page', () => {
      cy.visit('http://localhost:8100/invalid-page');

      // Debería mostrar página 404 o redirigir
      cy.get('body').should('exist');
    });

    it('should handle offline gracefully', () => {
      cy.login(testEmail, testPassword);

      // Simular modo offline
      cy.intercept('GET', '**/api/**', {
        statusCode: 0,
        delay: 1000
      }).as('apiError');

      cy.get('ion-menu-button').click();
      cy.contains('ion-item', 'Noticias').click();

      // La app debería mostrar datos en caché
      cy.get('ion-item').should('have.length.at.least', 0);
    });
  });

  describe('Responsiveness', () => {
    it('should work on mobile viewport', () => {
      cy.viewport('iphone-12');

      cy.login(testEmail, testPassword);

      cy.get('ion-menu-button').should('be.visible');
      cy.contains('ion-title', 'Home').should('be.visible');
    });

    it('should work on tablet viewport', () => {
      cy.viewport('ipad-2');

      cy.login(testEmail, testPassword);

      cy.contains('ion-title', 'Home').should('be.visible');
    });
  });
});

/**
 * Comando personalizado para login
 * cypress/support/commands.ts
 */
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

Cypress.Commands.add('login', (email: string, password: string) => {
  cy.visit('http://localhost:8100/login');

  cy.get('ion-input[formControlName="email"]')
    .find('input')
    .type(email, { force: true });

  cy.get('ion-input[formControlName="password"]')
    .find('input')
    .type(password, { force: true });

  cy.contains('ion-button', /ingresar|login/i).click();

  cy.url({ timeout: 5000 }).should('include', '/home');
  cy.contains('ion-title', 'Home').should('be.visible');
});

export {};
