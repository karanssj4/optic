package com.seamless.contexts.rfc

import com.seamless.contexts.data_types.{DataTypesAggregate, DataTypesCommandContext}
import com.seamless.contexts.rfc.Commands.RfcCommand
import com.seamless.contexts.rfc.Events.RfcEvent
import com.seamless.ddd.{Effects, EventSourcedAggregate}
import Composition.forwardTo
import com.seamless.contexts.base.BaseCommandContext
import com.seamless.contexts.data_types.Commands.DataTypesCommand
import com.seamless.contexts.data_types.Events.DataTypesEvent
import com.seamless.contexts.requests.Commands.RequestsCommand
import com.seamless.contexts.requests.{RequestsAggregate, RequestsCommandContext}

case class RfcCommandContext() extends BaseCommandContext

object RfcAggregate extends EventSourcedAggregate[RfcState, RfcCommand, RfcCommandContext, RfcEvent] {

  override def handleCommand(state: RfcState): PartialFunction[(RfcCommandContext, RfcCommand), Effects[RfcEvent]] = {
    case (_: RfcCommandContext, command: DataTypesCommand) =>
      forwardTo(DataTypesAggregate)((DataTypesCommandContext(), command), state.dataTypesState).asInstanceOf[Effects[RfcEvent]]
    case (_: RfcCommandContext, command: RequestsCommand) =>
      forwardTo(RequestsAggregate)((RequestsCommandContext(state.dataTypesState), command), state.requestsState).asInstanceOf[Effects[RfcEvent]]
    case _ => noEffect()
  }

  override def applyEvent(event: RfcEvent, state: RfcState): RfcState = {
    event match {
      case dataTypesEvent: DataTypesEvent =>
        state.updateDataTypes(DataTypesAggregate.applyEvent(dataTypesEvent, state.dataTypesState))
      case _ => state
    }
  }

  override def initialState: RfcState = RfcState(RequestsAggregate.initialState, DataTypesAggregate.initialState)
}
