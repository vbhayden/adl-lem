const mom = require("tla-mom-proto");
const kafkaConsumer = require("simple-kafka-consumer");
const kafkaProducer = require("simple-kafka-producer");

const config = require("../config");

function onProduction (topic, offset, message) {
    if (process.env.NODE_ENV != "production")
        console.log(`[Kafka]: Produced message to ${topic} @ offset ${offset}`);
}

/**
 * @callback OnKafkaMessage
 * @param {string} message
 */
/** @type {OnKafkaMessage[]} */
const noisyListeners = [];

/** @type {OnKafkaMessage[]} */
const pendingListeners = [];

/** @type {OnKafkaMessage[]} */
const transactionalListeners = [];

/** @type {OnKafkaMessage[]} */
const authoritativeListeners = [];

/**
 * Relay a Kafka message to the relevant listeners.
 * @param {OnKafkaMessage[]} listeners 
 * @param {number} offset 
 * @param {string} message 
 */
function relay(listeners, message) {
    for (let listener of listeners) {
        listener(message);
    }
}

const listeners = {
    [config.kafka.topics.noisy]: noisyListeners,
    [config.kafka.topics.pending]: pendingListeners,
    [config.kafka.topics.transactional]: transactionalListeners,
    [config.kafka.topics.authoritative]: authoritativeListeners,
}

module.exports = {

    /**
     * Initialize the Kafka handler.
     * 
     * All listeners should be assigned ahead of time to prevent
     * the chance of a message being processed before its listener
     * was available.
     */
    init: () => {
        kafkaProducer.configure(config.kafka);
        kafkaConsumer.configure(config.kafka);

        kafkaProducer.setCallback(onProduction);

        kafkaProducer.initProducer();
        kafkaConsumer.initConsumer((topic, offset, message) => {

            if (listeners[topic] == undefined || !Array.isArray(listeners[topic]))
                return;

            relay(listeners[topic], message);
        });
    },

    /**
     * Add a listener for a given Kafka topic.
     * 
     * Will only assign listeners for valid Kafka topics.
     * @param {string} topic
     * @param {OnKafkaMessage} callback
     */
    addKafkaListener: ((topic, callback) => {

        if (listeners[topic] == undefined || !Array.isArray(listeners[topic]))
            return;

        listeners[topic].push(callback);
    }),

    /**
     * Produce a message into a given Kafka topic.
     * @param {string} topic
     * @param {Object} obj
     */
    produce: (topic, obj) => {
        kafkaProducer.produceMessage(topic, obj);
    },
}

