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

import {render, RenderResult, wait} from '@testing-library/react';
import ValidationGuard from '../Validation/ValidationGuard';
import * as React from 'react';
import Axios, {AxiosResponse} from 'axios';

describe('The Validation Guard', () => {
    it('should hide the child element when security is enabled and you are not authorized', async () => {
        Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
        let result = await renderComponent('true');
        expect(result.getByText('403 - YOU ARE FORBIDDEN')).toBeInTheDocument();
    });

    it('should show the child element when security is enabled and you are authorized', async () => {
        Axios.post = jest.fn(() => Promise.resolve({} as AxiosResponse));
        let result = await renderComponent('true');
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
    });

    it('should show the child element when security is disabled', async () => {
        Axios.post = jest.fn(() => Promise.reject({} as AxiosResponse));
        let result = await renderComponent('false');
        expect(result.getByText('I am so secure!')).toBeInTheDocument();
        expect(Axios.post.mock.calls.length).toBe(0);
    });

    async function renderComponent(securityEnabled: string): Promise<RenderResult> {
        process.env.REACT_APP_AUTH_ENABLED = securityEnabled;

        let result: RenderResult;
        await wait(() => {
            result = render(
                <ValidationGuard>
                    <TestComponent/>
                </ValidationGuard>
            );
        });
        return result;
    }

    function TestComponent(): JSX.Element {
        return <>I am so secure!</>;
    }
});