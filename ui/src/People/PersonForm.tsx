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

import React, {ChangeEvent, useEffect, useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import '../Modal/Form.scss';
import RoleClient from '../Roles/RoleClient';
import PeopleClient from './PeopleClient';
import Creatable from 'react-select/creatable';
import {connect} from 'react-redux';
import {addPersonAction, closeModalAction, editPersonAction, setIsUnassignedDrawerOpenAction} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import {emptyPerson, Person} from './Person';
import {SpaceRole} from '../Roles/Role';
import {Product} from '../Products/Product';
import {
    CreateNewText,
    CustomControl,
    CustomIndicator,
    CustomOption,
    reactSelectStyles,
} from '../ReusableComponents/ReactSelectStyles';
import MultiSelect from '../ReusableComponents/MultiSelect';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import './PersonForm.scss';
import {Option} from '../CommonTypes/Option';
import {Assignment} from '../Assignments/Assignment';
import {RoleAddRequest} from '../Roles/RoleAddRequest';
import {JSX} from '@babel/types';
import {Dispatch} from 'redux';

interface PersonFormProps {
    editing: boolean;
    products: Array<Product>;
    initiallySelectedProduct?: Product;
    initialPersonName?: string;
    assignment?: Assignment;
    people: Array<Person>;

    closeModal(): void;

    addPerson(person: Person): void;

    editPerson(person: Person): void;

    setIsUnassignedDrawerOpen(isUnassignedDrawerOpen: boolean): void;
}

function PersonForm({
    editing,
    products,
    initiallySelectedProduct,
    initialPersonName,
    people,
    assignment,
    closeModal,
    addPerson,
    editPerson,
    setIsUnassignedDrawerOpen,
}: PersonFormProps): JSX.Element {
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isPersonNameInvalid, setIsPersonNameInvalid] = useState<boolean>(false);
    const [person, setPerson] = useState<Person>(emptyPerson());
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>([]);
    const [roles, setRoles] = useState<Array<SpaceRole>>([]);
    const [initialProducts, setInitialProducts] = useState<Array<Product>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [typedInRole, setTypedInRole] = useState<string>('');
    const [notesFieldLength, setNotesFieldLength] = useState<number>(person && person.notes ? person.notes.length : 0);

    function getSpaceObjectFromPersonName(name: string): number {
        const person: Person | undefined = people.find(x => x.name === name);
        return person!.spaceId;
    }

    useEffect(() => {
        async function setup() {
            const rolesResponse: AxiosResponse = await RoleClient.get();
            setRoles(rolesResponse.data);

            if (editing && assignment) {
                const personFromAssignment: Person = {
                    id: assignment.person.id,
                    name: assignment.person.name,
                    spaceRole: assignment.person.spaceRole,
                    notes: assignment.person.notes,
                    newPerson: assignment.person.newPerson,
                    spaceId: getSpaceObjectFromPersonName(assignment.person.name),
                };
                setPerson(personFromAssignment);
                const assignmentsResponse: AxiosResponse = await AssignmentClient.getAssignmentsUsingPersonId(assignment.person.id);
                const assignments: Array<Assignment> = assignmentsResponse.data;
                setInitialProducts(createProductsFromAssignments(assignments));
                setSelectedProducts(createProductsFromAssignments(assignments));
            } else {
                if (initialPersonName) {
                    setPerson((updatingPerson: Person) => ({...updatingPerson, name: initialPersonName}));
                }
            }
        }

        setup().then();
    }, []);

    function getUnassignedProduct(): Product {
        const unassignedProduct: Product | undefined = products.find((product: Product) => product.name === 'unassigned');
        return unassignedProduct!;
    }

    function createProductsFromAssignments(assignments: Array<Assignment>): Array<Product> {
        const allProductIdsFromAssignments = assignments.map(a => a.productId);
        return products.filter(p => allProductIdsFromAssignments.includes(p.id)).filter(product => product.id !== getUnassignedProduct().id);
    }

    function getSelectedProductsIdsOrUnassignedProductId() {
        return selectedProducts.length > 0 ? getProductIdsFromList(selectedProducts) : [getUnassignedProduct().id];
    }

    async function handleSubmit(): Promise<void> {
        if (person.name.trim() === '') {
            setIsPersonNameInvalid(true);
        } else {
            setIsPersonNameInvalid(false);
            if (selectedProducts.length === 0) {
                setIsUnassignedDrawerOpen(true);
            }
            if (editing) {
                const response = await PeopleClient.updatePerson(person);
                await AssignmentClient.updateAssignmentsUsingIds(
                    assignment!.person.id,
                    getProductIdsFromList(selectedProducts),
                    getProductIdsFromList(initialProducts)
                );
                const updatedPerson: Person = response.data;
                editPerson(updatedPerson);
            } else {
                const response = await PeopleClient.createPersonForSpace(person);
                const newPerson: Person = response.data;
                addPerson(newPerson);
                await AssignmentClient.createAssignmentsUsingIds(
                    newPerson.id,
                    getSelectedProductsIdsOrUnassignedProductId()
                );

            }
            closeModal();
        }
    }

    function getProductIdsFromList(productsList: Array<Product>): Array<number> {
        const selectedProductIds: Array<number> = [];
        productsList.map(product => selectedProductIds.push(product.id));
        return selectedProductIds;
    }

    function removePerson() {
        return PeopleClient.removePerson(assignment!.person.id).then(closeModal);
    }

    function getPersonFromListWithName(name: string): Person {
        const filteredPeople = people.find(x => x.name === name);
        return filteredPeople!;
    }

    function getItemFromListWithName(name: string, productsList: Array<Product>): Product {
        const product = productsList.find(x => x.name === name);
        return product!;
    }

    function changeProductName(events: Array<any>): void {
        const updatedProducts: Array<Product> = [];
        if (events) {
            events.forEach(ev => {
                if (ev.value !== 'unassigned') {
                    updatedProducts.push(getItemFromListWithName(ev.value, products));
                }
            });
        }
        setSelectedProducts(updatedProducts.filter(product => product != null));
    }

    function updatePersonField(fieldName: string, fieldValue: any): void {
        setPerson((updatingPerson: Person) => ({...updatingPerson, [fieldName]: fieldValue}));
    }

    function updateSpaceRole(input: string): void {
        const roleMatch: SpaceRole | undefined = roles.find((role: SpaceRole) => role.name === input);
        updatePersonField('spaceRole', roleMatch);
    }

    function changeName(event: ChangeEvent<HTMLInputElement>): void {
        const name = event.target.value;
        const otherPerson: Person = getPersonFromListWithName(name);
        if (otherPerson != null) {
            const updatedPerson: Person = {
                ...person,
                name,
                spaceRole: otherPerson.spaceRole,
                notes: otherPerson.notes,
            };
            setPerson(updatedPerson);
        } else {
            updatePersonField('name', name);
        }
    }

    function createOption(label: string): Option {
        return ({
            label,
            value: label,
        });
    }

    function handleCreateRole(inputValue: string): void {
        setIsLoading(true);
        const roleAddRequest: RoleAddRequest = {name: inputValue};
        RoleClient.add(roleAddRequest).then((response: AxiosResponse) => {
            const newRole: SpaceRole = response.data;
            setRoles(roles => [...roles, newRole]);
            updatePersonField('spaceRole', newRole);
            setIsLoading(false);
        });
    }

    function displayRemovePersonModal(): void {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: removePerson,
            close: () => {
                setConfirmDeleteModal(null);
            },
            warningMessage: 'Removing this person will remove all instances of them from your entire space.',
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    }

    const peopleList = people.map((person, index) => <option key={index} value={person.name}>
        👤 {person.name}</option>);

    function getColorFromLabel(label: string): string {
        const matchingRole = roles.find(role => role.name === label);
        if (matchingRole && matchingRole.color) {
            return matchingRole.color.color;
        }
        return '';
    }

    function notesChanged(e: React.ChangeEvent<HTMLTextAreaElement>): void {
        updatePersonField('notes', e.target.value);
        setNotesFieldLength(e.target.value.length);
    }

    function getSelectables(): Array<Product> {
        return products.filter(product => !product.archived && product.name !== 'unassigned');
    }

    return (
        <div className="formContainer">
            <datalist id="peopleList">
                {peopleList}
            </datalist>
            <form className="form" data-testid="personForm">
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        type="text"
                        name="name"
                        id="name"
                        list="peopleList"
                        value={person.name}
                        onChange={changeName}
                        autoComplete="off"
                        placeholder={'e.g. Jane Smith'}
                        autoFocus/>
                    {isPersonNameInvalid && <span className="personNameWarning">Please enter a person name.</span>}
                    <div className="isNewContainer">
                        <input className="checkbox"
                            id="isNew"
                            type="checkbox"
                            checked={person.newPerson}
                            onChange={(): void => {
                                updatePersonField('newPerson', !person.newPerson);
                            }}
                        />
                        <label className="formInputLabel" htmlFor="isNew">Mark as New</label>
                    </div>
                </div>

                <div className="formItem">
                    <label className="formItemLabel" htmlFor="role">Role</label>
                    <Creatable
                        isClearable
                        name="role"
                        inputId="role"
                        onInputChange={(e: string): void => setTypedInRole(e)}
                        onChange={(e): void => updateSpaceRole(e ? (e as Option).value : '')}
                        isLoading={isLoading}
                        isDisabled={isLoading}
                        onCreateOption={handleCreateRole}
                        options={roles.map(role => createOption(role.name))}
                        styles={reactSelectStyles}
                        value={person.spaceRole && person.spaceRole.name !== '' ? createOption(person.spaceRole.name) : null}
                        components={{Option: CustomOption, DropdownIndicator: CustomIndicator, Control: CustomControl}}
                        formatCreateLabel={(): JSX.Element => CreateNewText(`Create "${typedInRole}"`)}
                        placeholder="Select or create a role"
                        hideSelectedOptions={true}
                        {...{getColorFromLabel}}
                    />
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="product">Assign to</label>
                    <MultiSelect
                        name={'product'}
                        initiallySelected={selectedProducts}
                        selectables={getSelectables()}
                        placeholder={'unassigned'}
                        changeSelections={changeProductName}
                        disabled={false}
                    />
                </div>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="notes">Notes</label>
                    <textarea className="formInput formTextInput notes"
                        id="notes"
                        name="notes"
                        value={person.notes ? person.notes : ''}
                        onChange={notesChanged}
                        rows={4}
                        cols={25}>
                        {person.notes}
                    </textarea>
                    <span className="notesFieldText" data-testid="notesFieldText">
                        <span
                            className={notesFieldLength > 500 ? 'notesFieldTooLong' : ''}>
                            {notesFieldLength}</span>
                        &nbsp;(500 characters max)
                    </span>
                </div>
                <div className="yesNoButtons">
                    <button className="formButton cancelFormButton" onClick={closeModal}>Cancel</button>
                    <input className="formButton"
                        onClick={handleSubmit}
                        type="button"
                        disabled={notesFieldLength > 500}
                        value={editing ? 'Save' : 'Create'}/>
                </div>
                {editing && (<div className={'deleteButtonContainer alignSelfCenter deleteLinkColor'}>
                    <i className="fas fa-trash"/>
                    <div className="trashCanSpacer"/>
                    <a className="obliterateLink" onClick={displayRemovePersonModal}>Delete</a>
                </div>)}
            </form>
            {confirmDeleteModal}
        </div>
    );
}

const mapStateToProps = ({people}: GlobalStateProps) => ({
    people,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    addPerson: (person: Person) => dispatch(addPersonAction(person)),
    editPerson: (person: Person) => dispatch(editPersonAction(person)),
    setIsUnassignedDrawerOpen: (open: boolean) => dispatch(setIsUnassignedDrawerOpenAction(open)),
});

export default connect(mapStateToProps, mapDispatchToProps)(PersonForm);