module.exports = {
    salt: 'vtr4hvgs',
    public_routes: [
        '/auth/login',
        '/auth/reset',
        '/auth/resetPassword',
    ],
    public_websocket_events: [
        'login',
        'getResetPasswordLink',
        'resetPassword'
    ]
}
