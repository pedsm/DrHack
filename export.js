const neo4j = require('neo4j-driver').v1
const axis = require('axislang')
const fs = require('fs')



async function exportData() {
    const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "123456"));
    const session = driver.session()

    const results = await session.run('MATCH (n)-[]-() RETURN n')
    // results.records.map(convert)
    fs.writeFileSync('file.json', JSON.stringify(results.records.map(convert)))
    const links = await session.run('MATCH ()-[r]-() RETURN r')
    fs.writeFileSync('relationships.json', JSON.stringify(links.records.map(convertLink)))

    session.close()
    driver.close()
}

function convertLink(item) {
    return ({
        id: item.get('r').identity.low,
        source: item.get('r').start.low,
        target: item.get('r').end.low,
        type: item.get('r').type
    })

}
function convert(item) {
    return ({
        id: item.get('n').identity.low,
        name: item.get('n').properties.name,
        type: item.get('n').labels[0]
    })
}
exportData()
