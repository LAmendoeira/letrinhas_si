/*
 * Routes related to tests.
 */
import pool = require('../../configs/mysql');
import Q = require('q');
import mysql = require('mysql');
import path = require('path');
import uuid = require('node-uuid');
import app = require('../../app');
import mv = require('mv');

var poolQuery = Q.nbind<any>(pool.query, pool);

import Test = require('../structures/tests/Test');
import ReadingTest = require('../structures/tests/ReadingTest');
import MultimediaTest = require('../structures/tests/MultimediaTest');

import TestType = require('../structures/tests/TestType');
import TestCorrection = require('../structures/tests/TestCorrection');
import ReadingTestCorrection = require('../structures/tests/ReadingTestCorrection');
import MultimediaTestCorrection = require('../structures/tests/MultimediaTestCorrection');

// GET: /Tests/All/
// Params: 
// -ofType=[0, 1, 2, 3]
// -areaId
// -grade
// -professorId
// -creationDate
export function all(ofType: number, options?: { areaId?: number; grade?: number; professorId?: number; creationDate?: number }): Q.Promise<Array<Test>> {
    var parameters = [];

    if (typeof options.areaId !== 'undefined') { parameters.push({ name: 'areaId', value: options.areaId }); }
    if (typeof options.grade !== 'undefined') { parameters.push({ name: 'grade', value: options.grade }); }
    if (typeof options.professorId !== 'undefined') { parameters.push({ name: 'professorId', value: options.professorId }); }

    // Build the sql query.
    var where = 'WHERE t.type = ' + ofType;

    for (var i = 0; i < parameters.length; i += 1) {
        where += ' AND t.' + parameters[i].name + ' = ' + parameters[i].value;
    }

    if (options.creationDate) {
        where += ' AND t.creationDate > ' + options.creationDate;
    }

    switch (ofType) {
        case TestType.read:
        /* falls through */
        case TestType.list:
        /* falls through */
        case TestType.poem:
            return poolQuery('select t.id, t.type, t.professorId, t.title, t.mainText, t.creationDate, t.grade, t.areaId, rt.professorAudioUrl, rt.textContent from Tests as t join ReadingTests as rt on rt.id = t.id ' + where)
                .then<Array<Test>>((result) => result[0]);
        case TestType.multimedia:
            return poolQuery('SELECT t.id, t.type, t.professorId, t.title, t.mainText, t.creationDate, t.grade, t.areaId, mt.questionContent, mt.contentIsUrl, mt.option1, mt.option1IsUrl, mt.option2, mt.option2IsUrl, mt.option3, mt.option3IsUrl, mt.correctOption FROM Tests AS t JOIN MultimediaTests AS mt ON mt.id = t.id ' + where)
                .then<Array<Test>>((result) => result[0]);
            break;
        default:
            return Q.reject('Unknown test type.');
    }
}

/**
 * Devolve uma lista de testes multimédia, escolhidos aleatóriamente a partir da db.
 * Portado por @redroserade para usar promises.
 * 
 * @author luisfmoliveira
 */
export function random(options: { area: number; year: number; num?: number }): Q.Promise<Array<MultimediaTest>> {

    if (isNaN(options.area) || isNaN(options.year)) { return Q.reject('Invalid area or grade. They must be numbers.'); }

    var sql = 'SELECT t.id, t.type, t.professorId, t.title, t.mainText, t.creationDate, t.grade, t.areaId, mt.questionContent, mt.contentIsUrl, mt.option1, mt.option1IsUrl, mt.option2, mt.option2IsUrl, mt.option3, mt.option3IsUrl, mt.correctOption FROM Tests AS t JOIN MultimediaTests AS mt ON mt.id = t.id WHERE t.areaId = ' + options.area + ' AND t.grade = ' + options.year;

    console.log(sql);

    return poolQuery(sql)
        .then((results) => {
            var tests: Array<MultimediaTest> = results[0],
                aux, i, rnd,
                result = new Array<MultimediaTest>();

            //Caso o numero de perguntas que o professor quer, sobre um tema, seja igual ou superior as que existem na BD, devolve todas. Pode-se alterar por uma 
            //mensagem de erro. Fica para se decidir
            if (options.num >= tests.length) { return tests; }

            aux = 0;

            //vamos criar um teste de num perguntas random. Basicamente estou a ver quantos registos o select devolveu
            //Depois gero um numero random entre 1 e o numero de linhas
            //e devolve a pergunta que tiver o id que o random gerou (não sei se é a melhor forma...mas funciona)
            //a variavel aux é um "truque", que compara o random com o random anterior, para evitar que existam perguntas repetidas
            //caso o random seja igual ao anterior, o indice do ciclo for é "anulado", para se evitar que, imaginem 4 perguntas, 3 random eram iguais, então só ia ser devolvida uma pergunta
            //é capaz de ser confuso, sorry :S   
            for (i = 1; i <= options.num; i += 1) {
                rnd = Math.floor((Math.random() * tests.length) + 1);

                if (rnd !== aux) {
                    result.push(tests[rnd - 1]);
                    aux = rnd;
                } else {
                    i = i - 1;
                }
            }

            return result;
        });
}

