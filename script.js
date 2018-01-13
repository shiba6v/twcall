$(function(){
    if(window.location.href.slice(0,5)!="https"){
      window.location.href = "https" + window.location.href.slice(4)
    }
    let localStream = null;
    let peer = null;
    let existingCall = null;
    let myId = null;
    let callLink =  null;

    navigator.mediaDevices.getUserMedia({video: true, audio: true})
        .then(function (stream) {
            $('#myStream').get(0).srcObject = stream;
            localStream = stream;
        }).catch(function (error) {
            console.error('mediaDevice.getUserMedia() error:', error);
            return;
        });

    peer = new Peer({
        key: 'API-KEY',
        // get API key from
        // https://console-webrtc-free.ecl.ntt.com/users/login
        debug: 3
    });

    if(getQuery()['id']){
      $('#tweet').hide();
    }
    else{
      $('#make-call').hide();
    }

    peer.on('open', function(){
        myId = peer.id;
        $('#my-id').text(peer.id);
        callLink = window.location.href+'?id='+myId;
        //$('#call-link').text(callLink);
        $('#tweet').click(function(){
          window.open('http://twitter.com/?status='+'%e4%b8%80%e7%b7%92%e3%81%ab%e3%83%93%e3%83%87%e3%82%aa%e3%83%81%e3%83%a3%e3%83%83%e3%83%88%e3%81%97%e3%81%be%e3%81%97%e3%82%87%e3%81%86%0d%0a'+callLink);
        });
    });

    peer.on('call', function(call){
        call.answer(localStream);
        setupCallEventHandlers(call);
    });

    peer.on('error', function(err){
        alert("通話受付は終了しました．");
        //alert(err.message);
    });

    $('#make-call').submit(function(e){
        e.preventDefault();
        const call = peer.call(getQuery()['id'], localStream);
        setupCallEventHandlers(call);
    });

    $('#end-call').click(function(){
        existingCall.close();
    });

    function setupCallEventHandlers(call){
        if (existingCall) {
            existingCall.close();
        };

        existingCall = call;

        call.on('stream', function(stream){
            addVideo(call,stream);
            setupEndCallUI();
            $('#connected-peer-id').text(call.remoteId);
        });

        call.on('close', function(){
            removeVideo(call.peer);
            setupMakeCallUI();
        });
    }

    function addVideo(call,stream){
        const videoDom = $('<video autoplay>');
        videoDom.attr('id',call.peer);
        videoDom.get(0).srcObject = stream;
        $('.videosContainer').append(videoDom);
    }

    function removeVideo(peerId){
        $('#'+peerId).remove();
    }

    function setupMakeCallUI(){
      if(getQuery()['id']){
        $('#make-call').show();
      }
        $('#end-call').hide();
    }

    function setupEndCallUI() {
        $('#make-call').hide();
        $('#end-call').show();
    }

    function getQuery() {
        const obj = {};
        if(window.location.search === ""){
          return obj;
        }
        const variables = window.location.search.split("?")[1].split("&");
        variables.forEach(function(v, i) {
            const variable = v.split("=");
            obj[variable[0]] = variable[1];
        });
        return obj;
    }

});
