'use strict'

// Import parts of electron to use
const { app, BrowserWindow, ipcMain, Menu, dialog } = require('electron')
const path = require('path')
const url = require('url')
const prompt = require('electron-prompt');


var net = require('net');
const SerialPort = require('serialport')
const COMPORT_STORE = 'comportstore'

//*
const Store = require('electron-store');
const store = new Store();
let comport = store.get(COMPORT_STORE)
// if(comport==='XEMU') comport = ''
console.log("settings = "+comport)
let comportconnected = false


let port;
let mainWindow
let timer = 0
let dev = false

if (process.env.NODE_ENV !== undefined && process.env.NODE_ENV === 'development') {
  dev = true
}



let menu = [
    {
        label: 'File',
        submenu: [
            { label: 'Exit', click: app.quit, accelerator: 'CmdOrCtrl+Q' },
        ]
    },{
        label: 'Edit',
        submenu: []
    },{
        label: "COM",
        submenu: []
    },{
        label: "Help",
        submenu: [
            { label: 'About', click: ()=> {
                dialog.showMessageBox({ message:`M65 Debugger ${app.getVersion()}`})
            }}
        ]

    }
]

function createMenus() {
    Menu.setApplicationMenu(Menu.buildFromTemplate(menu));
}







// [   {"path":"COM3","manufacturer":"FTDI","serialNumber":"AI04JN0C","pnpId":"FTDIBUS\\VID_0403+PID_6001+AI04JN0CA\\0000","vendorId":"0403","productId":"6001"},
//     {"path":"COM6","manufacturer":"FTDI","serialNumber":"251633005A5B","pnpId":"FTDIBUS\\VID_0403+PID_6010+251633005A5BA\\0000","vendorId":"0403","productId":"6010"},
//     {"path":"COM7","manufacturer":"FTDI","serialNumber":"251633005A5B","pnpId":"FTDIBUS\\VID_0403+PID_6010+251633005A5BB\\0000","vendorId":"0403","productId":"6010"}
// ]
function startComPortSetup() {
    SerialPort.list().then(data => {
            
        console.log("Serialport list "+JSON.stringify(data))
        setupComMenu(data)
        if(comport) {
            connect(comport)
        }
    }).catch(e => {
        console.log("ERROR "+ e)

        setTimeout(startComPortSetup, 5000)
    })
}

function setupComMenu(data) {
    menu[2].submenu = []
    data.push({
        path:"XEMU"
    })
    for(let i=0; i<data.length; i++) {
        let menuItem = {    label: `${data[i].path}`, 
                            click: () => {
                                connect(data[i].path)
                            }, 
                            type:"radio", 
                            checked: data[i].path.toLowerCase() === (comport && comport.toLowerCase())
                        }
    
        menu[2].submenu.push(menuItem)

        Menu.setApplicationMenu(Menu.buildFromTemplate(menu))
    }
}

function connect(comp) {
    if(port !== undefined) port.close()
    store.set(COMPORT_STORE, comp)
    comport = comp

    if(comp ==="XEMU") {
        
        connectUART()
        return
    } 
    
    
    port = new SerialPort(comp, {
        baudRate:2000000,
        autoOpen: false
    })

    port.open(function (err) {
        if (err) {
            comportconnected = false;
            mainWindow.title = "M65Debugger - Error on "+comport+ " : "+err.message
        }
        
        // Because there's no callback to write, write errors will be emitted on the port:
        comportconnected = true;
    })
    
    // Open errors will be emitted as an error event
    port.on('error', function(err) {
    //   console.log('Error: ', err.message)
        mainWindow && (mainWindow.title = "M65Debugger - Error on "+comport+ " : "+err.message)
    })
    port.on('open', function() {
    //   console.log('Port opened')
        mainWindow && (mainWindow.title = "M65Debugger - Connected on "+comport)
        mainWindow.reload()
        setTimeout(() => mainWindow.webContents.send('setmode', 'serial'), 1000)
    })
    
    // Switches the port into "flowing mode"
    port.on('data', function (data) {
        let parsed = data.toString()
    //   console.log('Data : ', data)
        mainWindow.webContents.send('asyncreply', parsed)
    })  
    
}


