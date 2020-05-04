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

package com.ford.internalprojects.peoplemover.auth

import com.ford.labs.authquest.oauth.OAuthAccessTokenResponse
import com.ford.labs.authquest.oauth.OAuthRefreshTokenResponse
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.PutMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.client.HttpClientErrorException
import javax.validation.Valid

@RestController
class AuthController(val authClient: AuthClient) {

    @PostMapping(path = ["/api/access_token"])
    fun getAccessToken(@Valid @RequestBody request: AccessTokenRequest): ResponseEntity<OAuthAccessTokenResponse> {
        val response = authClient.createAccessToken(request.accessCode)

        return if (response.isEmpty) {
            ResponseEntity.badRequest().build()
        } else ResponseEntity.ok(response.get())
    }

    @PostMapping(path = ["/api/access_token/validate"])
    fun validateAccessToken(@RequestBody request: ValidateTokenRequest): ResponseEntity<AuthQuestJWT> {
        try {
            val response = authClient.validateAccessToken(request.accessToken)

            if (response.isPresent) {
                return ResponseEntity.ok(
                        AuthQuestJWT(
                                exp = response.get().exp.toString(),
                                iss = response.get().iss,
                                scopes = response.get().scopes,
                                sub = response.get().sub,
                                user_id = response.get().user_id
                        )
                )
            }
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()

        } catch (e: HttpClientErrorException) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
        }

    }

    @PostMapping(path = ["/api/access_token/refresh"])
    fun validateAccessToken(@RequestBody request: RefreshTokenRequest): ResponseEntity<OAuthRefreshTokenResponse> {
        val accessToken = authClient.refreshAccessToken(request.accessToken)
        if (accessToken.isPresent) {
            return ResponseEntity.ok(accessToken.get())
        }

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build()
    }

    @PostMapping(path = ["/api/access_token/authenticate"])
    fun validateAndAuthenticateAccessToken(@RequestBody request: AuthCheckScopesRequest): ResponseEntity<Void> {
        val validateTokenResponse = authClient.validateAccessToken(request.accessToken)

        if (validateTokenResponse.isPresent) {
            val lowercaseSpaceNames = validateTokenResponse.get().scopes.map { it.toLowerCase() }
            if (lowercaseSpaceNames.contains(request.spaceName.toLowerCase())) {
                return ResponseEntity.ok().build()
            }
        }

        return ResponseEntity.status(HttpStatus.FORBIDDEN).build()
    }

    @PutMapping(path = ["/api/user/invite/space"])
    fun inviteUsersToSpace(@Valid @RequestBody request: AuthInviteUsersToSpaceRequest): ResponseEntity<Void> {
        authClient.inviteUsersToScope(request.emails, request.spaceName)
        return ResponseEntity.noContent().build()
    }

}