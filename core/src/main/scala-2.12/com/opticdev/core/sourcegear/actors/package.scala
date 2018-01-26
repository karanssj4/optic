package com.opticdev.core.sourcegear

import akka.actor.{ActorRef, ActorSystem, Props}
import better.files.File
import com.opticdev.core.sourcegear.actors.ParseSupervisorActor
import com.opticdev.core.actorSystem
import com.opticdev.core.sourcegear.graph.FileNode
import com.opticdev.core.sourcegear.project.{OpticProject, Project}
import com.opticdev.parsers._

package object actors {

  //Parser Supervisor Recieve
  case class AddToCache(file: FileNode, astGraph: AstGraph, parser: ParserBase, fileContents: String)
  case class CheckCacheFor(file: FileNode)
  case object CacheSize
  case object ClearCache
  case class SetCache(newCache: ParseCache)

  //Parser Supervisor & Worker Receive
  sealed trait ParserRequest
  case class ParseFile(file: File, requestingActor: ActorRef, project: OpticProject)(implicit val sourceGear: SourceGear) extends ParserRequest
  case class ParseFileWithContents(file: File, contents: String, requestingActor: ActorRef, project: OpticProject)(implicit val sourceGear: SourceGear) extends ParserRequest


  //Project Receives
  sealed trait ParseStatus
  case class ParseSuccessful(parseResults: FileParseResults, file: File) extends ParseStatus
  case class ParseFailed(file: File) extends ParseStatus
  case class FileUpdatedInMemory(file: File, contents: String, project: OpticProject)(implicit val sourceGear: SourceGear)
  case class FileUpdated(file: File, project: OpticProject)(implicit val sourceGear: SourceGear)
  case class FileCreated(file: File, project: OpticProject)(implicit val sourceGear: SourceGear)
  case class FileDeleted(file: File, project: OpticProject)(implicit val sourceGear: SourceGear)
  case object CurrentGraph
  case object ClearGraph
  case class GetContext(fileNode: FileNode)(implicit val sourceGear: SourceGear, val project: OpticProject)
  case class NodeForId(id: String)

}
