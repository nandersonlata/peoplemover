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

import {AvailableActions} from '../Actions';
import {Board} from '../../Boards/Board';

const boardsReducer = (state: Array<Board> = [], action: {type: AvailableActions; boards: Array<Board>} ): Array<Board> => {
    if (action.type === AvailableActions.SET_BOARDS) {
        return [...action.boards];
    } else {
        return state;
    }
};

export default boardsReducer;