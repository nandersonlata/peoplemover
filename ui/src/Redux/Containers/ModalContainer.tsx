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

import {connect} from 'react-redux';
import {AvailableModals, closeModalAction} from '../Actions';
import Modal from '../../Modal/Modal';
import CreateBoardForm from '../../Boards/CreateBoardForm';
import React from 'react';
import EditBoardForm from '../../Boards/EditBoardForm';
import ProductForm from '../../Products/ProductForm';
import PersonForm from '../../People/PersonForm';
import AssignmentForm from '../../Assignments/AssignmentForm';
import AssignmentExistsWarning from '../../Assignments/AssignmentExistsWarning';
import {GlobalStateProps} from '../Reducers';
import {Board} from '../../Boards/Board';
import {CurrentModalState} from '../Reducers/currentModalReducer';
import MyTagsModal from '../../Tags/MyTagsModal';
import MyRolesModal from '../../Roles/MyRolesModal';
import CreateSpaceForm from '../../SpaceDashboard/CreateSpaceForm';
import {Dispatch} from 'redux';
import EditContributorsForm from "../../SpaceDashboard/EditContributorsForm";


const getCurrentModal = (currentModal: CurrentModalState, currentBoard: Board, allBoards: Array<Board>): JSX.Element | null => {
    const products = currentBoard ? currentBoard.products : [];
    const boards = allBoards ? allBoards : [];
    const {modal, item} = currentModal;

    switch (modal) {
    case AvailableModals.CREATE_BOARD:
        return <CreateBoardForm boards={boards}/>;
    case AvailableModals.EDIT_BOARD:
        return <EditBoardForm boardId={item.id}
            boardName={item.name}
            isTheOnlyBoard={boards.length < 2}/>;
    case AvailableModals.CREATE_PRODUCT:
        return <ProductForm editing={false}
            boardId={currentBoard!.id}
            spaceId={currentBoard!.spaceId} />;
    case AvailableModals.EDIT_PRODUCT:
        return <ProductForm editing={true}
            product={item}
            spaceId={currentBoard!.spaceId}/>;
    case AvailableModals.CREATE_PERSON:
        return <PersonForm editing={false}
            products={products}
            initiallySelectedProduct={item ? item.initiallySelectedProduct : undefined}
            initialPersonName={item ? item.initialPersonName : ''}/>;
    case AvailableModals.EDIT_PERSON:
        return <PersonForm editing={true}
            assignment={item}
            products={products}/>;
    case AvailableModals.CREATE_ASSIGNMENT:
        return <AssignmentForm
            products={products}
            initiallySelectedProduct={item}/>;
    case AvailableModals.ASSIGNMENT_EXISTS_WARNING:
        return <AssignmentExistsWarning/>;
    case AvailableModals.MY_TAGS:
        return <MyTagsModal/>;
    case AvailableModals.MY_ROLES_MODAL:
        return <MyRolesModal/>;
    case AvailableModals.CREATE_SPACE:
        return <CreateSpaceForm onSubmit={item}/>;
    case AvailableModals.EDIT_CONTRIBUTORS:
        return <EditContributorsForm/>;
    default:
        return null;
    }
};

const getCurrentTitle = (currentModal: CurrentModalState): string => {
    const {modal} = currentModal;

    switch (modal) {
    case AvailableModals.CREATE_BOARD:
        return 'Create New Board';
    case AvailableModals.EDIT_BOARD:
        return 'Edit Board';
    case AvailableModals.CREATE_PRODUCT:
        return 'Create New Product';
    case AvailableModals.EDIT_PRODUCT:
        return 'Edit Product';
    case AvailableModals.CREATE_PERSON:
        return 'Create New Person';
    case AvailableModals.EDIT_PERSON:
        return 'Edit Person';
    case AvailableModals.CREATE_ASSIGNMENT:
        return 'Assign a Person';
    case AvailableModals.ASSIGNMENT_EXISTS_WARNING:
        return 'Uh-oh';
    case AvailableModals.MY_TAGS:
        return 'My Tags';
    case AvailableModals.MY_ROLES_MODAL:
        return 'My Roles';
    case AvailableModals.CREATE_SPACE:
        return 'Create New Space';
    case AvailableModals.EDIT_CONTRIBUTORS:
        return 'Edit Contributors';
    default:
        return '';
    }
};

const mapStateToProps = ({currentModal, currentBoard, boards}: GlobalStateProps) => ({
    modalForm: getCurrentModal(currentModal, currentBoard, boards),
    title: getCurrentTitle(currentModal),
});

const mapDispatchToProps = (dispatch:  Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(Modal);