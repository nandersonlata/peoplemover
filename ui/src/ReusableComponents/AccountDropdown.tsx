import React, { useState } from "react";
import './AccountDropdown.scss';
import {Dispatch} from "redux";
import {CurrentModalState} from "../Redux/Reducers/currentModalReducer";
import {AvailableModals, setCurrentModalAction} from "../Redux/Actions";
import {connect} from "react-redux";
import Cookies from "universal-cookie";
import {Redirect} from "react-router-dom";

interface AccountDropdownProps {
    setCurrentModal(modalState: CurrentModalState): void;
}

function AccountDropdown({setCurrentModal}: AccountDropdownProps): JSX.Element {

    const [dropdownFlag, setDropdownFlag] = useState<boolean>(false);
    const [redirect, setRedirect] = useState<JSX.Element>();

    function showsDropdown(): boolean {
        setDropdownFlag(!dropdownFlag);
        return dropdownFlag;
    }

    function clearAccessTokenCookie(){
        const cookie = new Cookies();
        cookie.remove('accessToken', {path: '/'});

        setRedirect(<Redirect to="/"/>);
    }

    if ( redirect ) {
        return redirect;
    }

    return (
        <button data-testid="editContributorsModal" className={'editContributorsModal'} onClick={showsDropdown}>
            <i className="fas fa-user" data-testid={'userIcon'}></i>
            <i className="fas fa-caret-down drawerCaret"/>

            {dropdownFlag && <div className={'dropdown-container'}>
                <div className="account-dropdown-options" onClick={() => setCurrentModal({modal: AvailableModals.EDIT_CONTRIBUTORS})}>
                    Invite Contributors
                </div>
                <div className="account-dropdown-options" onClick={() => clearAccessTokenCookie()}>
                    Sign Out
                </div>
            </div>
            }
        </button>
    );
}

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setCurrentModal: (modalState: CurrentModalState) => dispatch(setCurrentModalAction(modalState)),
});

export default connect(null, mapDispatchToProps)(AccountDropdown);