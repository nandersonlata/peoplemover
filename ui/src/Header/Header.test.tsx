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

import React from 'react';
import {fireEvent, RenderResult, screen} from '@testing-library/react';
import {axe} from 'jest-axe';
import Header from './Header';
import {renderWithRecoil} from '../Utils/TestUtils';
import {RunConfig} from 'Types/RunConfig';
import {MemoryRouter} from 'react-router-dom';
import flagsmith from 'flagsmith';
import {CurrentSpaceState} from '../State/CurrentSpaceState';
import TestData from '../Utils/TestData';
import {MutableSnapshot} from 'recoil';
import {dashboardUrl} from '../Routes';
import {createEmptySpace, Space} from '../Types/Space';

const debounceTimeToWait = 100;

describe('Header', () => {
    let container: string | Element;

    beforeEach(() => {
        window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;
    })

    describe('Landing Page', () => {
        it('should not show header at all', () => {
            renderHeader('/');
            expect(screen.queryByTestId('peopleMoverHeader')).toBeNull();
        });
    });

    describe('Dashboard Page', () => {
        beforeEach(() => {
            ({container} = renderHeader('/user/dashboard'));
        })

        it('should have no axe violations', async () => {
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should NOT show space name', () => {
            shouldNotShowSpaceName();
        });

        it('should show logo that is NOT a link', () => {
            const staticLogo = screen.getByTestId('peopleMoverStaticLogo');
            expect(staticLogo).not.toHaveAttribute('href');
            expect(staticLogo).toHaveTextContent('PEOPLEMOVER');
            expect(screen.queryByTestId('peopleMoverLogoLink')).toBeNull();
        });

        it('should ONLY show the "Sign Out" button in the account dropdown', () => {
            shouldOnlyShowSignoutButtonInAccountDropdown();
        });
    });

    describe('Space Page', () => {
        beforeEach(() => {
            ({container} = renderHeader(`/${TestData.space.uuid}`, TestData.space));
        })

        it('should have no axe violations', async () => {
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should show space name', () => {
            shouldShowSpaceName();
        });

        it('should render "Skip to main content" accessibility link', () => {
            expect(screen.getByText('Skip to main content')).toBeDefined();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLink();
        });

        it('should show "Time On Product" link and NOT "Back" link', () => {
            const timeOnProductLink = screen.getByText('Time On Product >');
            expect(timeOnProductLink).toBeDefined();
            expect(timeOnProductLink).toHaveAttribute('href', `/${TestData.space.uuid}/timeonproduct`);
            expect(screen.queryByText('< Back')).toBeNull();
        });

        it('should show all account dropdown options', () => {
            shouldShowAllAccountDropdownOptions();
        });
    });

    describe('Contact Us Page', () => {
        beforeEach(() => {
            ({container} = renderHeader('/contact-us', TestData.space));
        })

        it('should have no axe violations', async () => {
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should NOT show space name', () => {
            shouldNotShowSpaceName();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLink();
        });

        it('should ONLY show the "Sign Out" button in the account dropdown', () => {
            shouldOnlyShowSignoutButtonInAccountDropdown();
        });
    });

    describe('Time On Product Page', () => {
        beforeEach(() => {
            ({container} = renderHeader(`/${TestData.space.uuid}/timeonproduct`, TestData.space));
        })

        it('should have no axe violations', async () => {
            const results = await axe(container);
            expect(results).toHaveNoViolations();
        });

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should show space name', () => {
            shouldShowSpaceName();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLink();
        });

        it('should show logo that links back to the dashboard', () => {
            const logoLink = screen.getByTestId('peopleMoverLogoLink');
            expect(logoLink).toHaveAttribute('href', dashboardUrl);
            expect(logoLink).toHaveTextContent('PEOPLEMOVER');
        });

        it('should show "Back" to space link and NOT "Time on Product" link', async () => {
            const backToSpaceLink = screen.getByText('< Back');
            expect(backToSpaceLink).toBeDefined();
            expect(backToSpaceLink).toHaveAttribute('href', `/${TestData.space.uuid}`);
            expect(screen.queryByText('Time On Product >')).toBeNull();
        });

        it('should show all account dropdown options', () => {
            shouldShowAllAccountDropdownOptions();
        });
    })

    describe('Error Page', () => {
        beforeEach(() => {
            renderHeader('/error/404');
        })

        it('should show header', () => {
            expect(screen.getByTestId('peopleMoverHeader')).toBeDefined();
        });

        it('should NOT show space name', () => {
            shouldNotShowSpaceName();
        });

        it('should show logo that links back to the dashboard', () => {
            shouldRenderLogoAsDashboardLink();
        });

        it('should not show the account dropdown at all when user is on the error page', () => {
            expect(screen.queryByText('bob')).toBeNull();
            expect(screen.queryByText('Sign Out')).toBeNull();
            expect(screen.queryByText('Share Access')).toBeNull();
            expect(screen.queryByText('Download Report')).toBeNull();
        });
    });

    describe('Account Dropdown', () => {
        beforeEach(async () => {
            jest.useFakeTimers();
            flagsmith.hasFeature = jest.fn().mockReturnValue(true);

            renderHeader(`/${TestData.space.uuid}`);

            await screen.findByTestId('accountDropdownToggle');
        });

        it('should show username', async () => {
            expect(screen.getByText('USER_ID')).toBeDefined();
        });

        it('should not show invite users to space button when the feature flag is toggled off', async () => {
            window.runConfig = {invite_users_to_space_enabled: false} as RunConfig;

            openAccountDropdown();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(screen.queryByTestId('shareAccess')).toBeNull();
        });

        it('should show invite users to space button when the feature flag is toggled on', async () => {
            window.runConfig = {invite_users_to_space_enabled: true} as RunConfig;

            openAccountDropdown();
            jest.advanceTimersByTime(debounceTimeToWait);

            expect(await screen.findByTestId('shareAccess')).toBeDefined();
        });
    });
});

function renderHeader(initialRoute: string, currentSpace: Space = createEmptySpace()): RenderResult {
    return renderWithRecoil(
        <MemoryRouter initialEntries={[initialRoute]}>
            <Header />
        </MemoryRouter>,
        ({set}: MutableSnapshot) => {
            set(CurrentSpaceState, currentSpace)
        }
    );
}

function openAccountDropdown() {
    const userIconButton = screen.getByTestId('accountDropdownToggle');
    fireEvent.click(userIconButton);
}

function shouldShowAllAccountDropdownOptions() {
    openAccountDropdown();
    expect(screen.getByText('Sign Out')).toBeDefined();
    expect(screen.getByText('Share Access')).toBeDefined();
    expect(screen.getByText('Download Report')).toBeDefined();
}

function shouldRenderLogoAsDashboardLink() {
    const logoLink = screen.getByTestId('peopleMoverLogoLink');
    expect(logoLink).toHaveAttribute('href', dashboardUrl);
    expect(logoLink).toHaveTextContent('PEOPLEMOVER');
    expect(screen.queryByTestId('peopleMoverStaticLogo')).toBeNull();
}

function shouldOnlyShowSignoutButtonInAccountDropdown() {
    openAccountDropdown();

    expect(screen.getByText('Sign Out')).toBeDefined();
    expect(screen.queryByText('Share Access')).toBeNull();
    expect(screen.queryByText('Download Report')).toBeNull();
}

function shouldNotShowSpaceName() {
    expect(screen.queryByText(TestData.space.name)).toBeNull();
}

function shouldShowSpaceName() {
    expect(screen.getByText(TestData.space.name)).toBeDefined();
}