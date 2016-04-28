module.exports = {
    adapters: {
        mongo: {
            module:'sails-mongo',
            host: 'localhost',
            port: 27017,            
            database: 'wab3'
        }
    },
    connections: {
        'default': {
            adapter: 'mongo',
        }
    }
}
