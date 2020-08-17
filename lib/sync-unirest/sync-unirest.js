//const sync = require('synchronize');

const nextTick = [global.setImmediate, process.nextTick, function(cb) {
    setTimeout(cb, 0);
}].find((x) => {
    return x !== undefined;
});

const syncunirest = (function() {

    /**
     * Unirest does not comply with node-style call backs.
     * 	i.e. (err, result) => {}
     * This function is to coerce Unirest into playing nicely with synchronize
     * @return {[type]} [description]
     */
    const defer = () => {
        ensureFiberState(null); //disable to remove dependencies on sychronize and fibers@1.0.13
        
        //const fiber = sync.Fiber.current;
        //ensureFiberState(fiber);
        fiber._defered = true;
        let called = false;
        return (response) => {
            const {error, body} = response;
            if (called) {
                throw new Error('defer cannot be used twice!');
            }
            called = true;
            nextTick(() => {
                if (error) {
                    fiber.throwInto(error);
                } else {
                    fiber.run(body);
                }
            });
        };
    };

    /**
     * ensureFiberState - quick and dirty fiber checking.
     *                    1. That fiber exists.
     *                    2. That this fiber was not previously deferred.
     *
     * @param  {type} fiber the fiber to check.
     * @return {Void}
     */
    function ensureFiberState(fiber) {
        if (!fiber) {
            throw new Error("No current Fiber, defer can't be used without Fiber!");
        }
        if (fiber._defered) {
            throw new Error("invalid usage, should be clear previous defer!");
        }
    }

    return {
        defer: defer
    };
}());

module.exports = syncunirest;
