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

package com.ford.internalprojects.peoplemover.location

import com.ford.internalprojects.peoplemover.location.exceptions.LocationAlreadyExistsException
import com.ford.internalprojects.peoplemover.location.exceptions.LocationNotExistsException
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import javax.transaction.Transactional

@Service
class LocationService(
        private val spaceRepository: SpaceRepository,
        private val spaceLocationRepository: SpaceLocationRepository
) {
    fun addLocationToSpace(
            spaceName: String,
            locationAddRequest: LocationAddRequest
    ): SpaceLocation {
        val space: Space = spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException()
        throwIfSpaceLocationAlreadyExists(space, locationAddRequest.name)

        val spaceLocationToSave = SpaceLocation(spaceId = space.id!!, name = locationAddRequest.name)
        return spaceLocationRepository.saveAndUpdateSpaceLastModified(spaceLocationToSave)
    }

    fun getLocationsForSpace(spaceName: String): Set<SpaceLocation> {
        val space: Space = spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException(spaceName)
        return spaceLocationRepository.findAllBySpaceId(space.id!!)
    }

    fun editLocation(spaceName: String, locationEditRequest: LocationEditRequest): SpaceLocation {
        val space: Space = spaceRepository.findByNameIgnoreCase(spaceName)
                ?: throw SpaceNotExistsException(spaceName)
        throwIfSpaceLocationAlreadyExists(space, locationEditRequest.updatedName)
        val spaceLocationToEdit = SpaceLocation(
                id = locationEditRequest.id,
                spaceId = space.id!!,
                name = locationEditRequest.updatedName
        )
        return spaceLocationRepository.saveAndUpdateSpaceLastModified(spaceLocationToEdit)
    }

    @Transactional
    fun deleteLocation(spaceName: String, locationId: Int) {
        val tagToDelete: SpaceLocation = spaceLocationRepository.findByIdOrNull(locationId) ?: throw LocationNotExistsException()
        spaceLocationRepository.deleteAndUpdateSpaceLastModified(tagToDelete)
    }

    private fun throwIfSpaceLocationAlreadyExists(spaceFound: Space, locationName: String) {
        spaceLocationRepository.findBySpaceIdAndNameIgnoreCase(
                spaceFound.id!!,
                locationName
        )?.let { throw LocationAlreadyExistsException(locationName) }
    }

}