const neo4j = require('neo4j-driver').v1
const axis = require('axislang')
const data = require('./eprints-articles.json')

console.log(data[0])
const divisions = getUniques('divisions')
const funders = getUniques('funders')
const keywords = getUniques('keywords')
const publisher = getUniques('publisher')
const publication = getUniques('publication')

function getUniques(key) {
    return new Set(axis.parse('divisions', data))
}

async function setup() {
    const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "123456"));
    const session = driver.session()
    const queries = [
        'CREATE CONSTRAINT ON (d:DIVISION) ASSERT d.name IS UNIQUE',
        'CREATE CONSTRAINT ON (d:FUNDER) ASSERT d.name IS UNIQUE',
        'CREATE CONSTRAINT ON (d:AUTHOR) ASSERT d.name IS UNIQUE',
        'CREATE CONSTRAINT ON (d:PUBLISHER) ASSERT d.name IS UNIQUE',
        'CREATE CONSTRAINT ON (d:PUBLICATION) ASSERT d.name IS UNIQUE',
        'CREATE CONSTRAINT ON (d:PAPER) ASSERT d.name IS UNIQUE',
    ]
    try{
        for(query of queries) {
            const response = await session.run(query)
            console.log(response.summary.statement.text)
        }
    }catch(e) {
        console.error(e)
    }
    session.close()
    driver.close()
}
async function loadUniques(arr, label) {
    const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "123456"));
    const session = driver.session()
    for(item of [...arr]) {
        console.log('Creating', label, item)
        try {
        await session.run(`CREATE (n:${label} {name: {name}})`, {
            name:item,
        })
        }catch(e){
            console.error(e)
        }
    }
    session.close()
    driver.close()
}
setup()
console.log(divisions.size)
loadUniques(divisions, 'DIVISION')
loadUniques(funders, 'FUNDER')
loadUniques(keywords, 'KEYWORD')
loadUniques(funders, 'PUBLISHER')
loadUniques(keywords, 'PUBLICATION')

addTheData()

async function addTheData() {
    const driver = neo4j.driver("bolt://localhost", neo4j.auth.basic("neo4j", "123456"));
    const session = driver.session()
    for(item of data) {
        console.log('Creating', 'paper', item.title)
        try {
            await session.run(`
            CREATE (n:PAPER {name: {name}})`, {
                name:item.title,
            })
            for(division of item.divisions) {
                await session.run(`
                MATCH (d:DIVISION {name:{div}}), (n:PAPER {name: {name}})
                CREATE (n)-[r:RELATED_TO]->(d)`, {
                    name:item.title,
                    div: division
                })
            }
            for(funder of item.funders) {
                await session.run(`
                MATCH (d:FUNDER {name:{div}}), (n:PAPER {name: {name}})
                CREATE (n)-[r:FUNDED_BY]->(d)`, {
                    name:item.title,
                    div: funder
                })
            }
            for(keyword of item.keywords) {
                await session.run(`
                MATCH (d:KEYWORD {name:{div}}), (n:PAPER {name: {name}})
                CREATE (n)-[r:RELATED_TO]->(d)`, {
                    name:item.title,
                    div: keyword
                })
            }
            await session.run(`
            MATCH (d:PUBLISHER {name:{div}}), (n:PAPER {name: {name}})
            CREATE (n)-[r:PUBLISHED_BY]->(d)`, {
                name:item.title,
                div: item.publisher
            })
            await session.run(`
            MATCH (d:PUBLICATION {name:{div}}), (n:PAPER {name: {name}})
            CREATE (n)-[r:IN_PUBLICATION]->(d)`, {
                name:item.title,
                div: item.publication
            })
        }catch(e){
            console.error(e)
        }
    }
    session.close()
    driver.close()
}
