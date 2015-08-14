describe('Scheduler', function(){
  var Scheduler = require('./Scheduler');
  var scheduler;
  beforeEach(function(){
    scheduler = new Scheduler();
  });

  describe('observe', function(){
    it('should add callback to list of subscriptions', function(){
      var func = function(){};
      scheduler.observe(func);
      scheduler.subscriptions.should.contain(func);
    });
  });
  
  describe('on', function(){

    it('should add message name and file info to recognizedEvents', 
      function(){
        var fileInfo = { handle: 'test' };
        scheduler.on('test', fileInfo);
        scheduler.recognizedEvents.test.should.contain(fileInfo);
      }
    );

    it('should append new events of the same name', function(){
      var fi1 = { handle: 'test1'};
      var fi2 = { handle: 'test2'};
      
      scheduler.on('test', fi1);
      scheduler.on('test', fi2);

      scheduler.recognizedEvents.test.should.contain(fi1);
      scheduler.recognizedEvents.test.should.contain(fi2);
    });
  });

  describe('off', function(){
    var fileInfo;

    beforeEach(function(){
      fileInfo = { handle: 'test1'};
      scheduler.on('test', fileInfo);
    });

    it('should remove matching event from list', function(){
      scheduler.off('test', fileInfo);  
      scheduler.recognizedEvents.test.should.not.contain(fileInfo);
    });

    it('should do nothing if no events matching name', function(){
      var nonMatching = { handle: 'nonMatching'};
      scheduler.off('test', nonMatching);  
      scheduler.recognizedEvents.test.should.contain(fileInfo);
    });

    it('should do nothing if no events matching event', function(){
      scheduler.off('nonMatching', fileInfo);  
      scheduler.recognizedEvents.test.should.contain(fileInfo);
    });

    it('should do nothing if fileInfo undefined', function(){
      scheduler.off('test');  
      scheduler.recognizedEvents.test.should.contain(fileInfo);
    });
    
  });

  describe('trigger', function(){
    var spy, fileInfo;

    beforeEach(function(){
      spy = sinon.spy();
      scheduler.observe(spy);    
      fileInfo = { handle: 'test' };
      scheduler.on('testMsg', fileInfo);
    });

    it('should call subscription with registered fileInfo', 
      function(){
        scheduler.trigger('testMsg');
        spy.calledWith(fileInfo).should.be.true;
      }
    );

    it('should call subscription with time of zero', 
      function(){
        scheduler.trigger('testMsg');
        spy.args[0][1].should.equal(0);
      }
    );

    it('should call subscription multiple times if multiple files'+
       'assigned to same message', function(){
          var fileInfo2 = { handle: 'test2' };
          scheduler.on('testMsg', fileInfo2);
          scheduler.trigger('testMsg');
          spy.calledWith(fileInfo).should.be.true;
          spy.calledWith(fileInfo2).should.be.true;
       }
    );

    it('should not call subscription if no matching events', 
      function(){
        scheduler.trigger('nonEvent');
        spy.calledWith(fileInfo).should.be.false;
      }
    );


  });

});
