var Server = require('./Server');
var xhr, requests;
var server;
var backend;

beforeEach(function(){
  server = Server.new();

  xhr = sinon.useFakeXMLHttpRequest();

  requests = [];
  xhr.onCreate = function (req) { requests.push(req); };

});

afterEach(function(){
  xhr.restore();
});

describe('Server', function(){
  it('should make a request for a file', function(){
    var promise =  server.loadFile('testfile.mp3').then(function(){
      requests.length.should.equal(1);
      requests[0].url.should.equal('testfile.mp3');
      requests[0].responseType.should.equal('arraybuffer');
    });

    requests[0].respond();

    return promise;
  });

  it('should resolve promise on data', function(){
    var promise =  server.loadFile('testfile.mp3')
    .then(function(data){
      data.should.equal('audioData');
    });

    requests[0].respond(200,{},'audioData');
    return promise;
  });

  it('should return an error on error', function(){
    var errorRaised = false;
    var promise =  server.loadFile('testfile.mp3')
    .then(function(data){
      errorRaised = false;
    })
    .catch(function(){
      errorRaised = true;
    })
    .then(function(){
      errorRaised.should.be.true;
    });

    requests[0].respond(404);

    return promise;
  });
});
