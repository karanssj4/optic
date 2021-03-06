package com.useoptic.contexts.rfc.projections

import com.useoptic.contexts.rfc.Events.{ContributionAdded, RfcEvent}
import com.useoptic.ddd.Projection

import scala.scalajs.js.Dictionary
import scala.scalajs.js.annotation.{JSExport, JSExportAll}

@JSExport
@JSExportAll
case class ContributionWrapper(all: Map[String, Map[String, String]]) {
  import scala.scalajs.js
  def getOrUndefined(id: String, key: String): js.UndefOr[String] = {
    import js.JSConverters._
    all.get(id).flatMap(_.get(key)).orUndefined
  }

  def get(id: String, key: String): Option[String] = all.get(id).flatMap(_.get(key))

  def asJsDictionary: Dictionary[Dictionary[String]] = {
    import js.JSConverters._
    all.mapValues(_.toJSDictionary).toJSDictionary
  }
}

object ContributionsProjection extends Projection[RfcEvent, ContributionWrapper] {

  override def fromEvents(events: Vector[RfcEvent]): ContributionWrapper = {
    withMap(Map.empty, events)
  }

  override def withInitialState(initialState: ContributionWrapper, events: Vector[RfcEvent]): ContributionWrapper = {
    withMap(initialState.all, events)
  }

  def withMap(contributionMap: Map[String, Map[String, String]], events: Vector[RfcEvent]): ContributionWrapper = {

    def toMutable[A](m: Map[String, A]) = scala.collection.mutable.HashMap[String, A](m.toVector: _*)

    val mutableMap = toMutable(contributionMap.mapValues(toMutable))

    val results = events.foreach {
      case e: ContributionAdded => {
        val contributionsForId = mutableMap.getOrElseUpdate(e.id, toMutable(Map.empty[String, String]))
        contributionsForId.put(e.key, e.value)
        mutableMap
      }
      case _ =>
    }

    ContributionWrapper(mutableMap.mapValues(_.toMap).toMap)
  }
}
