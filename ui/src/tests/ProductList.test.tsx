/*
 * Copyright (c) 2019 Ford Motor Company
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
import {fireEvent} from '@testing-library/react';
import PeopleMover from '../Application/PeopleMover';
import BoardClient from '../Boards/BoardClient';
import TestUtils, {renderWithRedux} from './TestUtils';
import {AxiosResponse} from 'axios';

describe('Product List tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
    });

    it('should only have one edit menu open at a time', async () => {
        BoardClient.getAllBoards = jest.fn(() => Promise.resolve(
            {
                data: [
                    {
                        id: 'b1',
                        name: 'board one',
                        products: [
                            TestUtils.unassignedProduct,
                            TestUtils.productWithAssignments,
                            {
                                id: 102,
                                name: 'Product 2',
                                start: '',
                                end: '',
                                location: 'Detroit',
                                assignments: [TestUtils.assignmentForHank],
                                productTags: [],
                            },
                        ],
                    },
                ],
            } as AxiosResponse
        ));
        const underTest = renderWithRedux(<PeopleMover/>);

        const editPerson1Button = await underTest.findByTestId('editPersonIconContainer-1');
        const editPerson3Button = await underTest.findByTestId('editPersonIconContainer-3');

        fireEvent.click(editPerson1Button);
        await underTest.findByTestId('editMenu');

        fireEvent.click(editPerson3Button);
        await underTest.findByTestId('editMenu');

        expect(underTest.getAllByTestId('editMenu').length).toEqual(1);
    });
});