let client 
function connectUART() {
    client && client.end()
    client  = new net.Socket();
 
    client.on('connect',function(data){
        console.log('Client: Attempting connection with Xemu');
        var address = client.address();
        var port = address.port;
        var family = address.family;
        var ipaddr = address.address;
        console.log('Client is listening at port ' + client.localPort);
        console.log('Server is listening at port ' + client.remotePort);
        console.log('Client ip :' + ipaddr);
        client.setNoDelay(false)

        mainWindow.reload()
        setTimeout(() => mainWindow.webContents.send('setmode', 'xemu'),1000)
        mainWindow.title = "M65Debugger - Connected to Xemu??"
        comportconnected = true;
    });

    client.setEncoding('utf8');
    client.on('error', err => {
        console.log(err)
    })

    client.on('data',function(data) {
        // if(data.toLowerCase().indexOf('error')>-1) console.log('ERROR:' + data);
        mainWindow && mainWindow.webContents.send('asyncreply', data)
    });

    client.connect({
        port:4510
    });

    port = {
        close: () => {
            // console.log("CLOSE")
            // client && client.end()
            // client = null;
        },
        write: (data) => {
            client && client.write(data+"\r", "utf8")
        }
    }

}









function createWindow() {
        // Create the browser window.
        mainWindow = new BrowserWindow({
            width: 1190,
            height: 880,
            show: false,
            webPreferences: {
                nodeIntegration: true,
                contextIsolation: false
            },
            icon: __dirname + '/buildResources/icon.png'
        })

     // and load the index.html of the app.
    let indexPath

    if (dev && process.argv.indexOf('--noDevServer') === -1) {
        indexPath = url.format({
        protocol: 'http:',
        host: 'localhost:8080',
        pathname: 'index.html',
        slashes: true
        })
    } else {
        indexPath = url.format({
        protocol: 'file:',
        pathname: path.join(__dirname, 'dist', 'index.html'),
        slashes: true
        })
    }

    mainWindow.loadURL(indexPath)

    // Don't show until we are ready and loaded
    mainWindow.once('ready-to-show', () => {
        createMenus()
        mainWindow.show()
        mainWindow.title = "M65Debugger - not connected"
        startComPortSetup()
    })

    mainWindow.on('closed', function() {
        port && port.close()
        mainWindow = null
    })

}





ipcMain.on('asyncmsg', (event, arg) => {
    if(!loadingPRG && comportconnected) {
        timer = Date.now()
        port.write(arg, function(err) {
            if (err) {
                return console.log('Error on write: ', err.message)
            }
        })
    }
})

ipcMain.on('RECONNECT', (event, arg) => {
    if(comportconnected) {
        comportconnected = false
        port.close(function(err) {
            setTimeout(() => connect(comport), 2000)
        })
    } else {
        connect(comport)
    }
})

ipcMain.on('isConnected', (event, arg) => {
    // if(arg === "false") {
    //     mainWindow && (mainWindow.title = "M65Debugger - not connected")
    //     if(comport === "XEMU") {

    //         port.close()
    //     }
    // } else {
    //     mainWindow.title = "M65Debugger - Connected to "+comport
    // }
})


ipcMain.on('changecomport', (event, arg) => {
    
    prompt({
        title: 'Select COM Port',
        label: 'COM Port',
        type: 'input'
    })
    .then((r) => {
        if(r !== null) {
            if(comportconnected) {
                comportconnected = false
                port.close(function(err) {
                    connect(r)
                })
            } else {
                connect(r)
            }
            
        }
    })
})





// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
    createWindow()

    if(dev) {
        let devtools = new BrowserWindow()
        mainWindow.webContents.setDevToolsWebContents(devtools.webContents)
        mainWindow.webContents.openDevTools({ mode: 'detach' })
    }
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})















