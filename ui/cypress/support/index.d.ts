/// <reference types="Cypress" />
import { Product } from '../fixtures/product';
import { Person } from '../fixtures/person';

declare namespace Cypress {
    interface Chainable {
        visitBoard(): Chainable<any>;

        resetProduct(product: Product): Chainable<any>;
        resetPerson(person: Person): Chainable<any>;
        resetRole(role: string): Chainable<any>;
        resetLocationTags(): Chainable<any>;
        resetProductTags(): Chainable<any>;

        getModal(): Chainable<any>;
        closeModal(): Chainable<any>;
    }
}