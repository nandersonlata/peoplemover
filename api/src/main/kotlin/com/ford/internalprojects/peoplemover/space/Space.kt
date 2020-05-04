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

import com.fasterxml.jackson.annotation.JsonIdentityInfo
import com.fasterxml.jackson.annotation.ObjectIdGenerators
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.location.SpaceLocation
import com.ford.internalprojects.peoplemover.role.SpaceRole
import java.sql.Timestamp
import java.util.*
import javax.persistence.*
import kotlin.collections.HashSet

@Entity
@JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator::class, property = "id")
data class Space (
    @GeneratedValue
    @Id
    val id: Int? = null,

    @Column(unique = true, nullable = false)
    val name: String,

    @OneToMany(cascade = [CascadeType.MERGE], orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "space_id")
    val boards: Set<Board> = HashSet(),

    @OneToMany(mappedBy = "spaceId", orphanRemoval = true, cascade = [CascadeType.REMOVE, CascadeType.REFRESH], fetch = FetchType.EAGER)
    val roles: Set<SpaceRole> = HashSet(),

    @OneToMany(mappedBy = "spaceId", orphanRemoval = true, cascade = [CascadeType.REMOVE, CascadeType.REFRESH], fetch = FetchType.EAGER)
    val locations: List<SpaceLocation> = ArrayList(),

    var lastModifiedDate: Timestamp? = null
) {
    constructor(name: String):
            this(null, name, HashSet(), HashSet(), ArrayList(), null)
}