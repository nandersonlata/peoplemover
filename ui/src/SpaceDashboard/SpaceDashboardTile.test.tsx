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

import {fireEvent, waitFor} from '@testing-library/dom';
import {screen} from '@testing-library/react';
import {renderWithRedux} from '../Utils/TestUtils';
import TestData from '../Utils/TestData';
import React from 'react';
import SpaceDashboardTile from './SpaceDashboardTile';
import {createStore, Store} from 'redux';
import rootReducer from '../Redux/Reducers';
import SpaceClient from '../Space/SpaceClient';
import {UserSpaceMapping} from '../Space/UserSpaceMapping';
import {RecoilRoot} from 'recoil';
import {CurrentUserState} from '../State/CurrentUserState';
import {ModalContents, ModalContentsState} from '../State/ModalContentsState';
import {RecoilObserver} from '../Utils/RecoilObserver';
import SpaceForm from './SpaceForm';
import DeleteSpaceForm from './DeleteSpaceForm';
import TransferOwnershipForm from './TransferOwnershipForm';

let modalContent: ModalContents | null;

describe('SpaceDashboardTile tests', () => {
    let onClick: () => void;
    let store: import('redux').Store<import('redux').AnyAction>;

    beforeEach(async () => {
        modalContent = null;

        jest.clearAllMocks();
        SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
            [
                {id: '1', userId: 'USER_ID', permission: 'owner', spaceUuid: TestData.space.uuid!} as UserSpaceMapping,
                {id: '2', userId: 'USER_IDDQD', permission: 'editor', spaceUuid: TestData.space.uuid!} as UserSpaceMapping
            ]
        );
        store = createStore(rootReducer, {});
        onClick = jest.fn();
    });

    it('should open space on click', async () => {
        await renderSpaceDashboardList(store, onClick);
        const spaceTile = await screen.findByTestId('spaceDashboardTile');
        fireEvent.click(spaceTile);
        expect(onClick).toBeCalled();
    });

    it('should open edit space modal on click', async () => {
        await renderSpaceDashboardList(store, onClick);
        const editSpaceEllipsis = await screen.findByTestId('ellipsisButton');
        fireEvent.click(editSpaceEllipsis);

        const editSpaceTile = await screen.findByText('Edit');
        fireEvent.click(editSpaceTile);
        
        expect(modalContent).toEqual({
            title: 'Edit Space',
            component: <SpaceForm space={TestData.space}/>
        });
    });

    describe('deleting a space', () => {
        it('should not show Delete Space menu item if user is not owner of the space', async () => {
            SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
                [{id: '1', userId: 'USER_ID', permission: 'editor', spaceUuid: TestData.space.uuid!} as UserSpaceMapping]
            );
            await renderSpaceDashboardList(store, onClick);

            const spaceEllipsis = await screen.findByTestId('ellipsisButton');
            fireEvent.click(spaceEllipsis);
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestData.space.uuid);
            expect(screen.queryByText('Delete Space')).not.toBeInTheDocument();
        });

        describe('should show the delete space modal on click', () => {
            it('with space having editor', async () => {
                await renderSpaceDashboardList(store, onClick);
                const spaceEllipsis = await screen.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
                const leaveSpaceTile = await screen.findByText('Delete Space');
                fireEvent.click(leaveSpaceTile);

                expect(modalContent).toEqual({
                    title: "Are you sure?",
                    component: <DeleteSpaceForm space={TestData.space} spaceHasEditors={true}/>
                });
            });

            it('with space NOT having editor', async () => {
                SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
                    [{id: '1', userId: 'USER_ID', permission: 'owner', spaceUuid: TestData.space.uuid!} as UserSpaceMapping]
                );
                await renderSpaceDashboardList(store, onClick);
                const spaceEllipsis = await screen.findByTestId('ellipsisButton');
                fireEvent.click(spaceEllipsis);
                const leaveSpaceTile = await screen.findByText('Delete Space');
                fireEvent.click(leaveSpaceTile);

                expect(modalContent).toEqual({
                    title: "Are you sure?",
                    component: <DeleteSpaceForm space={TestData.space} spaceHasEditors={false}/>
                });
            });
        });
    });

    describe('Leaving a space', () => {
        it('should not show Leave Space menu item if user is not owner of the space', async () => {
            SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
                [{id: '1', userId: 'USER_ID', permission: 'editor', spaceUuid: TestData.space.uuid!} as UserSpaceMapping]
            );
            await renderSpaceDashboardList(store, onClick)

            const spaceEllipsis = await screen.findByTestId('ellipsisButton');
            fireEvent.click(spaceEllipsis);
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestData.space.uuid);
            expect(screen.queryByText('Leave Space')).not.toBeInTheDocument();
        });

        it('should not show Leave Space menu item if space has no editors', async () => {
            SpaceClient.getUsersForSpace = jest.fn().mockResolvedValue(
                [{id: '1', userId: 'USER_ID', permission: 'owner', spaceUuid: TestData.space.uuid!} as UserSpaceMapping]
            );
            await renderSpaceDashboardList(store, onClick);

            const spaceEllipsis = await screen.findByTestId('ellipsisButton');
            fireEvent.click(spaceEllipsis);
            expect(SpaceClient.getUsersForSpace).toHaveBeenCalledWith(TestData.space.uuid);
            expect(screen.queryByText('Leave Space')).not.toBeInTheDocument();
        });

        it('should open leave space modal on click', async () => {
            await renderSpaceDashboardList(store, onClick);
            const spaceEllipsis = await screen.findByTestId('ellipsisButton');
            fireEvent.click(spaceEllipsis);
            const leaveSpaceTile = await screen.findByText('Leave Space');
            fireEvent.click(leaveSpaceTile);

            expect(modalContent).toEqual({
                title: 'Transfer Ownership of Space',
                component: <TransferOwnershipForm space={TestData.space}/>
            });
        });
    });

    it('should focus the first dropdown option when opened', async () => {
        await renderSpaceDashboardList(store, onClick);
        const spaceTileDropdownButton = await screen.findByTestId('ellipsisButton');
        spaceTileDropdownButton.click();
        await waitFor(() => expect(screen.getByTestId('editSpace')).toHaveFocus());
    });
});

async function renderSpaceDashboardList(store: Store, onClick: () => void) {
    const result = renderWithRedux(
        <RecoilRoot initializeState={({set}) => {
            set(CurrentUserState, 'USER_ID')
        }}>
            <RecoilObserver
                recoilState={ModalContentsState}
                onChange={(value: ModalContents) => {
                    modalContent = value;
                }}
            />
            <SpaceDashboardTile space={TestData.space} onClick={onClick}/>
        </RecoilRoot>,
        store
    );

    await waitFor(() => expect(SpaceClient.getUsersForSpace).toHaveBeenCalled())
    return result;
}