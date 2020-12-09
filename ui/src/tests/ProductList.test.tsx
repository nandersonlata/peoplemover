/*
 * Copyright (c) 2020 Ford Motor Company
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
import {act, fireEvent, RenderResult} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import TestUtils, {renderWithRedux} from './TestUtils';
import {AxiosResponse} from 'axios';
import ProductClient from '../Products/ProductClient';
import ProductList from '../Products/ProductList';
import {GlobalStateProps} from '../Redux/Reducers';
import moment from 'moment';
import {Product} from '../Products/Product';

describe('Product List tests', () => {
    let app: RenderResult;

    beforeEach(async () => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();

        ProductClient.getProductsForDate = jest.fn(() => Promise.resolve(
            {
                data: TestUtils.products,
            } as AxiosResponse
        ));
    });

    it('should only have one edit menu open at a time', async () => {
        await act(async () => {
            app = await renderWithRedux(<PeopleMover/>);
            const editPerson1Button = await app.findByTestId('editPersonIconContainer__person_1');
            const editPerson3Button = await app.findByTestId('editPersonIconContainer__hank');

            fireEvent.click(editPerson1Button);
            await app.findByTestId('editMenu');

            fireEvent.click(editPerson3Button);
            await app.findByTestId('editMenu');
        });
        expect(app.getAllByTestId('editMenu').length).toEqual(1);
    });

    describe('Product list test filtering', () => {
        it('should return all products with the selected location filter', async () => {
            const productWithAnnArborLocation: Product = {
                id: 99,
                name: 'AA',
                spaceId: 1,
                startDate: '2011-01-01',
                endDate: undefined,
                spaceLocation: TestUtils.annarbor,
                assignments: [],
                archived: false,
                productTags: [TestUtils.productTag2],
                notes: '',
            };
            let products: Array<Product> = Object.assign([], TestUtils.products);
            products.push(productWithAnnArborLocation);

            const initialState = {
                products: products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: TestUtils.allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
            } as GlobalStateProps;

            let component = await renderWithRedux(<ProductList/>, undefined, initialState);
            await component.findByText(TestUtils.productForHank.name);
            await component.findByText(productWithAnnArborLocation.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(3);
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions = [
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
            ];

            const initialState = {
                products: TestUtils.products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
            } as GlobalStateProps;

            let component = await renderWithRedux(<ProductList/>, undefined, initialState);
            await component.findByText(TestUtils.productWithAssignments.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });

        it('should return all products with the selected product tag filter', async () => {
            const allGroupedTagFilterOptions = [
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
                products: TestUtils.products,
                productTags: TestUtils.productTags,
                allGroupedTagFilterOptions: allGroupedTagFilterOptions,
                viewingDate: moment().toDate(),
                productSortBy: 'name',
            } as GlobalStateProps;
    
            let component = await renderWithRedux(<ProductList/>, undefined, initialState);
            await component.findByText(TestUtils.productWithoutAssignments.name);
            expect(component.getByTestId('productListSortedContainer').children.length).toEqual(2);
        });
    });
});