function M65_Reset() {
    if(!comportconnected) return
    port.write("\r!\r", function(err) {
        if (err) {
            return console.log('Error on Reset', err.message)
        }
    })  
}

function M65_StopCPU() {
    if(!comportconnected) return
    port.write("t1\r", function(err) {
        if (err) {
          return console.log('Error on StartCpu', err.message)
        }
    }) 
}

function M65_StartCPU() {
    if(!comportconnected) return
    port.write("t0\r", function(err) {
        if (err) {
          return console.log('Error on StartCpu', err.message)
        }
    }) 
}

function M65_SendText(txt) {
    if(!comportconnected) return
    txt = txt.toUpperCase()
    let str = 's 2B0 '
    for(var i=0; i<txt.length; i++) {
        str += txt.charCodeAt(i).toString(16).padStart(2,0) + " "
    }
    str += "\rs D0 "+ txt.length.toString(16).padStart(2,0) + "\r"

    port.write(str, function(err) {
        if (err) {
          return console.log('Error on sendtext', err.message)
        }
    })     
}


let loadingPRG = false;
function M65_LoadPrgOld(data, callback) {
    if(!comportconnected) return
    loadingPRG = true;
    let address = data[0] + data[1]* 256
    let buf = data.slice(2)

    let ready = true;
    let interval = setInterval(() => {
        let count = Math.min(16,buf.length)
        if(count === 0) {
            clearInterval(interval)
            setTimeout(callback, 500);
            loadingPRG = false;
            return
        }

        if(ready) {
            ready = false;
            let addrOff = (address).toString(16)
            let cmd = "s"+addrOff+" "+ buf2hex(buf.subarray(0,count))
            port.write(cmd + "\r", function(err) {
                if (err) {
                    ready = true;
                    console.log('Error on set ram', err.message)
                } else {
                    buf = buf.slice(count)
                    address += count
                    ready = true;
                }
            }) 
        }
    }, 5)

}

function M65_LoadPrg(data, callback) {
    if(!comportconnected) return
    loadingPRG = true;
    
    
    let address = data[0] + data[1]* 256
    let buf = data.slice(2)

    let cmd = "L"+address.toString(16).padStart(4,0)+" "+ (address+buf.length).toString(16).padStart(4,0)

    // let cmd = "L0800 0804"
    port.write(cmd + "\r", function(err) {
        setTimeout(()=>{
            // cmd = new ArrayBuffer()
            // cmd.push(1,2,3,4,5)
            port.write(buf , function(err) {
                 loadingPRG = false;
                 setTimeout(callback, 500);
            })
        }, 500)
    })


}


function buf2hex(buffer) { // buffer is an ArrayBuffer
    return [...new Uint8Array(buffer)].map(x => x.toString(16).padStart(2, '0')).join(' ');

}


const WebSocket = require("ws"); // websocket server
// const { connect } = require('http2')
const wss = new WebSocket.Server({ port: 8082 });
wss.binaryType = 'arraybuffer'

wss.on('connection', function connection(ws) {
    ws.on('close', () => {
        console.log("closed")
    } )
    
    ws.onmessage = (msg) => {
        if(msg.data==="RESET") {
            console.log("RESET")
            M65_StartCPU()
            M65_Reset()
        } else if(msg.data==="DROPCOM") {
            console.log("DROPCOM")
            port.close(function(err) {
                if(err) console.log("DROPCOM "+err)
                setTimeout(() => {
                    
                }, 2000)
            })
        } else if(msg.data==="CONNECT") {
            console.log("CONNECT")
            connect(comport)
        }else {
            let prg = msg.data
            M65_StartCPU()
            M65_Reset()
            setTimeout(()=> {
                M65_StopCPU()
                M65_LoadPrg(prg, () => {
                    console.log("Send prg done")
                    M65_StartCPU()
                    M65_SendText("run"+String.fromCharCode(13))
                        ws.send("done")    
                })
            }, 5000)      
        }

        // console.log(msg)
    }
    console.log("connected")
});


console.log("WebSocket Server Started on port 8082");


//*//