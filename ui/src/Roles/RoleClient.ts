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

import Axios, {AxiosResponse} from 'axios';
import {RoleAddRequest} from './RoleAddRequest';
import {RoleEditRequest} from './RoleEditRequest';
import {TraitClient} from '../Traits/TraitClient';

const spaceToken = window.location.pathname.substr(1);

class RoleClient implements TraitClient {

    async get(): Promise<AxiosResponse> {
        return Axios.get(
            process.env.REACT_APP_URL + 'role/' + spaceToken
        );
    }

    async add(role: RoleAddRequest): Promise<AxiosResponse> {
        return Axios.post(
            process.env.REACT_APP_URL + 'role/' + spaceToken,
            role,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    async edit(role: RoleEditRequest): Promise<AxiosResponse> {
        return Axios.put(
            process.env.REACT_APP_URL + 'role/' + spaceToken,
            role,
            {headers: {'Content-Type': 'application/json'}}
        );
    }

    async delete(roleId: number): Promise<AxiosResponse> {
        return Axios.delete(
            `${process.env.REACT_APP_URL}role/${roleId}`,
        );
    }
}

export default new RoleClient();