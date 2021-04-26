// -- IMPORTS---
const express = require('express');
const bodyParser = require('body-parser');
const mysql2 = require('mysql2/promise');
const config = require('./config');
// -- IMPORTS---

// -- FUNCTIONS---
async function query(sql, params) {
    const conn = await mysql2.createConnection(config.db);
    const [result,] = await conn.execute(sql, params);
    return {
        'status': 'OK',
        'data': result
    };
}

async function createRegion(name, image) {
    const conn = await mysql2.createConnection(config.db);
    const result = await conn.query(
        'INSERT INTO regions (region_id, region_name, region_image) VALUES (null, ?, ?)',
        [name, image]
    );
    if (result[0].affectedRows) {
        return {
            'status': 'OK',
            'data': {
                "id": result[0].insertId
            }
        };
    } else {
        return {
            'status': 'ERROR',
            'data': {
                'name': name,
                'image': image,
                'rows': result,
            }
        };
    }
}

async function updateRegion(id, name, image) {
    const conn = await mysql2.createConnection(config.db);
    const result = await conn.query(
        'UPDATE regions SET region_name = ?, region_image = ? WHERE region_id = ?',
        [name, image, id]
    );
    if (result[0].affectedRows) {
        return {
            'status': 'OK',
            'data': {
                "affectedRows": result[0].affectedRows
            }
        };
    } else {
        return {
            'status': 'ERROR',
            'data': {
                'name': name,
                'image': image,
                'rows': result,
            }
        };
    }
}

async function deleteRegion(id) {
    const conn = await mysql2.createConnection(config.db);
    const result = await conn.query(
        'DELETE FROM regions WHERE region_id = ?',
        [id]
    );
    if (result[0].affectedRows) {
        return {
            'status': 'OK',
            'data': {
                "affectedRows": result[0].affectedRows
            }
        };
    } else {
        return {
            'status': 'ERROR',
            'data': {
                'rows': result,
            }
        };
    }
}

// -- FUNCTIONS---

// -- API---
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
        extended: true,
    })
);


// -- GET---
app.get('/', async function (req, resp, next) {
    resp.json({
        'message': "OK",
    });
    console.log("Listen root");
});

app.get('/regions', async function (req, resp, next) {
    try {
        resp.json(await query('SELECT * FROM regions'));
    } catch (error) {
        console.error('Error al traer las regiones', error.message);
        next(error);
    }
});
// -- GET ---

// -- POST---
app.post('/region', async function (req, res, next) {
    try {
        const body = req.body;
        res.json(await createRegion(body.name, body.image));
    } catch (error) {
        console.error('Error al crear una región', error.message);
        next(error);
    }
});
// -- POST---
// -- PUT---
app.put('/region/:id', async function (req, res, next) {
    try {
        const body = req.body;
        res.json(await updateRegion(req.params.id, body.name, body.image));
    } catch (error) {
        console.error('Error al actualizar una región', error.message);
        next(error);
    }
});
// -- PUT---
// -- DELETE---
app.delete('/region/:id', async function (req, res, next) {
    try {
        res.json(await deleteRegion(req.params.id));
    } catch (error) {
        console.error('Error al eliminar una región', error.message);
        next(error);
    }
});
// -- DELETE---

app.listen('3000', () => {
    console.log('API disponible en el puerto 3000');
});


// -- API---