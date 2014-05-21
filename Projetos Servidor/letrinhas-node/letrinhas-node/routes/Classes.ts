﻿/*
 * Routes related to classes.
 */

import express = require('express');

import service = require('../Scripts/services/classService');
import Class = require('../Scripts/structures/schools/Class');
import schoolService = require('../Scripts/services/schoolService');

export function mapRoutes(app: express.Express) {
    app.get('/Classes/All', function (req, res) {
        service.all()
            .then((classes) => res.json(classes))
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 500 })
            });
    });

    console.log('GET /Classes/All ->', service.all);

    app.get('/Classes/Details/:id', function (req, res) {
        var id = parseInt(req.params.id, 10);

        if (isNaN(id)) { res.status(400).json({ error: 400 }); }

        service.details(id)
            .then((classDetails) => {
                if (classDetails === null) { return res.status(404).json({ error: 404 }); }

                res.json(classDetails);
            })
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 500 })
            });
    });

    app.get('/Classes/Students/:id', function (req, res) {
        throw 'NYI';
        // TODO
    });

    app.all('/Classes/Create', function (req, res) {
        switch (req.method) {
            case 'GET':
                return res.render('addClass');
            case 'POST':
                // TODO: Meter dados na BD.
                var body = req.body;
                var sClass = <Class> {
                    schoolId: body.schoolId,
                    classLevel: body.year_filter,
                    className: body.className,
                    classYear: body.classYear
                };

                service.createClass(sClass)
                    .then((_) => res.end('Dados inseridos com sucesso!'))
                    .catch((err) => {
                        console.error(err);
                        res.status(500).json({ error: 500 })
                    });
                break;
            default:
                res.status(404).json({ error: 404 });
        }
    });

    console.log('GET + POST /Classes/Create ->', service.createClass);

    app.get('/Classes/Professors/:id?', function (req, res) {
        var id;

        if (typeof req.params.id !== 'undefined') {
            id = parseInt(req.params.id);

            if (isNaN(id)) { return res.status(400).end({ error: 400 }); }
        }

        service.professors(id)
            .then((professors) => res.json(professors))
            .catch((err) => {
                console.error(err);
                res.status(500).json({ error: 500 })
            });
    });

    console.log('GET /Classes/Professors ->', service.professors);

    app.get('/Classes/Choose', function (req, res) {
        return res.render('classChoose');
    });

    app.get('/Classes/bySchool', function (req, res) {
        schoolService.getId(function (err, result) {
            res.render('classBySchool', {
                title: 'Lista id e nomes',
                items: result
            });
        });
    });

    app.get('/Classes/GetAll/:id?', function (req, res) {
        var id = parseInt(req.params.id, 10);
        switch (id) {
            case 1:
                service.getAllClasses(function (err, result) {
                    res.render('classList', {
                        title: 'Lista de Turmas de todas as Escolas',
                        items: result
                    });
                });
            case 2:
                service.getClassBySchoolId(req.query.classSelect, function (err, result) {
                    res.render('classList', {
                        title: 'Lista de Turmas da escola '+result.schoolName,
                        items: result
                    });
                });

        }
       
    });


}