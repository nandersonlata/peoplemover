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

package com.ford.internalprojects.peoplemover.product

import com.fasterxml.jackson.databind.ObjectMapper
import com.ford.internalprojects.peoplemover.assignment.Assignment
import com.ford.internalprojects.peoplemover.assignment.AssignmentRepository
import com.ford.internalprojects.peoplemover.board.Board
import com.ford.internalprojects.peoplemover.board.BoardRepository
import com.ford.internalprojects.peoplemover.location.SpaceLocation
import com.ford.internalprojects.peoplemover.location.SpaceLocationRepository
import com.ford.internalprojects.peoplemover.person.Person
import com.ford.internalprojects.peoplemover.person.PersonRepository
import com.ford.internalprojects.peoplemover.space.Space
import com.ford.internalprojects.peoplemover.space.SpaceRepository
import org.assertj.core.api.Assertions.assertThat
import org.junit.After
import org.junit.Before
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.data.repository.findByIdOrNull
import org.springframework.http.MediaType
import org.springframework.test.context.junit4.SpringRunner
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status

@RunWith(SpringRunner::class)
@SpringBootTest
@AutoConfigureMockMvc
class ProductControllerApiTest {
    @Autowired
    private lateinit var productRepository: ProductRepository

    @Autowired
    private lateinit var boardRepository: BoardRepository

    @Autowired
    private lateinit var assignmentRepository: AssignmentRepository

    @Autowired
    private lateinit var personRepository: PersonRepository

    @Autowired
    private lateinit var spaceRepository: SpaceRepository

    @Autowired
    private lateinit var spaceLocationRepository: SpaceLocationRepository

    @Autowired
    private lateinit var objectMapper: ObjectMapper

    @Autowired
    private lateinit var mockMvc: MockMvc
    private lateinit var space: Space

    @Before
    fun setUp() {
        space = spaceRepository.save(Space(name = "tok"))
    }

    @After
    fun tearDown() {
        assignmentRepository.deleteAll()
        productRepository.deleteAll()
        boardRepository.deleteAll()
        personRepository.deleteAll()
        spaceLocationRepository.deleteAll()
        spaceRepository.deleteAll()
    }

    @Throws(Exception::class)
    @Test
    fun `GET should return all products`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val spaceLocation = spaceLocationRepository.save(SpaceLocation(spaceId = space.id!!, name = "Detroit"))
        val product1: Product = productRepository.save(Product(
                name = "product one",
                boardId = board.id!!,
                dorf = "123",
                spaceLocation = spaceLocation,
                spaceId = space.id!!
        ))
        val product2: Product = productRepository.save(Product(
                name = "product two",
                boardId = board.id!!,
                dorf = "456",
                spaceLocation = spaceLocation,
                spaceId = space.id!!
        ))
        val result = mockMvc.perform(get("/api/product"))
                .andExpect(status().isOk)
                .andReturn()

        val actualProducts: List<Product> = objectMapper.readValue(
                result.response.contentAsString,
                objectMapper.typeFactory.constructCollectionType(MutableList::class.java, Product::class.java)
        )

