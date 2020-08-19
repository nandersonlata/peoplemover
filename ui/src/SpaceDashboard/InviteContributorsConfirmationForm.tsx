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
import './InviteContributorsConfirmationModal.scss';
import {Dispatch} from 'redux';
import {closeModalAction} from '../Redux/Actions';
import {connect} from 'react-redux';

interface Props {
    closeModal(): void;
}

const InviteContributorConfirmationForm = ({ closeModal }: Props): JSX.Element => {
    const linkToSpace: string = window ? window.location.href : '';

    const copyLink = async (): Promise<void> => {
        await navigator.clipboard.writeText(linkToSpace);
    };

    return (
        <div className="inviteContributorsConfirmationContainer">
            <div className="inviteContributorsConfirmationLabel">
                Share this link with your collaborators.
            </div>
            <div className="inviteContributorsConfirmationShareLinkContainer">
                <div className="inviteContributorsConfirmationLink">
                    {linkToSpace}
                </div>
                <div className="inviteContributorsConfirmationCopyButton" onClick={copyLink}>
                    Copy link
                </div>
            </div>
            <button className="inviteContributorsConfirmationDoneButton"
                onClick={closeModal}>
                Done
            </button>
        </div>
    );
};

const mapDispatchToProps = (dispatch: Dispatch) => ({
    closeModal: () => dispatch(closeModalAction()),
});

export default connect(null, mapDispatchToProps)(InviteContributorConfirmationForm);