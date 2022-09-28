import React from 'react'

import '../assets/css/App.css'
import Registers from './registers'
import MemoryPanel from './memory'
import Code from './code'
import MathUnit from './mathunit'
import Vic4 from './vic4'
import RRB from './rrb'


const { ipcRenderer } = require('electron')

const MT_NONE = 0x0000
const MT_REGISTERS = 0x0001
const MT_MEMORY = 0x0002
const MT_CODE = 0x0003
const MT_MATHUNIT = 0x0004
const MT_VIC4 = 0x0005
const MT_RRB = 0x0006
const MT_RRB_COL = 0x0007
const MT_RRB2 = 0x0008
const MT_RRB_COL2 = 0x0009

class App extends React.Component {
    constructor(props) {
        super(props)

        this.msgQueue = [];
        this.msgType = MT_NONE;
        
        this.lastScroll = 0;

        this.state = {
            registers: '',
            memoryloc: 0,
            memdata: '',
            codeloc: 0,
            codedata: '',
            mathunit:'',
            vic4: '',
            connectionMode: '', 
            detailMode: "VIC4",
            rowdata:'',
            rowdata2:'',
            colorrowdata:'',
            colorrowdata2:'',
            screenrow:0
        }

        this.screenAddr = ''
        this.colAddr = ''
        this.screenAddr2 = ''
        this.colAddr2 = ''
        this.rowsize = 0;

        this.followPCVal = false;
        this.pc = 0

        
        this.sendMessage = this.sendMessage.bind(this);
        this.onLocChange = this.onLocChange.bind(this);
        this.onMemChange = this.onMemChange.bind(this);
        this.onCodeLocChange = this.onCodeLocChange.bind(this);
        this.onCodeChange = this.onCodeChange.bind(this);
        this.setBreakpoint = this.setBreakpoint.bind(this);
        this.followPC = this.followPC.bind(this);
        this.pcChange = this.pcChange.bind(this);
        this.onContinue = this.onContinue.bind(this);
        this.setCom = this.setCom.bind(this);
        this.isConnected = this.isConnected.bind(this);
        this.getDetailMode = this.getDetailMode.bind(this);
        this.selectRowRRB = this.selectRowRRB.bind(this);
        this.setupIPC();

        this.scalex = 1
        this.scaley = 1
        window.addEventListener('resize', this.handleResize.bind(this))

    }

    selectRowRRB(e) {
        console.log(parseInt(e.target.value,10))
        this.setState({screenrow:parseInt(e.target.value,10)})
    }

    handleResize() {
        // width: 1165,
        // height: 768,
        this.scalex = this.getWidth() / 1165
        this.scaley = this.scalex
        this.forceUpdate()
    }

    getWidth() {
        return document.body.offsetWidth
      }
      
     getHeight() {
        return document.body.offsetHeight
      }


    render() {
        return (
            <div className="mono container" style={{
                transform: `scale(${this.scalex},${this.scalex})`
            }}>

                <table>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td style={{verticalAlign:'bottom'}}>
                                <div>
                                    <button className="memorybutton" onClick={()=>this.sendMessage('t1\r', MT_NONE)}>Pause</button>
                                    <button className="memorybutton" onClick={()=>this.sendMessage('t0\r', MT_NONE)}>Resume</button>
                                    <button className="memorybutton" onClick={()=>this.sendMessage('\r!\r', MT_NONE)}>Reset</button>
                                    <button className="memorybutton" onClick={()=>this.sendMessage('RECONNECT', MT_NONE)}>Reconnect</button>
                                </div>
                                <Registers 
                                    input={this.state.registers}
                                    connectionMode={this.state.connectionMode}
                                    onPC={this.pcChange}
                                />
                            </td>
                            <td>
                                <MathUnit 
                                    data={this.state.mathunit}
                                />
                            </td>
                        </tr>
                        <tr>
                           <td>
                                <Code 
                                    loc={this.state.codeloc} 
                                    data={this.state.codedata}
                                    onLocChange={this.onCodeLocChange}
                                    onMemChange={this.onCodeChange}   
                                    setBreakpoint={this.setBreakpoint}   
                                    followPC={this.followPC}
                                    onContinue={this.onContinue}
                                    connectionMode={this.state.connectionMode}
                                />                               
                            </td> 
                           <td>
                                <MemoryPanel 
                                    loc={this.state.memoryloc} 
                                    data={this.state.memdata}
                                    onLocChange={this.onLocChange}
                                    onMemChange={this.onMemChange}
                                />
                            </td> 
                        </tr>
                        <tr>

                            <br/>
                            <button className="memorybutton" onClick={() => this.setState({detailMode:"VIC4"})}>VIC IV</button>
                            <button className="memorybutton" onClick={() => this.setState({detailMode:"RRB"})}>RRB</button>
                        </tr>
                        <tr>
                            <td colSpan='2'>
                                { this.getDetailMode(this.state.detailMode)}
                            </td>
                        </tr>   
                        <tr>
                            <td>

                            </td>
                            <td>

                            </td>
                        </tr>
                     
                    </tbody>
                </table>


            </div>
        )
    }

