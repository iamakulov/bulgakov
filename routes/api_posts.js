/** @module api_posts */

var express = require("express");
var check = require("check-types");
var httpStatus = require("http-status-codes");
var api = require("../core/api");
var common = require("../core/common");
var PostObject = require("../core/postobject");
var AppError = require("../core/apperror");
var AppDbError = require("../core/appdberror");

var router = express.Router();

router.post("/new", function(req, res) {
    // Convert post data to PostObject
    var postObject = PostObject.fromJSON(req.body);

    if (postObject === null) {
        // Write about the error to the page
        sendResponse(res, AppError.wrongObjectFormat);
        return;
    }

    // Add new post by API call
    api.posts.post(postObject, function(appError, newPostId) {
        sendResponse(res, appError, { postId: newPostId });
    });
});

router.get("/:id", function(req, res) {
    var postId = parseInt(req.params.id);

    // Check whether id is correct
    if (!check.intNumber(postId)) {
        sendResponse(res, AppError.wrongIdFormat);
    }

    // Get post content
    api.posts.get(postId, function(appError, postObject) {
        var document = postObject ? postObject.toJSON() : null;
        sendResponse(res, appError, { postBody: document });
    });
});

router.put("/:id", function(req, res) {
    var postId = parseInt(req.params.id);

    // Check whether id is correct
    if (!check.intNumber(postId)) {
        sendResponse(res, AppError.wrongIdFormat);
        return;
    }

    var postObject = PostObject.fromJSON(req.body);
    if (postObject === null) {
        sendResponse(res, AppError.wrongObjectFormat);
        return;
    }

    api.posts.update(postId, postObject, function(appError, postId) {
        sendResponse(res, appError, { postId: postId });
    });
});

router.delete("/:id", function(req, res) {
    var postId = parseInt(req.params.id);

    // Check whether id is correct
    if (!check.intNumber(postId)) {
        sendResponse(res, AppError.wrongIdFormat);
        return;
    }

    // Get post content
    api.posts.remove(postId, function(appError, postId) {
        sendResponse(res, appError, { postId: postId });
    });
});

// Tell the client that this URL must be accessible in different way.
router.use(function(req, res) {
    sendResponse(res, AppError.wrongMethod);
});


/**
 * Performs useful tasks before sending the request such as setting html status error code etc.
 * @param {Object} response Express.js response object.
 * @param {(AppError|AppDbError)} error
 * @param {Object} [document]
 */
function sendResponse(response, error, document) {
    var responseTemplate = { error: null, document: null };

    if (error) {
        response.statusCode = error.httpStatus || httpStatus.INTERNAL_SERVER_ERROR;
        responseTemplate.error = error.publicData();
        response.send(responseTemplate);
    } else {
        responseTemplate.document = document;
        response.send(responseTemplate);
    }
}

module.exports = router;