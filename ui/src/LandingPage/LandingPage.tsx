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
import './LandingPage.scss';
import Logo from '../Application/Assets/logo.svg';
import LandingPageImage from './LandingPageImage.svg';
import LandingPageBackground from './LandingPageBackground.svg';

function LandingPage(): JSX.Element {
    return (
        <>
            <div className="landing-page-container">
                <div className="landing-page-info-container">
                    <div className="logo-title-container">
                        <img
                            src={Logo}
                            alt="Logo not available"/>
                        <h1 className="app-name page-title">PEOPLEMOVER</h1>
                    </div>
                    <div className="landing-page-info-heading">It’s about the people. Your people.</div>
                    <div className="landing-page-info-sub-heading">And helping them be extraordinary.</div>
                    <div className="landing-page-info-text">
                        Most allocation applications focus so much on the projects and schedules, and seem
                        to forget that a product is only as successful as its team. Our focus is on the
                        people, and how we can make them feel as empowered as possible. At the end of the
                        day, balanced, empowered, happy teams are going to be the teams with incredible results.
                    </div>
                    <div className="landing-page-info-sub-heading">Give it a shot!</div>
                    <div className="landing-page-info-text">Send us an email at jshaddac@ford.com and we can
                        give you a personal demo, or just set you up with your own PeopleMover space.</div>
                </div>
                <img
                    className="landing-page-image"
                    src={LandingPageImage}
                    alt=""/>
            </div>
            <img className="landing-page-background" src={LandingPageBackground} alt=""/>
        </>
    );
}
export default LandingPage;