    getDetailMode(detail) {
        switch(detail) {
            case "VIC4":
                return (<Vic4 data={this.state.vic4}/>);
            case "RRB":
                return (<RRB    vic={this.state.vic4} 
                                rowdata={this.state.rowdata} 
                                colorrowdata={this.state.colorrowdata}
                                rowdata2={this.state.rowdata2} 
                                colorrowdata2={this.state.colorrowdata2}
                                colAddr={this.colAddr}
                                screenAddr={this.screenAddr}
                                colAddr2={this.colAddr2}
                                screenAddr2={this.screenAddr2}
                                selectRowRRB={this.selectRowRRB}
                        />);
        }
    }

    setCom() {
        ipcRenderer.send('changecomport', '')     
    }
    
    isConnected(val) {
        ipcRenderer.send('isConnected', val.toString()) 
    }
    sendMessage(msg, type) {
        let newState = {}
        if(msg==="RECONNECT") {
            ipcRenderer.send(msg)
        }
        if(this.msgType === MT_NONE) {
            ipcRenderer.send('asyncmsg', msg) 
            this.msgType = type
        } else {
            this.msgQueue.push({
                msg,
                type
            });
        }
    }

    onContinue() {
        this.sendMessage('t0\r', MT_NONE)
    }

    pcChange(val) {
        this.pc = val
    }
    followPC(checked) {
        this.followPCVal = checked
    }

    setBreakpoint(addr) {
        this.sendMessage('b '+addr.substr(-4)+'\r', MT_NONE)
    }

    onCodeLocChange(value) {
        this.setState({
            codeloc: value
        })
    }

    onCodeChange(loc, value) {
        let SETSTR = this.state.connectionMode === "xemu" ? 's ' : 's '
        this.sendMessage(SETSTR+loc.toString(16)+' '+value.toString(16)+'\r', MT_CODE)
    }

    onLocChange(value, isscrolled) {
        if(isscrolled) this.lastScroll = Date.now() + 1000
        this.setState({
            memoryloc: value
        })
    }

    onMemChange(loc, value) {
        if(loc >= 0x777d000 && loc < 0x777dfff) loc = loc - 0x7770000
        let SETSTR = this.state.connectionMode === "xemu" ? 's ' : 's '
        this.sendMessage(SETSTR+loc.toString(16)+' '+value.toString(16)+'\r', MT_MEMORY)
        console.log(SETSTR+loc.toString(16)+' '+value.toString(16)+'\r')
    }

