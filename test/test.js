var should = require('should');
var request = require('supertest');
var app = require('./routes/index');

describe('Routing', function() {
  it('should return information of the one post', function(done) {
    var id = 1;
    request(app)
      .get('/api/1/posts/:id')
      .expect(200)
      .expect('Content-Type', /json/)
      .end(function(err, res) {
        if (err) {
          return done(err);
        } else {
          res.status.should.equal(200);
          // res.body.success.should.equal(0);
          // res.body.should.be.instanceof(Array);
          done();
        }
      })
  });
});

/*

const zbEmailVerifier = require('./../index');

describe('#verify()', function() {
  it('should return "EXIST" data', function(done) {
    zbEmailVerifier.verify({
      helo: 'zigbang.com',
      from: 'cs@zigbang.com',
      to: 'cs@zigbang.com',
      debug: true
    }).then(result => {
      if(result === 'EXIST') {
      done();
    } else {
      done(result);
    }
  });
  });

  // EXIST
  // NOT_EXIST
  // INVALID
  // BLOCK
});
*/
