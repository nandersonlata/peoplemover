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
import TestUtils, {renderWithRedux} from './TestUtils';
import PeopleMover from '../Application/PeopleMover';
import {RenderResult, wait} from '@testing-library/react';
import {Router} from 'react-router-dom';
import BoardClient from '../Boards/BoardClient';
import {createMemoryHistory} from 'history';

describe('PeopleMover', () => {
    let app: RenderResult;
    beforeEach(async (done) => {
        jest.clearAllMocks();
        TestUtils.mockClientCalls();
        await wait(() => {
            app = renderWithRedux(<PeopleMover/>);
        });

        done();
    });

    it('Should contains My Tags on initial load of People Mover', async () => {
        await app.findByText('My Tags');
        await app.findByTestId('myTagsIcon');
    });

    it('should display My Roles button on startup', async () => {
        await app.findByText('My Roles');
        await app.findByTestId('myRolesIcon');
    });

    it('should display Sort By dropdown on startup', async () => {
        await app.findByText('Sort By:');
        await app.findByText('Name');
    });

    it('should display Filter option on startup', async () => {
        await app.findByText('Filter:');
    });
});

describe('PeopleMover Routing', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should show 404 page when bad space name is provided',  async () => {
        BoardClient.getAllBoards = jest.fn(() => Promise.reject());

        const history = createMemoryHistory({ initialEntries: ['/somebadName'] });

        renderWithRedux(
            <Router history={history}>
                <PeopleMover/>
            </Router>
        );

        await wait(() => {
            expect(history.location.pathname).toEqual('/error/404');
        });
    });
});