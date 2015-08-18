describe('Scheduler', function(){
  var Scheduler = require('./Scheduler');
  var scheduler;
  var nop = function(){ return true;};

  beforeEach(function(){
    scheduler = new Scheduler(nop, nop);
  });

  describe('on', function(){
    it('should add message name and file handle to events', 
      function(){
        var fileInfo = { handle: 'sound' };
        scheduler.on('test', fileInfo);
        scheduler.events['test'].should.contain('sound');
      }
    );

    it('should append new events of the same name', function(){
      var fi1 = { handle: 'test1'};
      var fi2 = { handle: 'test2'};
      
      scheduler.on('test', fi1);
      scheduler.on('test', fi2);

      scheduler.events.test.should.contain('test1');
      scheduler.events.test.should.contain('test2');
    });

    it('should work with string handles', function(){
      scheduler.on('test','handle');
      scheduler.events.test.should.contain('handle');
    });

    it('should error on failed verification', function(){
      var verifier = function(){ return false; };
      scheduler = new Scheduler(null, verifier);
      expect(function(){
        scheduler.on('test','handle');
      }).to.throw(  
        'ClipConductor.Scheduler: cannot verify handle: handle'
      );
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
      scheduler.events.test.should.not.contain('test');
    });

    it('should do nothing if no events matching name', function(){
      var nonMatching = { handle: 'nonMatching'};
      scheduler.off('test', nonMatching);  
      scheduler.events.test.should.contain('test1');
    });

    it('should do nothing if no events matching event', function(){
      scheduler.off('nonMatching', fileInfo);  
      scheduler.events.test.should.contain('test1');
    });

    it('should do nothing if fileInfo undefined', function(){
      scheduler.off('test');  
      scheduler.events.test.should.contain('test1');
    });
    
  });

  describe('trigger', function(){
    var spy, fileInfo;

    beforeEach(function(){
      spy = sinon.spy();
      scheduler = new Scheduler(spy, nop);
      fileInfo = { handle: 'test' };

      scheduler.on('testMsg', fileInfo);
    });

    it('should call trigger with registered fileInfo', 
      function(){
        scheduler.trigger('testMsg');
        spy.calledWith('test').should.be.true;
      }
    );

    it('should call trigger with time of zero', 
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
          spy.calledWith('test').should.be.true;
          spy.calledWith('test2').should.be.true;
       }
    );

    it('should not call subscription if no matching events', 
      function(){
        scheduler.trigger('nonEvent');
        spy.calledWith('test').should.be.false;
      }
    );

  });

});
