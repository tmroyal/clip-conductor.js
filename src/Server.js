function Server(){ }

Server.prototype.loadFile = function(filename){
  return new Promise(function(resolve, reject){
    var request = new XMLHttpRequest();
    request.open('GET', filename);
    request.responseType = 'arraybuffer';
    request.send();

    request.onreadystatechange = function(){
      if (request.readyState == 4){
        if (request.status === 200){
          resolve(request.response);
        } else {
          reject(
            new Error('Server error with status: '+request.status)
          );
        }
      }
    }

  });
};

module.exports = Server;
