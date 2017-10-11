package com.opticdev.server.http.routes.socket.agents

import akka.actor.{ActorSystem, PoisonPill, Props}
import akka.pattern.ask
import akka.stream.OverflowStrategy
import akka.stream.scaladsl.{Flow, Sink, Source}
import akka.util.Timeout
import com.opticdev.server.http.routes.socket.{Connection, ConnectionManager, OpticEvent}
import play.api.libs.json.{JsNumber, JsObject, JsString, Json}
import com.opticdev.server.http.routes.socket.agents.Protocol._
import com.opticdev.server.http.routes.socket.editors.EditorConnection._

import scala.concurrent.Await
import scala.concurrent.duration._
import scala.util.Try

class AgentConnection(slug: String, actorSystem: ActorSystem) extends Connection {

  private[this] val connectionActor = actorSystem.actorOf(Props(classOf[AgentConnectionActor], slug))

  def chatInSink(sender: String) = Sink.actorRef[AgentEvents](connectionActor, Terminated())

  def sendUpdate(event: UpdateAgentEvent) = {
    connectionActor ! event
  }

  override def websocketFlow = {
    val in =
      Flow[String]
        .map(i=> {
          val parsedTry = Try(Json.parse(i).as[JsObject])
          val eventTry  = Try(parsedTry.get.value.get("event").get.as[JsString].value)
          val message = if (eventTry.isSuccess) {
            eventTry.get match {
                //does not recieve anything from agent...yet
              case _ => UnknownEvent(i)
            }
          } else UnknownEvent(i)

          message
        })
        .to(chatInSink(slug))

    val out =
      Source.actorRef[OpticEvent](1, OverflowStrategy.fail)
        .mapMaterializedValue(connectionActor ! Registered(_))

    Flow.fromSinkAndSource(in, out)
  }

  def poison = connectionActor ! PoisonPill

}

object AgentConnection extends ConnectionManager[AgentConnection] {
  override def apply(slug: String)(implicit actorSystem: ActorSystem) = new AgentConnection(slug, actorSystem)

  def broadcastContext(contextUpdate: ContextUpdate) = listConnections.foreach(i=> i._2.sendUpdate(contextUpdate))

  def killAgent(slug: String) = {
    val connectionOption = connections.get(slug)
    if (connectionOption.isDefined) {
      connectionOption.get.poison
      connections -= slug
    }
  }
}
