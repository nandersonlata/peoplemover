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

import {useRecoilState} from 'recoil';
import {useCallback} from 'react';
import {useParams} from 'react-router-dom';
import {RoleTag} from 'Roles/RoleTag.interface';
import sortTagsAlphabetically from 'Tags/sortTagsAlphabetically';
import {Tag} from 'Tags/Tag';
import {ProductTagsState} from 'State/ProductTagsState';
import ProductTagClient from 'Tags/ProductTag/ProductTagClient';

interface UseFetchProductTags {
    productTags: Tag[];
    fetchProductTags(): void
}

function useFetchProductTags(): UseFetchProductTags {
    const { teamUUID = '' } = useParams<{ teamUUID: string }>();
    const [productTags, setProductTags] = useRecoilState(ProductTagsState);

    const fetchProductTags = useCallback(() => {
        ProductTagClient.get(teamUUID)
            .then(result => {
                const tags: Array<RoleTag> = [...result.data];
                sortTagsAlphabetically(tags);
                setProductTags(tags)
            })
            .catch(console.error);
    }, [setProductTags, teamUUID])

    return {
        productTags: productTags || [],
        fetchProductTags
    };
}

export default useFetchProductTags;