        val actualProduct1: Product = actualProducts[0]
        val actualProduct2: Product = actualProducts[1]
        assertThat(actualProduct1).isEqualToIgnoringGivenFields(product1, "id")
        assertThat(actualProduct2).isEqualToIgnoringGivenFields(product2, "id")
    }

    @Test
    fun `POST should create new Product`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val productAddRequest = ProductAddRequest(name = "product one", boardId = board.id!!)

        val result = mockMvc.perform(post("/api/product")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val actualProduct: Product = objectMapper.readValue(
                result.response.contentAsString,
                Product::class.java
        )
        val productInDB: Product = productRepository.findByName("product one")!!

        assertThat(actualProduct.name).isEqualTo(productAddRequest.name)
        assertThat(actualProduct.boardId).isEqualTo(productAddRequest.boardId)
        assertThat(actualProduct.spaceId).isEqualTo(space.id!!)
        assertThat(actualProduct).isEqualTo(productInDB)
    }

    @Test
    fun `POST should return 400 when trying to create product with no product name`() {
        val productAddRequest = ProductAddRequest(name = "", boardId = 1)

        val result = mockMvc.perform(
                post("/api/product")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(productAddRequest))
        )
                .andExpect(status().isBadRequest)
                .andReturn()

        val response = result.resolvedException!!.message
        assertThat(response).contains("Invalid Product in Request. Did you forget to provide a name for the product?")
    }

    @Test
    fun `POST should return 409 when trying to create product of the same name`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        productRepository.save(Product(name = "product one", boardId = board.id!!, spaceId = space.id!!))
        val productAddRequest = ProductAddRequest(name = "product one", boardId = board.id!!)

        mockMvc.perform(post("/api/product")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productAddRequest)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should return 406 when trying to update product with too many characters in notes field`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val product: Product = productRepository.save(Product(name = "test", boardId = board.id!!, spaceId = space.id!!))
        val productEditRequest = ProductEditRequest(
                id = product.id!!,
                name = product.name,
                boardId = product.boardId,
                spaceId = product.spaceId,
                notes = "1234567890123456789012345678901234567890123456789012345678901234567890123456789012345678" +
                        "9012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012345" +
                        "6789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789012" +
                        "3456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456789" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890123456" +
                        "789012345678901234567890"
        )
        mockMvc.perform(put("/api/product/" + product.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isBadRequest)
    }

    @Test
    fun `PUT should update a product`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val product: Product = productRepository.save(Product(name = "test", boardId = board.id!!, spaceId = space.id!!))
        val person: Person = personRepository.save(Person(name = "bob", spaceId = space.id!!))
        assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))
        val productEditRequest = ProductEditRequest(
                name = "product two",
                boardId = product.boardId,
                spaceId = product.spaceId,
                id = product.id!!
        )

        val result = mockMvc.perform(put("/api/product/" + product.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(productEditRequest)))
                .andExpect(status().isOk)
                .andReturn()

        val expectedProduct: Product = product.copy(
                name = "product two"
        )
        val actualProduct: Product = objectMapper.readValue(
                result.response.contentAsString,
                Product::class.java
        )
        // should actualProduct have the assignment in it? productInDb will have it
        val productInDb: Product = productRepository.findByIdOrNull(product.id!!)!!
        assertThat(actualProduct).isEqualTo(expectedProduct)
        assertThat(actualProduct).isEqualToIgnoringGivenFields(productInDb, "assignments")
    }

    @Test
    fun `PUT should allow changing product name even when name used in different board`() {
        val board1: Board = boardRepository.save(Board(name = "board1", spaceId = space.id!!))
        val board2: Board = boardRepository.save(Board(name = "board2", spaceId = space.id!!))
        val product1: Product = productRepository.save(Product(name = "test", boardId = board1.id!!, spaceId = space.id!!))
        val product2: Product = productRepository.save(Product(name = "test2", boardId = board2.id!!, spaceId = space.id!!))
        product1.name = "test2"

        mockMvc.perform(put("/api/product/" + product1.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isOk)
    }

    @Test
    fun `PUT should return 409 when updating product with an already existing product name`() {
        val board: Board = boardRepository.save(Board("board", space.id!!))
        val product1: Product = productRepository.save(Product(name = "product one", boardId = board.id!!, spaceId = space.id!!))
        val product2: Product = productRepository.save(Product(name = "product two", boardId = board.id!!, spaceId = space.id!!))
        product1.name = product2.name

        mockMvc.perform(put("/api/product/" + product1.id)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(product1)))
                .andExpect(status().isConflict)
    }

    @Test
    fun `PUT should return 400 when trying to update non existing product`() {
        val result = mockMvc.perform(put("/api/product/700")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(Product(name = "", boardId = 0, spaceId = space.id!!))))
                .andExpect(status().isBadRequest)
                .andReturn()
        val response = result.resolvedException!!.message
        assertThat(response).contains("Invalid Product")
    }

    @Test
    fun `DELETE should delete product`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val product: Product = productRepository.save(Product(name = "test", boardId = board.id!!, spaceId = space.id!!))

        mockMvc.perform(delete("/api/product/${product.id}"))
                .andExpect(status().isOk)
                .andReturn()

        assertThat(productRepository.count()).isZero()
    }

    @Test
    fun `DELETE should delete associated assignments`() {
        val board: Board = boardRepository.save(Board(name = "board", spaceId = space.id!!))
        val product: Product = productRepository.save(Product(name = "test", boardId = board.id!!, spaceId = space.id!!))
        val unassignedProduct: Product = productRepository.save(Product(name = "unassigned", boardId = board.id!!, spaceId = space.id!!))
        val person = personRepository.save(Person(name = "person", spaceId = space.id!!))
        assignmentRepository.save(Assignment(person = person, productId = product.id!!, spaceId = space.id!!))

        mockMvc.perform(delete("/api/product/${product.id}"))
                .andExpect(status().isOk)
                .andReturn()

        val people: Iterable<Assignment> = assignmentRepository.findAll()
        assertThat(assignmentRepository.count()).isOne()
        assertThat(people.first().person.name).isEqualTo(person.name)
        assertThat(people.first().productId).isEqualTo(unassignedProduct.id)
    }

    @Test
    fun `DELETE should return 400 when trying to delete non existing product`() {
        mockMvc.perform(delete("/api/product/700"))
                .andExpect(status().isBadRequest)
    }
}