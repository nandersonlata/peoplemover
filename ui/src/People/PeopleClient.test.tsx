/*
 * Copyright (c) 2020 Ford Motor Company
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
import PeopleClient from './PeopleClient';
import TestUtils from '../tests/TestUtils';
import Cookies from 'universal-cookie';

describe('People Client', function() {
    const spaceUuid = 'uuid';
    const basePeopleUrl = `/api/spaces/${spaceUuid}/people`;
    const cookies = new Cookies();

    const expectedConfig = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 123456',
        },
    };

    beforeEach(() => {
        cookies.set('accessToken', '123456');
        Axios.post = jest.fn(x => Promise.resolve({
            data: 'Created Person',
        } as AxiosResponse));
        Axios.put = jest.fn(x => Promise.resolve({
            data: 'Updated Person',
        } as AxiosResponse));
        Axios.delete = jest.fn(x => Promise.resolve({
            data: 'Deleted Person',
        } as AxiosResponse));
        Axios.get = jest.fn(x => Promise.resolve({
            data: 'Get All People',
        } as AxiosResponse));
    });

    afterEach(function() {
        cookies.remove('accessToken');
    });

    it('should return all people for space', function(done) {
        PeopleClient.getAllPeopleInSpace(spaceUuid)
            .then((response) => {
                expect(Axios.get).toHaveBeenCalledWith(basePeopleUrl, expectedConfig);
                expect(response.data).toBe('Get All People');
                done();
            });

    });

    it('should create a person and return that person', function(done) {
        const newPerson = TestUtils.person1;
        PeopleClient.createPersonForSpace(spaceUuid, newPerson)
            .then((response) => {
                expect(Axios.post).toHaveBeenCalledWith(basePeopleUrl, newPerson, expectedConfig);
                expect(response.data).toBe('Created Person');
                done();
            });
    });

    it('should edit a person and return that person', function(done) {
        const updatedPerson = TestUtils.person1;
        const expectedUrl = basePeopleUrl + `/${updatedPerson.id}`;
        PeopleClient.updatePerson(spaceUuid, updatedPerson)
            .then((response) => {
                expect(Axios.put).toHaveBeenCalledWith(expectedUrl, updatedPerson, expectedConfig);
                expect(response.data).toBe('Updated Person');
                done();
            });
    });

    it('should delete a person', function(done) {
        const expectedUrl = basePeopleUrl + `/${TestUtils.person1.id}`;
        PeopleClient.removePerson(spaceUuid, TestUtils.person1.id)
            .then((response) => {
                expect(Axios.delete).toHaveBeenCalledWith(expectedUrl, expectedConfig);
                expect(response.data).toBe('Deleted Person');
                done();
            });
    });
});