// GET: /Tests/Details/:id
export function details(id: number): Q.Promise<Test> {

    return poolQuery({ sql: 'CALL getTestById(?)', nestTables: false }, id)
        .then((result) => {
            // Return a 404 if no tests were found.
            if (result[0][0].length === 0) {
                return Q.resolve(null);
            }

            // Return a single test.
            return Q.resolve(result[0][0][0]);
        });
}

// POST: /Tests/Create/Read
export function createReadTest(t: ReadingTest, uploadedFilePath: string): Q.Promise<void> {
    // eg: appContent/Tests/uuid/demo.mp3
    var filePath = path.join('appContent/Tests', uuid.v4(), 'demo' + path.extname(uploadedFilePath)).replace(/\\/g, '/');

    var sql = mysql.format("CALL insertReadingTest(?,?,?,?,?,?,?,?,?)", [t.areaId, t.professorId, t.title, t.mainText, t.creationDate, t.grade, t.type, t.textContent, filePath]);

    console.log(sql);

    return Q.nfcall(mv, uploadedFilePath, path.join(app.rootDir, filePath), { mkdirp: true })
        .then((_) => poolQuery(sql));
}


export function saveMultimediaTest(teste: MultimediaTest): Q.Promise<void> {

    return Q.reject('Ainda nao está implementado!');

}

// GET + POST: /Tests/Edit/:id
export function edit(id: number) {
    throw 'NYI';
}

// POST: /Tests/Submit/:id
export function submitResult(tc: TestCorrection, filePath?: string): Q.Promise<void> {

    var args: Array<any> = [
        tc.testId,
        tc.studentId,
        tc.executionDate
    ];

    switch (tc.type) {
        case TestType.read:
        /* falls through */
        case TestType.list:
        /* falls through */
        case TestType.poem:
            var rtc = <ReadingTestCorrection> tc,
                // eg: appContent/Tests/1/Submissions/2/timestamp.mp3
                newPath = null;

            if (typeof filePath !== 'undefined') {
                newPath = path.join('appContent', 'Tests',
                    tc.testId, 'Submissions',
                    tc.studentId,
                    tc.executionDate + path.extname(filePath)).replace(/\\/g, '/');
            }

            args.concat([
                newPath,
                rtc.professorObservations,
                rtc.wordsPerMinute,
                rtc.correctWordCount,
                rtc.readingPrecision,
                rtc.readingSpeed,
                rtc.expressiveness,
                rtc.rhythm,
                rtc.details,
                rtc.wasCorrected,
                rtc.type
            ]);

            var sql = mysql.format('CALL insertReadingTestCorrection(?,?,?,?,?,?,?,?,?,?,?,?,?,?)', args);

            // Only save the file if it exists.
            // TODO: Check if we have SOMETHING in the DB, in case the file is sent twice.
            if (newPath !== null) {
                return Q.nfcall(mv, path.join(app.rootDir, newPath), { mkdirp: true })
                    .then((_) => poolQuery(sql));
            } else {
                return poolQuery(sql);
            }
        case TestType.multimedia:
            var mtc = <MultimediaTestCorrection> tc;

            args.concat([
                mtc.optionChosen,
                mtc.isCorrect
            ]);

            var sql = mysql.format('CALL insertMultimediaTestCorrection(?,?,?,?,?)', args);

            return poolQuery(sql);
        default:
            return Q.reject('Unknown type.');
    }
}