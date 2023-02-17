module.exports = {
    
    root: "/",
    secret: (process.env.API_SECRET || "some-long-secret"),

    xi: {
        endpoint: (process.env.XI_ENDPOINT || "https://xi.tla.adlnet.io/")
    },
    
    kafka: {
        brokers: (process.env.KAFKA_BROKER || [
            "kafka-server.adlnet.io:19092",
            "kafka-server.adlnet.io:29092",
            "kafka-server.adlnet.io:39092"
        ].join(",")),
        
        saslUser: (process.env.KAFKA_SASL_USER || "kafka-user"),
        saslPass: (process.env.KAFKA_SASL_PASS || "kafka-pass"),
        
        consumerGroup: (process.env.KAFKA_CONSUMER_GROUP || "mail-sorting"),
        topics: {
            noisy: (process.env.KAFKA_XAPI_NOISY || "noisy-xapi"),
            pending: (process.env.KAFKA_XAPI_PENDING || "resolve-pending"),
            transactional: (process.env.KAFKA_XAPI_TRANSACTIONAL || "transactional-xapi"),
            authoritative: (process.env.KAFKA_XAPI_AUTHORITATIVE || "authoritative-xapi")
        }
    },

    keycloak: {
        "realm": (process.env.KEYCLOAK_REALM || "tla"),
        "auth-server-url": (process.env.KEYCLOAK_ENDPOINT || "https://auth.adlnet.io/auth"),
        "ssl-required": "none",
        "resource": (process.env.KEYCLOAK_CLIENT || "default"),
        "public-client": true,
        "confidential-port": 0
    },
    
    retryMS: 5000,
}