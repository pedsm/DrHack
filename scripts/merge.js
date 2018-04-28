const nodes = require('./file.json')
const links = require('./relationships.json')
const fs = require('fs')

fs.writeFileSync('../data.json', JSON.stringify(
    {
        nodes,
        links
    }))
