/**
 *  Title           :hackup.js
 *  Description     :This is a sample code for calling two everisMoriarty 
 *				           services that do language detection and sentiment analysis.
 *			             These services were specifically prepared for HackUPC 2017
 *			             event, and will stop running on 05/03/2017 at 11pm.
 *  Author          :Ruben Gabas <ruben.gabas.celimendiz@everis.com>
 *  Date Created    :20170224
 *  Date Modified   :20170301
 *
 */
var fs = require("fs");
var request = require("request");
var constants = require("./constants");

var options = constants.options;
/**
 *  function getSentiment()
 * callback is a function to return parameter String
 * set complete path and do request
 */
function getSentiment(text, language, callback) {
  // set path
  options.url = constants.URL + constants.PATH_DEV + constants.RESOURCE_SENTIMENT;
  if (text != undefined && text != "" &&
    language != undefined && language != null &&
    (language === constants.SPANISH || language === constants.ENGLISH)) {
    // set parameters
    options.json = { textIn: text, language: language };
    // do request
    request(options, function (error, res, body) {
      if (error) {
        callback(constants.INVALID_URL);
        writeLog(constants.ERROR, constants.RESOURCE_SENTIMENT, 0,  constants.INVALID_URL);
      } else {
        handleRes(body, constants.RESOURCE_SENTIMENT, res.statusCode, callback);
      }
    }); 
  } else {
    callback(constants.TEXTIN_PARAMETER);
  }
}

/**
 *  function getLanguage()
 * callback is a function to return parameter String
 * 
 * set complete path and do request
 * 
 */
function getLanguage(text, callback) {
  // set url
  options.url = constants.URL + constants.PATH_DEV + constants.RESOURCE_LANGUAGE;
  if (text != undefined && text != "") {
      // set parameter
      options.json = { textIn: text };
      // do request
      request(options, function (error, res, body) {
        if (error) {
          callback(constants.INVALID_URL); 
          writeLog(constants.ERROR, constants.RESOURCE_LANGUAGE, 0, constants.INVALID_URL);
        } else {
          handleRes(body, constants.RESOURCE_LANGUAGE, res.statusCode, callback);
        }
      });
  } else {
    callback(constants.SENTIMENT_PARAMETERS);
  }
}

/**
 * handleResp(resp, type, statusCode, callback)
 * resp, is response data
 * type, is type of resource, Sentiment or Language
 * statusCode response status code
 * callback is a function to return parameter String
 * 
 * Check errors of response
 */
function handleRes(resp, type, statusCode, callback) {
  try {
    if (resp.message === constants.TASK_COMPLETED) {
      if (type === constants.RESOURCE_SENTIMENT) {
        callback(resp.results.prediction);
        writeLog(constants.SUCCESSFUL, type, statusCode, resp.results.prediction);
      } else if (type === constants.RESOURCE_LANGUAGE) {
        callback(resp.results.language);
        writeLog(constants.SUCCESSFUL, type, statusCode, resp.results.language);
      }
    } else if (statusCode === constants.FORBIDDEN) {
      callback(constants.MESSAGE_FORBIDDEN);
      writeLog(constants.ERROR, type, statusCode, constants.MESSAGE_FORBIDDEN);
    }  else if (resp.message === constants.EMPTY_MESSAGE && resp.status.executionStatusCode === constants.EXECUTION_CODE_WAIT) {
      callback(constants.MESSAGE_NOWAIT);
      writeLog(constants.ERROR, type, statusCode, constants.MESSAGE_NOWAIT);
    } else if (resp.message === NETWORK_ERROR) {
      callback(constants.NETWORK_ERROR);
      writeLog(constants.ERROR, type, statusCode, constants.NETWORK_ERROR);
    } else {
      callback(resp);
      writeLog(constants.ERROR, type, statusCode, resp);
    }
  } catch (err) {
     callback(constants.MESSAGE_EXCEPTION);
     writeLog(constants.ERROR, type, statusCode, constants.MESSAGE_EXCEPTION);
  }
}

function writeLog(success, type, statusCode, message) {
  fs.appendFile(constants.LOG_FILE, new Date().toISOString() + ": " + success + "[" + type + "][" + statusCode + "]" + message + '\n', function (err) {
    if (err) return console.log(err);
  });
};

// call to the function getSentiment, the callback function print the result in screen
getSentiment("Hace muy buen dia", "Spanish", function (results) {
  console.log(results);
})

// call to the function getLanguage, the callback function print the result in screen
getLanguage("Buenos dias en zaragoza hace sol y frio", function (results) {
  console.log(results);
})