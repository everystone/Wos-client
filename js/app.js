var app = angular.module('wos-client', ['btford.socket-io']);

//Services
/* Socket factory */
app.factory('chatSocket_old', function (socketFactory) {
    var socket = socketFactory();
    socket.forward('broadcast');
    return socket;
});

app.factory('chatSocket', function (socketFactory) {
  var myIoSocket = io.connect('http://eirik.pw:3100/');

  mySocket = socketFactory({
    ioSocket: myIoSocket
  });

  mySocket.forward('broadcast');
  return mySocket;
});

/* Message Formatter */
app.value('messageFormatter', function(date, nick, message) {
    return date.toLocaleTimeString() + ' ' +
        nick + ': ' +
        message + '\n';
});
app.controller('MainCtrl', function($scope, $http,chatSocket, $log, messageFormatter){
  
  $scope.test = "Sweeet";
  var nickName = "wos-client";
  $scope.chatLog = "";
  var api = "http://eirik.pw:3100/";
  
  /* Fetch some history on page load */
    $http.get(api+'history').success(function(res){
        console.log("Fetched history..");
        for(var i=0;i<res.length;i++){
            $scope.chatLog += res[i].date.toLocaleString()+" "+res[i].author+": "+res[i].body+"\n";
        }
    });
  
  // Sending messages
    $scope.sendMsg = function(){

        $log.debug('sending message', $scope.usr_msg);
        chatSocket.emit('message', nickName, $scope.usr_msg);
        $scope.usr_msg = '';
    };

    //Receiving messages
    $scope.$on('socket:broadcast', function(event, data) {
        //$log.debug('got a message', event.name);
        if (!data.payload) {
            $log.error('invalid message', 'event', event,
                'data', JSON.stringify(data));
            return;
        }
        
        $scope.$apply(function() {
            /* Normal chat message */
            $scope.chatLog = messageFormatter(
                new Date(), data.source,
                data.payload) + $scope.chatLog;
  
        });
    });
});