﻿var service = require('../Scripts/services/testService');

function mapRoutes(app) {
    // GET + POST: /Tests/Create/Read
    app.all('/Tests/Create/Read', function (req, res) {
        switch (req.method) {
            case 'GET':
                return res.render('addReadingTest');
            case 'POST':
                var body = req.body;

                var teste = {
                    title: body.title,
                    grade: body.grade,
                    creationDate: Date.now(),
                    professorId: body.professorId,
                    areaId: body.areaId,
                    mainText: body.mainText,
                    textContent: body.textContent,
                    type: body.type
                };

                service.createReadTest(teste, req.files.audio.path).then(function (_) {
                    return res.redirect('/');
                }).catch(function (err) {
                    return res.status(500).json({ error: 500 });
                });
            default:
                // TODO: Talvez fazer uma view para 404, 500, etc.?
                res.status(404).json({ error: 404 });
        }
    });

    // GET: /Tests/All/
    // Params:
    // -ofType=[0, 1, 2, 3]
    // -areaId
    // -grade
    // -professorId
    // -creationDate
    app.get('/Tests/All', function (req, res) {
        var type = parseInt(req.query.type), options = Object.create(null), areaId = parseInt(req.params.areaId), grade = parseInt(req.params.grade), professorId = parseInt(req.params.professorId), creationDate = parseInt(req.params.creationDate);

        if (isNaN(type)) {
            return res.status(400).json({ error: 400 });
        }

        if (!isNaN(areaId)) {
            options.areaId = areaId;
        }
        if (!isNaN(grade)) {
            options.grade = grade;
        }
        if (!isNaN(professorId)) {
            options.professorId = professorId;
        }
        if (!isNaN(creationDate)) {
            options.creationDate = creationDate;
        }

        service.all(type, options).then(function (tests) {
            return res.json(tests);
        }).catch(function (_) {
            return res.status(500).json({ error: 500 });
        });
    });

    // GET: /Tests/Details/5
    app.get('/Tests/Details/:id', function (req, res) {
        var id = parseInt(req.params.id);

        if (isNaN(id)) {
            return res.status(400).json({ error: 400 });
        }

        service.details(id).then(function (test) {
            if (test === null) {
                return res.status(404).json({ error: 404 });
            }

            return res.json(test);
        }).catch(function (err) {
            return res.status(500).json({ error: 500 });
        });
    });
}
exports.mapRoutes = mapRoutes;
//# sourceMappingURL=Tests.js.map
