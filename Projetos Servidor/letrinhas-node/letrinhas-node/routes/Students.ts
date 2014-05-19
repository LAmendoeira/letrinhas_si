﻿import express = require('express');

import service = require('../Scripts/services/studentService');
import Student = require('../Scripts/structures/schools/Student');

export function mapRoutes(app: express.Express) {
    app.get('/Students/All', function (req, res) {
        service.all()
            .then((students) => res.json(students))
            .catch((_) => res.status(500).end({ error: 500 }));
    });

    app.get('/Students/Details/:id', function (req, res) {
        var id = parseInt(req.params.id);

        if (isNaN(id)) { res.status(400).json({ error: 400 }); }

        service.details(id)
            .then((student) => {
                if (student === null) { return res.status(404).json({ error: 404 }); }

                res.json(student);
            })
            .catch((_) => res.status(500).json({ error: 400 }));
    });

    console.log('GET /Students/All ->', service.details);

    app.all('/Students/Create', function (req, res) {
        switch (req.method) {
            case 'GET':
                return res.render('addStudent');
            case 'POST':

                // TODO: Meter dados na BD.
                var body = req.body;

                var aluno = <Student> {
                    classId: parseInt(body.txtIdEscola),
                    name: body.txtName,
                    isActive: body.state_filter,
                };

                service.create(aluno, req.files.photo.path)
                    .then((_) => res.end('Dados inseridos com sucesso!'))
                    .catch((err) => res.end('error: ' + err.toString()));

            default:
                res.status(404).json({ error: 404 });
        }
    });

    console.log('GET + POST /Students/Create ->', service.create);

    app.all('/Students/Edit/:id', function (req, res) {
        // TODO
        throw 'NYI';

        switch (req.method) {
            case 'GET':
                break;
            case 'POST':
                break;
            default:
                break;
        }
    });

    console.warn('GET + POST /Students/Edit ->', 'NYI');
}