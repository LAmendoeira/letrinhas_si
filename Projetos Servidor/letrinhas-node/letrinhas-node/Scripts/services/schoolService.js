﻿var pool = require('../../configs/mysql');
var Q = require('q');
var mysql = require('mysql');
var uuid = require('node-uuid');
var path = require('path');
var mv = require('mv');
var app = require('../../app');

var poolQuery = Q.nbind(pool.query, pool);

function all() {
    return poolQuery('SELECT * FROM Schools').then(function (results) {
        return results[0];
    });
}
exports.all = all;

function details(id) {
    return poolQuery(mysql.format('SELECT * FROM Schools WHERE id = ?', [id])).then(function (results) {
        if (results[0].length === 0) {
            return Q.resolve(null);
        }

        return results[0][0];
    });
}
exports.details = details;

function createSchool(s, uploadedFilePath) {
    // eg: appContent/Schools/uuid/logo.jpg
    var filePath = path.join('appContent/Schools', uuid.v4(), 'logo' + path.extname(uploadedFilePath)).replace(/\\/g, '/');

    var sql = mysql.format("Insert Into Schools(`schoolAddress`,`schoolLogoUrl`,`schoolName`) VALUES(?,?,?)", [s.schoolAddress, filePath, s.schoolName]);

    return Q.nfcall(mv, uploadedFilePath, path.join(app.rootDir, filePath), { mkdirp: true }).then(function (_) {
        return poolQuery(sql);
    });
}
exports.createSchool = createSchool;

function getAllSchools(onResult) {
    //realiza a query
    pool.query("SELECT * from Schools;", function (err, rows, fields) {
        if (err) {
            onResult(err, null);
        } else {
            var result = [];
            for (var i = 0; i < rows.length; i++) {
                result.push({
                    id: rows[i].id,
                    name: rows[i].schoolName,
                    address: rows[i].schoolAddress,
                    photo: rows[i].schoolLogoUrl
                });
            }
        }
        return onResult(null, result);
    });
}
exports.getAllSchools = getAllSchools;
exports.getAllSchools = exports.getAllSchools;

function getId(onResult) {
    //realiza a query
    pool.query("SELECT id, schoolName from Schools;", function (err, rows, fields) {
        if (err) {
            onResult(err, null);
        } else {
            var result = [];
            for (var i = 0; i < rows.length; i++) {
                result.push({
                    id: rows[i].id,
                    name: rows[i].schoolName
                });
            }
        }
        return onResult(null, result);
    });
}
exports.getId = getId;
exports.getAllSchools = exports.getAllSchools;
//# sourceMappingURL=schoolService.js.map
