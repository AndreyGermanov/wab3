require('../lib/oop.js');
require('../lib/classes/web/auth.js');
describe('Auth class', function() {
    it('should create User_factory object', function(done) {
        Class.new('Auth','Auth',true);
        Objects['Auth'].configure();
        if (Objects['User_factory']) {
            done();
        } else {
            done(new Error('Could not create object'));
        }
    })
})
