var mongoAdapter = require('sails-mongo');
module.exports = {
    adapters: {
        'default': mongoAdapter,
        'mongo': mongoAdapter
    },
    connections: {
        'default': {
            adapter: 'default',
            host: 'localhost',
            port: 27017,
            database: 'wab3'
        }
    }
}
