/**
 * Simple communication with server.
 * @class
 */
function Server(){}

/**
 * Request a file with the given name.
 * @method loadFile
 *
 * @param {String} filename url path of the file
 *
 * @returns {Promise.<arraybuffer,Error>} Promise returns an array buffer if resolved
 *          or an error if there is a network error
 */
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
    };
  });
};

module.exports = Server;
