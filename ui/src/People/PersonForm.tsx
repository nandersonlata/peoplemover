/*
 * Copyright (c) 2021 Ford Motor Company
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

import React, {FormEvent, useState} from 'react';
import AssignmentClient from '../Assignments/AssignmentClient';
import RoleClient from '../Roles/RoleClient';
import PeopleClient from './PeopleClient';
import {connect} from 'react-redux';
import {
    addPersonAction,
    closeModalAction,
    editPersonAction,
    setAllGroupedTagFilterOptionsAction,
    setIsUnassignedDrawerOpenAction,
} from '../Redux/Actions';
import {GlobalStateProps} from '../Redux/Reducers';
import {AxiosResponse} from 'axios';
import {emptyPerson, Person} from './Person';
import {RoleTag} from '../Roles/RoleTag.interface';
import {Product} from '../Products/Product';
import SelectWithNoCreateOption, {MetadataMultiSelectProps} from '../ModalFormComponents/SelectWithNoCreateOption';
import ConfirmationModal, {ConfirmationModalProps} from '../Modal/ConfirmationModal';
import {Option} from '../CommonTypes/Option';
import {Assignment} from '../Assignments/Assignment';
import {RoleAddRequest} from '../Roles/RoleAddRequest.interface';
import {JSX} from '@babel/types';
import {Dispatch} from 'redux';
import {ProductPlaceholderPair} from '../Assignments/CreateAssignmentRequest';
import {Space} from '../Space/Space';
import moment from 'moment';
import FormNotesTextArea from '../ModalFormComponents/FormNotesTextArea';
import FormButton from '../ModalFormComponents/FormButton';
import {useOnLoad} from '../ReusableComponents/UseOnLoad';
import SelectWithCreateOption, {MetadataReactSelectProps} from '../ModalFormComponents/SelectWithCreateOption';
import './PersonForm.scss';
import FormTagsField from '../ReusableComponents/FormTagsField';
import {TagInterface} from '../Tags/Tag.interface';
import PersonTagClient from '../Tags/PersonTag/PersonTagClient';
import {Tag} from '../Tags/Tag';
import {
    addGroupedTagFilterOptions,
    AllGroupedTagFilterOptions,
    FilterTypeListings,
} from '../SortingAndFiltering/FilterLibraries';
import NewBadge from '../ReusableComponents/NewBadge';
import ToolTip from '../ReusableComponents/ToolTip';
// import MatomoEvents from '../Matomo/MatomoEvents';

interface AssignmentHistory {
    productName: string;
    id: number;
    effectiveDate: Date | undefined;
}

type AssignmentHistoryType = AssignmentHistory | undefined;

interface PersonFormProps {
    isEditPersonForm: boolean;
    products: Array<Product>;
    initiallySelectedProduct?: Product;
    initialPersonName?: string;
    personEdited?: Person;
    currentSpace: Space;
    viewingDate: Date;
    allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>;
    currentUser: string;

    closeModal(): void;
    addPerson(person: Person): void;
    editPerson(person: Person): void;
    setIsUnassignedDrawerOpen(isUnassignedDrawerOpen: boolean): void;
    setAllGroupedTagFilterOptions(groupedTagFilterOptions: Array<AllGroupedTagFilterOptions>): void;
}

function PersonForm({
    isEditPersonForm,
    products,
    initiallySelectedProduct,
    initialPersonName,
    currentSpace,
    viewingDate,
    personEdited,
    closeModal,
    addPerson,
    editPerson,
    setIsUnassignedDrawerOpen,
    allGroupedTagFilterOptions,
    setAllGroupedTagFilterOptions,
    currentUser,
}: PersonFormProps): JSX.Element {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const spaceUuid = currentSpace.uuid!;
    const { ROLE_TAGS } = MetadataReactSelectProps;
    const { PERSON_ASSIGN_TO } = MetadataMultiSelectProps;
    const [confirmDeleteModal, setConfirmDeleteModal] = useState<JSX.Element | null>(null);
    const [isPersonNameInvalid, setIsPersonNameInvalid] = useState<boolean>(false);
    const [person, setPerson] = useState<Person>(emptyPerson());
    const [selectedProducts, setSelectedProducts] = useState<Array<Product>>([]);
    const [selectedPersonTags, setSelectedPersonTags] = useState<Array<Tag>>([]);
    const [roles, setRoles] = useState<Array<RoleTag>>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [hasAssignmentChanged, setHasAssignmentChanged] = useState<boolean>(false);

    const alphabetize = (roles: Array<RoleTag | Product>): Array<RoleTag | Product> => {
        return roles.sort((a, b) => {
            if (a.name.toLowerCase() < b.name.toLowerCase()) return -1;
            if (a.name.toLowerCase() > b.name.toLowerCase()) return 1;
            return 0;
        });
    };

    const populatedEntirePersonForm = (personToPopulate: Person): void => {
        setPerson({...personToPopulate});
        setSelectedPersonTags(personToPopulate.tags);

        AssignmentClient.getAssignmentsUsingPersonIdAndDate(spaceUuid, personToPopulate.id, viewingDate)
            .then((response) => {
                const assignments: Array<Assignment> = response.data;
                setSelectedProducts(createProductsFromAssignments(assignments));
            });
    };

    useOnLoad(() => {
        RoleClient.get(spaceUuid)
            .then((response) => {
                setRoles(alphabetize(response.data));
            });

        if (isEditPersonForm && personEdited) {
            populatedEntirePersonForm(personEdited);
        } else {
            if (initialPersonName) {
                setPerson(
                    (updatingPerson: Person) => ({...updatingPerson, name: initialPersonName})
                );
            }

            if (initiallySelectedProduct) setSelectedProducts([initiallySelectedProduct]);
        }
    });

    const getUnassignedProductId = (): number => {
        const unassignedProduct: Product | undefined = products.find((product: Product) => product.name === 'unassigned');
        if (unassignedProduct && unassignedProduct.id) return unassignedProduct.id;
        return -1;
    };

    const createProductsFromAssignments = (assignments: Array<Assignment>): Array<Product> => {
        const allProductIdsFromAssignments = assignments.map(a => a.productId);
        return products.filter(p => allProductIdsFromAssignments.includes(p.id)).filter(product => product.id !== getUnassignedProductId());
    };

    const getSelectedProductPairs = (): ProductPlaceholderPair[] => {
        return selectedProducts.map((product) => {
            const placeholderForProduct = product.assignments.find(
                (assignmentForProduct) => assignmentForProduct.person.id === person.id
            )?.placeholder;
            return {
                productId: product.id,
                placeholder: placeholderForProduct || false,
            } as ProductPlaceholderPair;
        });

    };

    const getAddedPersonTag = (): string[] => {
        let result: string[] = [];
        if (person.tags !== selectedPersonTags) {
            result = selectedPersonTags.filter(tag => {
                return !person.tags.includes(tag);
            }).map(tag => {
                return tag.name;
            });
        }
        return result;
    };

    const handleSubmit = async (event: FormEvent): Promise<void> => {
        event.preventDefault();

        if (person.name.trim() === '') {
            setIsPersonNameInvalid(true);
        } else {
            setIsPersonNameInvalid(false);

            let personTagModified = getAddedPersonTag();
            person.tags = selectedPersonTags;

            if (selectedProducts.length === 0) {
                setIsUnassignedDrawerOpen(true);
            }
            if (isEditPersonForm) {
                const response = await PeopleClient.updatePerson(currentSpace, person, personTagModified);
                const updatedPerson: Person = response.data;
                editPerson(updatedPerson);
                if (hasAssignmentChanged) {
                    await AssignmentClient.createAssignmentForDate(
                        moment(viewingDate).format('YYYY-MM-DD'),
                        getSelectedProductPairs(),
                        currentSpace,
                        updatedPerson
                    );
                }

            } else {
                const response = await PeopleClient.createPersonForSpace(currentSpace, person, personTagModified);
                const newPerson: Person = response.data;
                addPerson(newPerson);
                await AssignmentClient.createAssignmentForDate(
                    moment(viewingDate).format('YYYY-MM-DD'),
                    getSelectedProductPairs(),
                    currentSpace,
                    newPerson
                );
            }
            closeModal();
        }
    };

    const removePerson = (): void => {
        const assignmentId = personEdited && personEdited.id;
        if (assignmentId) {
            PeopleClient.removePerson(spaceUuid, assignmentId).then(closeModal);
        }
    };

    const getItemFromListWithName = (name: string, productsList: Array<Product>): Product | null => {
        const product = productsList.find(x => x.name === name);
        return product || null;
    };

    const changeProductName = (events: Array<{ value: string }>): void => {
        const updatedProducts: Array<Product> = [];
        (events || []).forEach(ev => {
            if (ev.value !== 'unassigned') {
                const product = getItemFromListWithName(ev.value, products);
                if (product) updatedProducts.push(product);
            }
        });
        setHasAssignmentChanged(true);
        setSelectedProducts(updatedProducts.filter(product => product != null));
    };

    const updatePersonField = (fieldName: string, fieldValue: string | boolean | RoleTag | undefined): void => {
        setPerson((updatingPerson: Person) => ({...updatingPerson, [fieldName]: fieldValue}));
    };

    const updateSpaceRole = (input: string): void => {
        const roleMatch: RoleTag | undefined = roles.find((role: RoleTag) => role.name === input);
        updatePersonField('spaceRole', roleMatch);
    };

    const createOption = (role: RoleTag): Option => {
        return ({
            label: role.name,
            value: role.name,
            color: role.color?.color,
        });
    };

    const handleCreateRole = (inputValue: string): void => {
        setIsLoading(true);
        const roleAddRequest: RoleAddRequest = {name: inputValue};
        RoleClient.add(roleAddRequest, currentSpace).then((response: AxiosResponse) => {
            const newRole: RoleTag = response.data;
            setRoles(roles => alphabetize([...roles, newRole]));
            updatePersonField('spaceRole', newRole);
            setIsLoading(false);
        });
    };

    const displayRemovePersonModal = (): void => {
        const propsForDeleteConfirmationModal: ConfirmationModalProps = {
            submit: removePerson,
            close: () => {
                setConfirmDeleteModal(null);
            },
            content: <div>Removing this person will remove all instances of them from your entire space.</div>,
        };
        const deleteConfirmationModal: JSX.Element = ConfirmationModal(propsForDeleteConfirmationModal);
        setConfirmDeleteModal(deleteConfirmationModal);
    };

    const getAssignToOptions = (): Array<Option> => {
        const filteredProducts: Array<Product> = products
            .filter(product => !product.archived && product.name !== 'unassigned');
        alphabetize(filteredProducts);
        return filteredProducts.map(selectable => {return {value: selectable.name, label: selectable.name};});
    };

    const toolTipContent = (): JSX.Element => {
        return <span className="toolTipContent">Create tags based on your people. Example, skills, education, employee status, etc. Anything on which you would like to filter.</span>;
    };

    // const getAssignmentHistory = (): AssignmentHistoryType[] => {
    //     const returnValue = products.map((product) => {
    //         const personsAssignment = product.assignments.find(
    //             (assignment) => assignment.person.id === person.id
    //         );
    //         if (personsAssignment) {
    //             return {
    //                 productName: product.name,
    //                 id: personsAssignment.id,
    //                 effectiveDate: personsAssignment.effectiveDate,
    //             };
    //         } else {
    //             return undefined;
    //         }
    //     }).filter((assignmentHistory) => (assignmentHistory !== undefined));
    //     return returnValue;
    // };
    //
    // const capitalize = (s: string): string => {
    //     return s.charAt(0).toUpperCase() + s.slice(1);
    // };
    //
    // const getAssignmentHistoryContent = (): JSX.Element => {
    //     const assignmentHistories = getAssignmentHistory();
    //     return (
    //         <>
    //             {assignmentHistories.map(
    //                 assignmentHistory => {
    //                     if (assignmentHistory) {
    //                         let productName = assignmentHistory.productName;
    //                         if (productName === 'unassigned') {
    //                             productName = capitalize(productName);
    //                         }
    //                         let effectiveDate = (assignmentHistory.effectiveDate ? moment(assignmentHistory.effectiveDate).format('MM/DD/YYYY') : 'undefined date');
    //                         return (
    //                             <div key={assignmentHistory.id}>Moved to {productName} on {effectiveDate}</div>
    //                         );
    //                     } else {
    //                         return (
    //                             <div>No Assignment History</div>
    //                         );
    //                     }
    //                 }
    //             )}
    //         </>
    //     );
    // };
    //
    // const fireMatomoHoverEvent = (): void =>  {
    //     MatomoEvents.pushEvent(currentSpace.name, 'assignmentHistoryClick', currentUser);
    // };

    return (
        <div className="formContainer">
            <form className="form"
                data-testid="personForm"
                onSubmit={(event): Promise<void> => handleSubmit(event)}>
                <div className="formItem">
                    <label className="formItemLabel" htmlFor="name">Name</label>
                    <input className="formInput formTextInput"
                        data-testid="personFormNameField"
                        type="text"
                        name="name"
                        id="name"
                        value={person.name}
                        onChange={(event): void => {
                            updatePersonField('name', event.target.value);
                        }}
                        autoComplete="off"
                        placeholder="e.g. Jane Smith"
                    />
                    {isPersonNameInvalid && <span className="personNameWarning">Please enter a person name.</span>}
                    <div className="isNewContainer">
                        <input className="checkbox"
                            data-testid="personFormIsNewCheckbox"
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
                    <label className="formItemLabel" htmlFor="cdsid">CDSID</label>
                    <input className="formInput formTextInput"
                        data-testid="personFormCustomField1"
                        type="text"
                        name="cdsid"
                        id="cdsid"
                        value={person.customField1}
                        onChange={(event): void => {
                            updatePersonField('customField1', event.target.value);
                        }}
                        autoComplete="off"
                        placeholder="e.g. jsmith12"
                    />
                </div>
                <SelectWithCreateOption
                    metadata={ROLE_TAGS}
                    useColorBadge
                    value={person.spaceRole && person.spaceRole.name !== '' ? createOption(person.spaceRole) : undefined}
                    options={roles.map(role => createOption(role))}
                    onChange={(e): void => updateSpaceRole(e ? (e as Option).value : '')}
                    onSave={handleCreateRole}
                    isLoading={isLoading}
                />
                <SelectWithNoCreateOption
                    metadata={PERSON_ASSIGN_TO}
                    values={selectedProducts.map(x => {return {value:x.name, label:x.name};})}
                    options={getAssignToOptions()}
                    onChange={changeProductName}
                />
                {/*{isEditPersonForm && <div className="assignmentHistoryContainer">*/}
                {/*    <ToolTip toolTipLabel="View Assignment History" contentElement={getAssignmentHistoryContent()} onHover={fireMatomoHoverEvent}/>*/}
                {/*</div>}*/}
                <div className="newBadgeContainer">
                    <NewBadge/>
                </div>
                <FormTagsField
                    tagsMetadata={MetadataReactSelectProps.PERSON_TAGS}
                    tagClient={PersonTagClient}
                    currentTagsState={{currentTags: person.tags}}
                    selectedTagsState={{selectedTags: selectedPersonTags, setSelectedTags: setSelectedPersonTags}}
                    loadingState={{isLoading, setIsLoading}}
                    addGroupedTagFilterOptions={(trait: TagInterface): void => {addGroupedTagFilterOptions(FilterTypeListings.PersonTag.index, trait, allGroupedTagFilterOptions, setAllGroupedTagFilterOptions);}}
                    toolTip={<ToolTip toolTipLabel="What's this?" contentElement={toolTipContent()}/>}
                />
                <div className="formItem">
                    <FormNotesTextArea
                        notes={person.notes}
                        callBack={(notes): void => {
                            updatePersonField('notes', notes);
                        }}
                    />
                </div>
                <div className="yesNoButtons">
                    <FormButton
                        buttonStyle="secondary"
                        onClick={closeModal}>
                        Cancel
                    </FormButton>
                    <FormButton
                        testId="personFormSubmitButton"
                        buttonStyle="primary"
                        type="submit">
                        {isEditPersonForm ? 'Save' : 'Add'}
                    </FormButton>
                </div>
            </form>

            {isEditPersonForm && (
                <button className="deleteButtonContainer alignSelfCenter deleteLinkColor"
                    data-testid="deletePersonButton"
                    onClick={displayRemovePersonModal}
                >
                    <i className="material-icons" aria-hidden>delete</i>
                    <div className="trashCanSpacer"/>
                    <span className="obliterateLink">
                            Delete
                    </span>
                </button>
            )}
            {confirmDeleteModal}
        </div>
    );
}

/* eslint-disable */
const mapStateToProps = (state: GlobalStateProps) => ({
    currentSpace: state.currentSpace,
    viewingDate: state.viewingDate,
    allGroupedTagFilterOptions: state.allGroupedTagFilterOptions,
    currentUser: state.currentUser,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
    addPerson: (person: Person) => dispatch(addPersonAction(person)),
    editPerson: (person: Person) => dispatch(editPersonAction(person)),
    setIsUnassignedDrawerOpen: (open: boolean) => dispatch(setIsUnassignedDrawerOpenAction(open)),
    setAllGroupedTagFilterOptions: (allGroupedTagFilterOptions: Array<AllGroupedTagFilterOptions>) =>
        dispatch(setAllGroupedTagFilterOptionsAction(allGroupedTagFilterOptions)),

});

export default connect(mapStateToProps, mapDispatchToProps)(PersonForm);
/* eslint-enable */
