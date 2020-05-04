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

package com.ford.internalprojects.peoplemover.assignment

import com.ford.internalprojects.peoplemover.assignment.exceptions.AssignmentAlreadyExistsException
import com.ford.internalprojects.peoplemover.assignment.exceptions.AssignmentNotExistsException
import com.ford.internalprojects.peoplemover.assignment.exceptions.InvalidDateFormatException
import com.ford.internalprojects.peoplemover.assignment.exceptions.NoAssignmentsToCreateException
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.person.exceptions.PersonNotExistsException
import com.ford.internalprojects.peoplemover.product.Product
import com.ford.internalprojects.peoplemover.product.ProductRepository
import com.ford.internalprojects.peoplemover.product.exceptions.ProductNotExistsException
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import com.ford.internalprojects.peoplemover.space.exceptions.SpaceNotExistsException
import org.springframework.data.repository.findByIdOrNull
import org.springframework.stereotype.Service
import java.time.LocalDate
import java.time.format.DateTimeParseException
import javax.transaction.Transactional

@Service
class AssignmentService(
        private val assignmentRepository: AssignmentRepository,
        private val personRepository: PersonRepository,
        private val productRepository: ProductRepository,
        private val spaceRepository: SpaceRepository
) {
    fun deleteAssignmentIfPersonIsUnassigned(personId: Int, productIdForCreatedAssignment: Int) {
        val assignmentsForPerson: List<Assignment> = getAssignmentsForTheGivenPersonId(personId)
        assignmentsForPerson.forEach { assignment ->
            productRepository.findByIdOrNull(assignment.productId)
                    ?.let { product ->
                        val thisIsNotNewlyCreatedAssignment = product.id != productIdForCreatedAssignment
                        if (thisIsNotNewlyCreatedAssignment && product.name == "unassigned") {
                            deleteOneAssignment(assignment)
                        }
                    }
        }
    }

    @Throws(AssignmentNotExistsException::class, ProductNotExistsException::class)
    fun updateAssignment(assignmentToUpdate: Assignment) {
        assignmentRepository.findByIdOrNull(assignmentToUpdate.id!!) ?: throw AssignmentNotExistsException()
        productRepository.findByIdOrNull(assignmentToUpdate.productId) ?: throw ProductNotExistsException()

        assignmentRepository.saveAndUpdateSpaceLastModified(assignmentToUpdate)
    }

    fun updateAssignment(assignmentId: Int, assignmentRequest: AssignmentRequest): Assignment {
        val assignmentToBeUpdated: Assignment = assignmentRepository.findByIdOrNull(assignmentId)
                ?: throw AssignmentNotExistsException()
        assignmentToBeUpdated.placeholder = assignmentRequest.placeholder

        return assignmentRepository.saveAndUpdateSpaceLastModified(assignmentToBeUpdated)
    }

    fun updateAssignments(assignments: Set<Assignment>) {
        assignmentRepository.saveAll(assignments)
    }

    @Transactional
    fun deleteOneAssignment(assignmentToDelete: Assignment) {
        assignmentRepository.deleteAndUpdateSpaceLastModified(assignmentToDelete)
    }

    fun deleteAndUnassign(assignmentId: Int) {
        assignmentRepository.findByIdOrNull(assignmentId)?.let { assignmentToDelete ->
            deleteOneAssignment(assignmentToDelete)

            val allRemainingAssignments: List<Assignment> = getAssignmentsForTheGivenPersonId(assignmentToDelete.person.id!!)
            val boardId: Int = getBoardIdForAssignment(assignmentToDelete)

            allRemainingAssignments.filter { assignment -> boardId == getBoardIdForAssignment(assignment) }.ifEmpty {
                productRepository.findProductByNameAndBoardId("unassigned", boardId)
                        ?.let { unassignedProductForBoard ->
                            val unassignedAssignment = Assignment(
                                    person = assignmentToDelete.person,
                                    productId = unassignedProductForBoard.id!!,
                                    spaceId = assignmentToDelete.person.spaceId
                            )
                            createAssignment(unassignedAssignment)
                        }
            }
        }
    }

    @Transactional
    fun deleteForProductId(productId: Int) {
        assignmentRepository.deleteByProductId(productId)
    }

    fun getAssignmentsForTheGivenPersonId(personId: Int): List<Assignment> {
        return assignmentRepository.getByPersonId(personId)
    }

    fun deleteAllAssignments(personId: Int) {
        val assignments: List<Assignment> = getAssignmentsForTheGivenPersonId(personId)
        assignments.forEach { deleteOneAssignment(it) }
    }

    fun createAssignmentFromAssignmentRequest(assignmentRequest: AssignmentRequest): Assignment {
        val person: Person = getPersonIfValidAssignmentRequest(assignmentRequest)
        val assignment = Assignment(
                person = person,
                placeholder = assignmentRequest.placeholder,
                productId = assignmentRequest.productId,
                spaceId = person.spaceId
        )
        return createAssignment(assignment)
    }

    private fun createAssignment(assignment: Assignment): Assignment {
        val createdAssignment: Assignment = assignmentRepository.saveAndUpdateSpaceLastModified(assignment)
        deleteAssignmentIfPersonIsUnassigned(assignment.person.id!!, createdAssignment.productId)
        return createdAssignment
    }

    private fun getBoardIdForAssignment(assignment: Assignment): Int {
        val product: Product = productRepository.findByIdOrNull(assignment.productId)
                ?: throw ProductNotExistsException()

        return product.boardId
    }

    private fun getPersonIfValidAssignmentRequest(assignmentRequest: AssignmentRequest): Person {
        productRepository.findByIdOrNull(assignmentRequest.productId)
                ?: throw ProductNotExistsException()
        throwIfAssignmentAlreadyExists(assignmentRequest.productId, assignmentRequest.personId)
        return personRepository.findByIdOrNull(assignmentRequest.personId)
                ?: throw PersonNotExistsException()
    }

    @Throws(AssignmentAlreadyExistsException::class)
    private fun throwIfAssignmentAlreadyExists(productId: Int, personId: Int) {
        val assignmentAlreadyExists: Boolean = assignmentRepository.getByPersonId(personId)
                .any { assignment -> assignment.productId == productId }

        if (assignmentAlreadyExists) {
            throw AssignmentAlreadyExistsException()
        }
    }

    fun getAssignmentsByDate(spaceId: Int, requestedDate: String): Set<Assignment> {
        spaceRepository.findByIdOrNull(spaceId) ?: throw SpaceNotExistsException()

        val requestedLocalDate = try {
            LocalDate.parse(requestedDate)
        } catch (e: DateTimeParseException) {
            throw InvalidDateFormatException()
        }

        val people: List<Person> = personRepository.findAllBySpaceId(spaceId)
        var allAssignments: Set<Assignment> = mutableSetOf()
        people.forEach { person ->
            val assignmentsForPerson: List<Assignment> = assignmentRepository.findAllByEffectiveDateLessThanEqualAndPersonOrderByEffectiveDateAsc(requestedLocalDate, person)
            allAssignments = if (assignmentsForPerson.isNotEmpty()) {
                val lastDate: LocalDate = assignmentsForPerson.last().effectiveDate!!
                val assignmentsOnLastDate: Set<Assignment> = assignmentsForPerson.filter { it.effectiveDate == lastDate }.toSet()
                allAssignments.plus(assignmentsOnLastDate)
            } else {
                val assignmentsWithNullEffectiveDate: Set<Assignment> = assignmentRepository.findAllByEffectiveDateIsNullAndPerson(person)
                allAssignments.plus(assignmentsWithNullEffectiveDate)
            }
        }

        return allAssignments
    }

    fun createAssignmentFromCreateAssignmentsRequestForDate(assignmentRequest: CreateAssignmentsRequest): Set<Assignment> {
        if (assignmentRequest.products.isNullOrEmpty()) {
            throw NoAssignmentsToCreateException()
        } else {
            deleteAllAssignmentsForDate(assignmentRequest)
            return createAssignmentsForDate(assignmentRequest)
        }
    }

    private fun createAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest): Set<Assignment> {
        val space = spaceRepository.findByIdOrNull(assignmentRequest.person.spaceId) ?: throw SpaceNotExistsException()

        val createdAssignments = hashSetOf<Assignment>()
        assignmentRequest.products.forEach { product ->
            productRepository.findByIdOrNull(product.productId) ?: throw ProductNotExistsException()
            val assignment = assignmentRepository.save(
                    Assignment(
                            person = assignmentRequest.person,
                            placeholder = product.placeholder,
                            productId = product.productId,
                            spaceId = space.id!!,
                            effectiveDate = assignmentRequest.requestedDate
                    )
            )
            createdAssignments.add(assignment)
        }
        return createdAssignments
    }

    private fun deleteAllAssignmentsForDate(assignmentRequest: CreateAssignmentsRequest) {
        personRepository.findByIdOrNull(assignmentRequest.person.id!!) ?: throw PersonNotExistsException()

        val assignments: List<Assignment> = assignmentRepository.findAllByPersonAndEffectiveDate(
                assignmentRequest.person,
                assignmentRequest.requestedDate
        )
        assignments.forEach { deleteOneAssignment(it) }
    }
}