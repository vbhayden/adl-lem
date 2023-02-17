const mom = require("tla-mom-proto");
const resolve = require("./resolution/resolve");
const xapi = require("./resolution/xapi");

/**
 * For the sake of this resolution, we only really care about starting / completion
 * relevant statements coming from an LRP.  These will all be things that are 
 * sent by the LRP which need to have their context adjusted to speak to entries
 * in the Experience Index.
 */
const relevantVerbs = [
    mom.verbs.initialized.id,
    mom.verbs.passed.id,
    mom.verbs.failed.id,
    mom.verbs.completed.id
]

module.exports = async(topic, offset, message) => {

    let statement = null;
    try {
        statement = JSON.parse(message);
        console.log("[Resolver] Received statement: ", statement.id)
    } catch (err) {
        return console.error("[Resolver] Statement Parsing Error: ", topic, offset, message)
    }

    if (!xapi.validStatement(statement) || !relevantVerbs.includes(statement.verb.id))
        return

    // Get any experiences relevant to this statement
    let experiences = await resolve.relevantExperiences(statement)
    if (Array.isArray(experiences)) {

        let sourceId = statement.id
        
        // Convert this statement into a derivation, removing some properties
        // and assigning a context extension to indicate that this is a derivative
        // statement.
        //
        // This extension is just a simple object containing the original statement's
        // ID and the original authority under which the statement was processed.
        //
        let derivation = xapi.asDerivation(statement)
        let derivations = experiences.map(exp => {
            return {
                ...derivation,
                object: {
                    ...derivation.object,
                    id: exp.handle
                }
            }
        })

        let ids = await xapi.sendStatements(derivations)
        if (Array.isArray(ids))
            console.log(`[Resolver] Sent statements for ${sourceId}: \n  -`, ids.join("\n  -"))
        else {
            console.log(`[Resolver] Problem with statement ${sourceId}`)
            console.log(`[Resolver] Linked Experiences:\n\t-${experiences.join("\n\t-")}`)
        }
    }
};