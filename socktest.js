const readline = require('readline')



var net = require('net');





var client  = new net.Socket();


client.on('connect',function(){
    console.log('Client: connection established with server');
    var address = client.address();
    var family = address.family;
    var ipaddr = address.address;
    console.log('Client is listening at port' + client.localPort);
    console.log('Server is listening at port' + client.remotePort);
    console.log('Client ip :' + ipaddr);
    console.log('Client is IP4/IP6 : ' + family);

    client.setNoDelay(false)
    // client.setKeepAlive(true, 10000)
    waitCommand()
});

client.setEncoding('utf8');

client.on('data', data => {
    console.log(data)
})

client.on('error', err => {
    console.log(err)
})

client.connect({
    port:4510
});


function waitCommand() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    
    rl.question('>', cmd => {
        
        client.write(cmd+"\r", "utf8")
        // client.end()
        setTimeout( ()=>waitCommand(), 100)
        rl.close();
    });
}
