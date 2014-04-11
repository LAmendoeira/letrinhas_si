﻿///reference path="../typings/express/express.d.ts"/>

import express = require('express');
import fs = require('fs');

import appPostServices = require('../Scripts/services/appPostServices');
import appGetServices = require('../Scripts/services/appGetServices');

export function listSummary(request: express.Request, response: express.Response) {

    var max = parseInt(request.param('max'));

    max = isNaN(max) ? null : max;

    appGetServices.getTestListSummaryFromDb(max, (err, list) => {
        response.set('Content-Type', 'application/json');
        response.charset = 'utf-8';
        if (err) {
            response.statusCode = 500;
            response.send(JSON.stringify({
                success: 0,
                reason: err.message
            }));
        } else {
            response.send(JSON.stringify({
                tests: list,
                success: 1
            }));
        }
    });
}

export function getImage(request: express.Request, response: express.Response) {
    appGetServices.getBinaryData((err, result) => {
        response.type('json');
        response.end(JSON.stringify({
            id: 1,
            title: 'Um carrinho bonito',
            image: result.toString('base64'),
            success: 1
        }));

        //response.end(result);
    });
}

export function postImage(request: express.Request, response: express.Response) {

    var correctId: string = request.body['correct-id'];

    // Read the file
    fs.readFile(request.files[correctId].path, (err, data) => {
        appPostServices.sendBinaryDataToDb(data, (err) => {
            if (err) {
                console.log(err);
            }

            response.end('Whatever');
        });
    });

    

    console.log(correctId);

    console.log(request.files[correctId]);   
}

export function teste(request: express.Request, response: express.Response) {
    console.log(request.url);

    response.render('teste', {
        title: "Isto é um teste",
        pessoa: "André Carvalho"
    });
}

export function getTest(request: express.Request, response: express.Response) {

    if (request.query.hasOwnProperty('id')) {
        var idListAsString: string[] = request.query['id'].split(',');
        var idList = [];

        for (var i = 0; i < idListAsString.length; i++) {
            var id = parseInt(idListAsString[i]);

            if (!isNaN(id)) {
                idList.push(id);
            }
        }

        if (idList.length == 0) {
            response.statusCode = 400;
            response.end('No valid id supplied.');
        }

        appGetServices.getTestById(idList, (err, testList) => {
            var sendResult = {
                tests: testList,
                success: 1
            };

            response.end(JSON.stringify(sendResult));
        });
    } else {
        response.statusCode = 400;
        response.end("No id supplied.");
    }
}

export function postTestResults(request: express.Request, response: express.Response) {
    appPostServices.saveTestsToDb(request.body, (err) => {
        if (err) {
            response.statusCode = 500;
            console.log(err.message);

            response.end(JSON.stringify({
                success: 0
            }));
        } else {
            response.end(JSON.stringify({
                success: 1
            }));
        }
    });
}