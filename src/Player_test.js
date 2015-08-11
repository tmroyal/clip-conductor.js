var Player = require('./Player');
var mockScheduler, mockAudioContext, mockRequestObject;


describe('Player', function(){
  it('should subscribe to scheduler');
  it('should play file at time specified by scheduler');
  it('should load given files');
  // TODO reconsider this behavior
  it('should reattempt to load given files on failure');
  it('should call a callback as files load');
  it('should call a callback when file has completely loaded');
});