    setupIPC() {
        ipcRenderer.on('setmode', (event, arg) => {
            this.setState({
                connectionMode: arg
            })
        })
        ipcRenderer.on('asyncreply', (event, arg) => {

            let newState = {}
            switch(this.msgType) {
                case MT_REGISTERS:
                    newState.registers = arg
                    break;
                case MT_MEMORY:
                    newState.memdata = arg
                    break;
                case MT_CODE:
                    newState.codedata = arg
                    break;
                case MT_MATHUNIT:
                    newState.mathunit = arg
                    break;
                case MT_VIC4:
                    if(arg.substr(1,7) === '777D000') newState.vic4 = arg
                    break;
                case MT_RRB:
                    if(arg.substr(1,7) === this.screenAddr) newState.rowdata = arg
                    break;
                case MT_RRB_COL:
                    if(arg.substr(1,7) === this.colAddr) newState.colorrowdata = arg
                    break;
                case MT_RRB2:
                    if((this.rowsize && this.rowsize > 256) && arg.substr(1,7) === this.screenAddr2) newState.rowdata2 = arg
                    break;
                case MT_RRB_COL2:
                    if((this.rowsize && this.rowsize > 256) && arg.substr(1,7) === this.colAddr2) newState.colorrowdata2 = arg
                    break;
                default:
                    break;
            }

            this.msgType = MT_NONE;
            if(Object.keys(newState).length) {
                this.setState({
                    ...newState
                })
                this.forceUpdate()
            }
            
            if(this.msgQueue.length > 0) {
                let shift = this.msgQueue.shift()
                this.sendMessage(shift.msg, shift.type)
            }
        })

        let slowUpdate = 0;
        let disconnectTimer = 0


        setInterval(() => {
            disconnectTimer++
            if(disconnectTimer > 5) {
                this.isConnected(false)
            }
            if(this.msgQueue.length === 0 && this.lastScroll < Date.now()) {
                this.isConnected(true)
                disconnectTimer = 0

                this.sendMessage('r\r', MT_REGISTERS)
                this.sendMessage('M'+this.state.memoryloc.toString(16)+'\r', MT_MEMORY)
                if(this.state.connectionMode === 'serial') {
                    if(this.followPCVal) {
                        this.sendMessage('D'+this.pc+'\r', MT_CODE)
                    } else {
                        this.sendMessage('D'+this.state.codeloc.toString(16)+'\r', MT_CODE)
                    }
                } else {
                    this.state.codedata = "XEMU : Disassembly not yet implemented in xemu"
                }
                slowUpdate++;
                if(slowUpdate > 1) {
                    slowUpdate = 0;
                    this.sendMessage('M777D768\r', MT_MATHUNIT)
                    this.sendMessage('M777D000\r', MT_VIC4)

                    
                    if(this.state.detailMode === 'RRB') {
                        let vic = this.processVicInput(this.state.vic4)
                        if(vic) {
                            let screenAddr = (vic[0x60] + (vic[0x61] << 8) + (vic[0x62] << 16) + ((vic[0x63] & 0xf) << 24) );
                            let colAddr = 0xff80000;
                            let rowsize = (vic[0x58] + (vic[0x59] << 8));
                            screenAddr += rowsize * this.state.screenrow
                            colAddr += rowsize * this.state.screenrow

                            let screenAddr2 = (screenAddr + 256).toString(16).padStart(7,0).toUpperCase()
                            let colAddr2 = (colAddr + 256).toString(16).padStart(7,0).toUpperCase()
                            this.screenAddr2 = screenAddr2
                            this.colAddr2 = colAddr2

                            screenAddr = screenAddr.toString(16).padStart(7,0).toUpperCase()
                            colAddr = colAddr.toString(16).padStart(7,0).toUpperCase()
                            this.screenAddr = screenAddr
                            this.colAddr = colAddr

                            this.rowsize = rowsize

                            this.sendMessage('M' + screenAddr + '\r', MT_RRB)
                            this.sendMessage('M' + colAddr + '\r', MT_RRB_COL)

                            if(rowsize > 256) {
                                this.sendMessage('M' + screenAddr2 + '\r', MT_RRB2)
                                this.sendMessage('M' + colAddr2 + '\r', MT_RRB_COL2)                               
                            }
                        }
                    }
                    
                }
            }
        }, 150)             
    }

    processVicInput(inp) {

        /*

        */
        if(!inp) return null;
        if(inp.length<40*16) return null;
        if(inp.substr(0,8) !== 'M777D000') return null;
        
        let data = []
        while(inp.length > 32) {
            let index = inp.indexOf(":")
            if(index === -1) break
            index = inp.indexOf(":", index + 1)
            if(index === -1) break

            inp = inp.substr(index+1)
            for(var i=0; i<32; i+=2) {
                data.push(parseInt(inp.substr(i,2),16))
            }
        }
        return data
    }
}




export default App
