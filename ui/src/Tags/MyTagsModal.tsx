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

import React, {useEffect, useState} from 'react';
import '../Traits/MyTraits.scss';
import LocationClient from '../Locations/LocationClient';
import ProductTagClient from '../ProductTag/ProductTagClient';
import MyTraits from '../Traits/MyTraits';
import {noop} from '@babel/types';

interface MyTagsModalProps {
    setShouldShowConfirmCloseModal?: Function;
}

function MyTagsModal({setShouldShowConfirmCloseModal}: MyTagsModalProps): JSX.Element {
    const [locationSectionOpen, setLocationSectionOpen] = useState<boolean>(false);
    const [productTagSectionOpen, setProductTagSectionOpen] = useState<boolean>(false);

    useEffect(() => {
        if (setShouldShowConfirmCloseModal) {
            setShouldShowConfirmCloseModal(locationSectionOpen || productTagSectionOpen);

            return (): void => setShouldShowConfirmCloseModal(false);
        }
        return noop;
    }, [locationSectionOpen, productTagSectionOpen]);

    return (
        <div data-testid="myTagsModal" className="myTraitsContainer">

            <MyTraits
                title={'Location Tags'}
                traitClient={LocationClient}
                colorSection={false}
                setTraitSectionOpen={setLocationSectionOpen}
                traitName="location"
            />

            <div className="separatorBetweenTags"/>

            <MyTraits
                title={'Product Tags'}
                traitClient={ProductTagClient}
                colorSection={false}
                setTraitSectionOpen={setProductTagSectionOpen}
                traitName="product tag"
            />

            <div className="traitWarning">Note: Editing or deleting a tag will affect any product currently tagged
                with it.
            </div>

        </div>
    );
}
export default MyTagsModal;