module.exports = {
    model : {
        identity: 'user',
        connection: 'default',
        migrate: 'alter',
        attributes: {
            login: 'string',
            password: 'string',
            remember_token: 'string'
        }
    }
};
