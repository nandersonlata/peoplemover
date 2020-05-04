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

package com.ford.internalprojects.peoplemover.space

import com.ford.internalprojects.peoplemover.auth.AuthClient
import com.ford.internalprojects.peoplemover.auth.AuthQuestJWT
import com.ford.internalprojects.peoplemover.auth.AuthService
import com.ford.internalprojects.peoplemover.auth.ValidateTokenRequest
import com.ford.internalprojects.peoplemover.board.BoardService
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceAlreadyExistsException
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import com.ford.internalprojects.peoplemover.user.exceptions.InvalidTokenException
import com.ford.internalprojects.peoplemover.utilities.HelperUtils
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.stereotype.Service

@Service
class SpaceService(
        private val spaceRepository: SpaceRepository,
        private val boardService: BoardService,
        private val authService: AuthService,
        private val authClient: AuthClient
        ) {

    fun createSpaceWithName(spaceName: String): Space {
        spaceRepository.findByNameIgnoreCase(spaceName)
                ?.let { throw SpaceAlreadyExistsException(spaceName) }
        if (spaceName.isEmpty()) {
            throw SpaceNotExistsException(spaceName)
        } else {
            val savedSpace = spaceRepository.save(
                    Space(name = spaceName, lastModifiedDate = HelperUtils.currentTimeStamp)
            )
            boardService.createBoardForNewSpace("My Board", savedSpace)
            return savedSpace
        }
    }

    fun createSpaceWithUser(accessToken: String, spaceName: String): SpaceWithAccessTokenResponse {
        val validateResponse: ResponseEntity<AuthQuestJWT> = authService.validateAccessToken(ValidateTokenRequest(accessToken))
        if (validateResponse.statusCode == HttpStatus.OK) {
            createSpaceWithName(spaceName).let { createdSpace ->

                authClient.createScope(listOf(spaceName))

                val userUUID: String = validateResponse.body!!.user_id!!
                authClient.updateUserScopes(userUUID, listOf(spaceName))

                val refreshToken = authClient.refreshAccessToken(accessToken).orElse(null)

                return SpaceWithAccessTokenResponse(createdSpace, refreshToken.access_token)
            }
        }
        throw InvalidTokenException()
    }

    fun findAll(): List<Space> {
        return spaceRepository.findAll().toList()
    }

    fun getSpacesForUser(accessToken: String): List<Space> {
        val validateResponse: ResponseEntity<AuthQuestJWT> = authService.validateAccessToken(ValidateTokenRequest(accessToken))
        validateResponse.body?.let {
            return spaceRepository.findAllByNameIn(it.scopes)
        }
        throw InvalidTokenException()
    }

    fun getLastModifiedForSpace(spaceName: String): TimestampResponse {
        val space: Space = spaceRepository.findByNameIgnoreCase(spaceName) ?: throw SpaceNotExistsException()
        return TimestampResponse(space.lastModifiedDate)
    }

}