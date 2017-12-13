package com.opticdev.server.http

import com.opticdev.server.http.routes.{ContextRoute, ProjectRoute, PutUpdateRoute}
import akka.http.scaladsl.server.Directives._
import com.opticdev.server.http.routes.socket.SocketRoute
import com.opticdev.server.state.ProjectsManager

import scala.concurrent.ExecutionContext

class HttpService(implicit executionContext: ExecutionContext, projectsManager: ProjectsManager) {

  val projectsRoute = new ProjectRoute()
  val contextRoute = new ContextRoute()
  val editorConnectionRoute = new SocketRoute()
  val putUpdateRoute = new PutUpdateRoute()

  val routes = {
    projectsRoute.route ~
    editorConnectionRoute.route ~
    contextRoute.route ~
    putUpdateRoute.route
  }

}