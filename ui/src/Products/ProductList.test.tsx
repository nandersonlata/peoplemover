/*
 * Copyright (c) 2022 Ford Motor Company
 * All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import {screen} from '@testing-library/react';
import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import ProductList from './ProductList';
import {Product} from './Product';
import {AllGroupedTagFilterOptions} from '../SortingAndFiltering/FilterLibraries';
import {MutableSnapshot, RecoilRoot} from 'recoil';
import configureStore from 'redux-mock-store';
import {IsReadOnlyState} from '../State/IsReadOnlyState';
import {ProductsState} from '../State/ProductsState';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import {ProductTagsState} from '../State/ProductTagsState';

describe('Product List', () => {
    describe('Product list test filtering', () => {
        it('should return all products with the selected location filter', async () => {
            const productWithAnnArborLocation: Product = {
                id: 99,
                name: 'AA',
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                startDate: '2011-01-01',
                endDate: undefined,
                spaceLocation: TestData.annarbor,
                assignments: [],
                archived: false,
                tags: [TestData.productTag2],
                notes: '',
            };
            const products: Array<Product> = Object.assign([], TestData.products);
            products.push(productWithAnnArborLocation);

            const initialState = {
                productTags: TestData.productTags,
                allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
                currentSpace: TestData.space,
            };
            renderProductList(initialState, ({set}) => {
                set(ProductsState, products)
            });

            await screen.findByText(TestData.productForHank.name);
            await screen.findByText(productWithAnnArborLocation.name);
            expect(screen.getByTestId('productListSortedContainer').children.length).toEqual(3);
        });

        it('should return two aa products with location filter but not a product add button with readonly', async () => {
            const productWithAnnArborLocation: Product = {
                id: 99,
                name: 'AA',
                spaceUuid: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
                startDate: '2011-01-01',
                endDate: undefined,
                spaceLocation: TestData.annarbor,
                assignments: [],
                archived: false,
                tags: [TestData.productTag2],
                notes: '',
            };
            const products: Array<Product> = Object.assign([], TestData.products);
            products.push(productWithAnnArborLocation);

            const initialState = {
                productTags: TestData.productTags,
                allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions,
                currentSpace: TestData.space,
            };
            renderProductList(initialState, ({set}) => {
                set(IsReadOnlyState, true)
                set(ProductsState, products)
            });

            await screen.findByText(TestData.productForHank.name);
            await screen.findByText(productWithAnnArborLocation.name);
            expect(screen.getByTestId('productListSortedContainer').children.length).toEqual(2);
            expect(screen.queryByTestId('newProductButton')).not.toBeInTheDocument();
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'FordX',
                        value: '1_FordX',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
                {
                    label: 'Person Tags:',
                    options: [],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
            };
            renderProductList(initialState, ({set}) => {
                set(ProductsState, TestData.products)
                set(ProductTagsState, TestData.productTags)
                set(CurrentSpaceState, TestData.space)
            });

            await screen.findByText(TestData.productWithAssignments.name);
            expect(screen.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });

        it('should return one FordX products with product tag filter but not a product add button with readonly', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'FordX',
                        value: '1_FordX',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
                {
                    label: 'Person Tags:',
                    options: [],
                },
            ];

            const initialState = {
                productTags: TestData.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
            };
            renderProductList(initialState, ({set}) => {
                set(IsReadOnlyState, true)
                set(ProductsState, TestData.products)
                set(CurrentSpaceState, TestData.space)
            });

            await screen.findByText(TestData.productWithAssignments.name);
            expect(screen.getByTestId('productListSortedContainer').children.length).toEqual(1);
            expect(screen.queryByTestId('newProductButton')).not.toBeInTheDocument();
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions> = [
                {
                    label:'Location Tags:',
                    options: [{
                        label: 'Dearborn',
                        value: '1_Dearborn',
                        selected: true,
                    }],
                },
                {
                    label:'Product Tags:',
                    options: [{
                        label: 'AV',
                        value: '1_AV',
                        selected: true,
                    }],
                },
                {
                    label:'Role Tags:',
                    options: [],
                },
            ];

            const initialState = {
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
            };
            renderProductList(initialState, ({set}) => {
                set(ProductsState, TestData.products)
                set(ProductTagsState, TestData.productTags)
                set(CurrentSpaceState, TestData.space)
            });

            await screen.findByText(TestData.productWithoutAssignments.name);
            expect(screen.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });
    });
});

function renderProductList(preloadedReduxState: unknown, initializeState?: (mutableSnapshot: MutableSnapshot) => void) {
    const mockStore = configureStore([]);
    const store = mockStore(preloadedReduxState);
    renderWithRedux(
        <RecoilRoot initializeState={initializeState}>
            <ProductList/>
        </RecoilRoot>,
        store
    );
}
