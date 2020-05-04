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

import {render} from '@testing-library/react';
import {mount} from 'enzyme';
import MultiSelect from '../ReusableComponents/MultiSelect';
import React from 'react';
import {Product} from '../Products/Product';
import TestUtils from './TestUtils';
import {noop} from '@babel/types';

describe('the multi-select component', () => {

    const intiallySelectedProducts: Product[] = [
        TestUtils.products[0],
        TestUtils.products[1],
    ];

    it('should render its initial selections', () => {
        const underTest = render(<MultiSelect
            name={'product'}
            initiallySelected={intiallySelectedProducts}
            selectables={TestUtils.products}
            placeholder={'Select a product'}
            changeSelections={noop}
            disabled={false}
        />);
        expect(underTest.getByText(intiallySelectedProducts[0].name)).toBeInTheDocument();
        expect(underTest.getByText(intiallySelectedProducts[1].name)).toBeInTheDocument();
        expect(underTest.queryByText(TestUtils.products[2].name)).not.toBeInTheDocument();
        expect(underTest.queryByText(TestUtils.products[3].name)).not.toBeInTheDocument();
    });

    it('should call the onChange callback on change', async () => {
        let testShouldPass = false;
        const makeTestPass = (): void => {
            testShouldPass = true;
        };

        const wrapper = await mount(<MultiSelect
            name={'product'}
            initiallySelected={intiallySelectedProducts}
            selectables={TestUtils.products}
            placeholder={'Select a product'}
            disabled={false}
            changeSelections={makeTestPass}/>);

        expect(wrapper.find('.MultiSelect__placeholder').length).toEqual(0);
        (wrapper.find('Select').instance() as any).selectOption({label: 'eee', value: 'eee'});
        expect(testShouldPass).toBeTruthy();
    });

    it('should render its placeholder text if nothing starts selected - Enzyme style', () => {
        const underTest = mount(<MultiSelect
            name={'product'}
            initiallySelected={[]}
            selectables={TestUtils.products}
            placeholder={'Select a product'}
            disabled={false}
            changeSelections={noop}/>);

        expect(underTest.find('div.MultiSelect__placeholder').length).toEqual(1);
    });

    it('should render its placeholder text if nothing starts selected', () => {
        const underTest = render(<MultiSelect
            name={'product'}
            initiallySelected={[]}
            selectables={TestUtils.products}
            placeholder={'Select a product'}
            disabled={false}
            changeSelections={noop}/>);

        expect(underTest.getByText('Select a product')).toBeInTheDocument();
    });

    it('should use custom dropdown indicator', async () => {
        const wrapper = await mount(<MultiSelect
            name={'product'}
            initiallySelected={intiallySelectedProducts}
            disabled={false}
            selectables={TestUtils.products}
            placeholder={'Select a product'}
            changeSelections={noop}/>);

        expect(wrapper.find('DropdownIndicator').length).toEqual(1);
    });
});