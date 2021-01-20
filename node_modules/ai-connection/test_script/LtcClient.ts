import * as request from 'sync-request'
/**
 * L2C client for 3rd party extension
 */
// namespace LtcClient
export var LtcClient = LtcClient || {}

LtcClient.port = 8080
LtcClient.baseUrl = 'http://localhost'

LtcClient.executeCommand = function (command, callback): void {
  var decodedResponse;
  try {
    var response = request('GET', `${LtcClient.baseUrl}:${LtcClient.port}/${command}`);
    decodedResponse = new Buffer(response.getBody()).toString();
  } catch (Error) {
    // if there is no server
    decodedResponse = Error.message;
  }
  callback(decodedResponse)
}