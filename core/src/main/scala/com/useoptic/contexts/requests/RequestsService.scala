package com.useoptic.contexts.requests

import com.useoptic.contexts.requests.Commands.RequestsCommand
import com.useoptic.contexts.requests.Events.RequestsEvent
import com.useoptic.contexts.shapes.{ShapesService, ShapesState}
import com.useoptic.ddd.{AggregateId, EventSourcedRepository, InMemoryEventStore}

import scala.scalajs.js.annotation.{JSExport, JSExportAll}
import scala.util.Random

//STRICTLY FOR TESTING (because everything should go through the root (RfcService))
class RequestsService(shapesService: ShapesService) {
  private val eventStore = new InMemoryEventStore[RequestsEvent]
  private val repository = new EventSourcedRepository[RequestsState, RequestsEvent](RequestsAggregate, eventStore)

  def handleCommand(id: AggregateId, command: RequestsCommand): Unit = {
    val shapesState: ShapesState = shapesService.currentState(id)
    val state = repository.findById(id)
    val effects = RequestsAggregate.handleCommand(state)((RequestsCommandContext("a", "b", "c", shapesState), command))
    repository.save(id, effects.eventsToPersist)
  }

  def currentState(id: AggregateId): RequestsState = {
    repository.findById(id)
  }
}
@JSExport
@JSExportAll
object RequestsServiceHelper {
  def suffix(): String = Random.alphanumeric take 10 mkString
  def newPathId(): String = s"path_${suffix}"
  def newRequestId(): String = s"request_${suffix}"
  def newResponseId(): String = s"response_${suffix}"
  def newParameterId(): String = s"parameter_${suffix}"
}
