import scalajs from './domain.js'

export function newRfcService() {
	return new scalajs.com.seamless.contexts.rfc.RfcService()
}
export const Commands = scalajs.com.seamless.contexts.data_types.Commands
export const Primitives = scalajs.com.seamless.contexts.data_types.Primitives
export const DataTypesHelper = scalajs.com.seamless.contexts.data_types.DataTypesServiceHelper()