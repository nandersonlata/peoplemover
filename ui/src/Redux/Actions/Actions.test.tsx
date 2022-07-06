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

import {AvailableActions, setupSpaceAction} from './index';
import configureStore, {MockStoreCreator, MockStoreEnhanced} from 'redux-mock-store';
import TestData from '../../Utils/TestData';
import thunk from 'redux-thunk';
import * as filterConstants from '../../SortingAndFiltering/FilterLibraries';

describe('Actions', () => {
    let mockStore: MockStoreCreator<unknown, {}>;
    let store: MockStoreEnhanced<unknown, {}>;

    beforeEach(() => {
        mockStore = configureStore([thunk]);
        store = mockStore({
            currentSpace: TestData.space,
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('setupSpaceAction', () => {
        it('should update the current space and filters', () => {
            const mock = jest.spyOn(filterConstants, 'getFilterOptionsForSpace');
            mock.mockResolvedValueOnce(TestData.allGroupedTagFilterOptions);

            const expectedActions = [
                {type: AvailableActions.SET_CURRENT_SPACE, space: TestData.space },
                {type: AvailableActions.SET_ALL_FILTER_OPTIONS, allGroupedTagFilterOptions: TestData.allGroupedTagFilterOptions},
            ];

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return store.dispatch<any>(setupSpaceAction(TestData.space)).then(() => {
                expect(store.getActions()).toEqual(expectedActions);
            });
        });
    });
});