const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.json());

const dataFilePath = './data.json';

// GET /acronym
app.get('/acronym', (req, res) => {
  console.log('hello');
  const { page = 1, limit = 10, search } = req.query;
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  let result = data;
  if (search) {
    const regex = new RegExp(search, 'i');
    result = data.filter(acronym => regenpmx.test(acronym.acronym) || regex.test(acronym.definition));
  }
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const paginatedResult = result.slice(startIndex, endIndex);
  res.set('X-Total-Count', result.length);
  res.set('X-Page-Number', page);
  res.set('X-Page-Size', limit);
  res.set('X-Has-More', endIndex < result.length);
  res.json(paginatedResult);
});

// POST /acronym
app.post('/acronym', (req, res) => {
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const newAcronym = {
    _id: Date.now().toString(),
    acronym: req.body.acronym,
    definition: req.body.definition
  };
  data.push(newAcronym);
  fs.writeFileSync(dataFilePath, JSON.stringify(data));
  res.status(201).json(newAcronym);
});

// PATCH /acronym/:acronymID
app.patch('/acronym/:acronymID', (req, res) => {
  const acronymID = req.params.acronymID;
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const index = data.findIndex(acronym => acronym._id === acronymID);
  if (index === -1) {
    res.status(404).send(`Acronym with ID ${acronymID} not found.`);
  } else {
    console.log(req.body);
    const updatedAcronym = {
      ...data[index],
      acronym: req.body.acronym || data[index].acronym,
      definition: req.body.definition || data[index].definition
    };
    data[index] = updatedAcronym;
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
    res.json(updatedAcronym);
  }
});

// DELETE /acronym/:acronymID
app.delete('/acronym/:acronymID', (req, res) => {
  const acronymID = req.params.acronymID;
  const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
  const index = data.findIndex(acronym => acronym._id === acronymID);
  if (index === -1) {
    res.status(404).send(`Acronym with ID ${acronymID} not found.`);
  } else {
    data.splice(index, 1);
    fs.writeFileSync(dataFilePath, JSON.stringify(data));
    res.status(204).send();
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
