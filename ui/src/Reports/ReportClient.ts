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

import Axios from 'axios';
import {Report} from './Report';
import fileDownload from 'js-file-download';
import {Parser} from 'json2csv';

class ReportClient {

    static async getReportsWithNames(): Promise<void> {
        const spaceName = this.getSpaceName();
        if (!spaceName || spaceName.length <= 1) {
            return Promise.reject();
        }
        const response = await Axios.get(`${process.env.REACT_APP_URL}reportgenerator/${spaceName}`);
        const jsonAsCsv = ReportClient.convertToCSV(response.data);
        fileDownload(jsonAsCsv, `${spaceName}_${new Date().toISOString().split('T')[0]}.csv`);

        return Promise.resolve();
    }

    static convertToCSV(jsonData: Report[]): string {
        const fields = ['boardName', 'personName', 'personRole', 'productName'];

        const json2csvParser = new Parser({fields});
        return json2csvParser.parse(jsonData);
    }

    static getSpaceName(): string {
        return window.location.pathname.split('/')[1];
    }
}

export default ReportClient;