const mongooes = require('mongoose');

const CataSchema = mongooes.Schema({
    name: String,
});
module.exports = Catalog = mongooes.model('catalog', CataSchema);
