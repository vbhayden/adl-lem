const mom = require("tla-mom-proto");
const kafkaConsumer = require("simple-kafka-consumer");
const kafkaProducer = require("simple-kafka-producer");

const config = require("../config");
const filters = require("./filters")

function produce (statement, topic, callback) {
    kafkaProducer.produceMessage(topic, statement);
    callback(statement, topic);
}

module.exports = function (noisyMessage) {

    let statement = null;
    try {
        statement = JSON.parse(noisyMessage);
    } catch (err) {
        return console.error("[Mail] Statement Parsing Error: ", topic, offset, message);
    }

    if (!statement.verb)
        return;

    if (filters.isAuthoritative(statement)) 
        produce(statement, config.sortingTopics.authoritative, callback);

    else if (filters.isResolution(statement))
        produce(statement, config.sortingTopics.transactional, callback);

    else if (filters.needsResolution(statement)) 
        produce(statement, config.sortingTopics.resolvePending, callback);

    else if (filters.isRelevant(statement))
        produce(statement, config.sortingTopics.transactional, callback);

    else
        console.log("nothing for:", statement.verb);
};

