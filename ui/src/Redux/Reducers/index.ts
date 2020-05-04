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

import {combineReducers} from 'redux';
import currentModalReducer, {CurrentModalState} from './currentModalReducer';
import peopleReducer from './peopleReducer';
import {currentBoardReducer} from './currentBoardReducer';
import isUnassignedDrawerOpenReducer from './isUnassignedDrawerOpenReducer';
import boardsReducer from './boardsReducer';
import {Board} from '../../Boards/Board';
import {Person} from '../../People/Person';
import {EditMenuToOpen} from '../../ReusableComponents/EditMenuToOpen';
import productRefsReducer from './productRefsReducer';
import {ProductCardRefAndProductPair} from '../../Products/ProductDnDHelper';
import sortProductsReducer from './sortProductsReducer';
import {AllGroupedTagFilterOptions} from '../../ReusableComponents/ProductFilter';
import {unmodifiedInitialBoardsReducer} from './unmodifiedIntialBoardsReducer';
import allGroupedTagFilterOptionsReducer from './allGroupedTagOptionsReducer';

export default combineReducers({
    currentModal: currentModalReducer,
    people: peopleReducer,
    isUnassignedDrawerOpen: isUnassignedDrawerOpenReducer,
    currentBoard: currentBoardReducer,
    boards: boardsReducer,
    unmodifiedInitialBoards: unmodifiedInitialBoardsReducer,
    productRefs: productRefsReducer,
    sortValueOption: sortProductsReducer,
    allGroupedTagFilterOptions: allGroupedTagFilterOptionsReducer,
});

export interface GlobalStateProps {
    currentModal: CurrentModalState;
    people: Array<Person>;
    isUnassignedDrawerOpen: boolean;
    currentBoard: Board;
    boards: Array<Board>;
    unmodifiedInitialBoards: Array<Board>;
    whichEditMenuOpen: EditMenuToOpen;
    productRefs: Array<ProductCardRefAndProductPair>;
    sortValueOption: string;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
}