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

package com.ford.internalprojects.peoplemover.person

import com.fasterxml.jackson.annotation.JsonProperty
import com.ford.internalprojects.peoplemover.role.SpaceRole
import com.ford.internalprojects.peoplemover.space.SpaceComponent
import javax.persistence.*

@Entity
data class Person(
        @Id
        @GeneratedValue
        val id: Int? = null,

        val name: String,

        @ManyToOne
        @JoinColumn(name = "space_role_id")
        val spaceRole: SpaceRole? = null,

        val notes: String? = "",

        @JsonProperty
        @Column(name = "new_person")
        var newPerson: Boolean = false,

        @Column(name = "space_id")
        override val spaceId: Int
): SpaceComponent {
    constructor(name: String, spaceId: Int) :
            this(null, name, null, "", false, spaceId)

    constructor(name: String, spaceId: Int, spaceRole: SpaceRole) :
            this(null, name = name, spaceId = spaceId, spaceRole = spaceRole)
}