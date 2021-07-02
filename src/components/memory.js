import React from "react";
import HexEditor from 'react-hex-editor';
import oneDarkPro from 'react-hex-editor/themes/oneDarkPro';

let PETSCII= '';
PETSCII +=   '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[£]↑←'
PETSCII +=   ' !"#$%&\'()*+,-./0123456789:;<=>?'
PETSCII +=   '..............................π.'
PETSCII +=   ' ...............................'
PETSCII +=   '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[£]↑←'
PETSCII +=   '█!"#$%&\'()*+,-./0123456789:;<=>?'
PETSCII +=   '..............................π.'
PETSCII +=   '█...............................'

export default class MemoryPanel extends React.Component {
    constructor(props) {
        super(props)

        this.active = true;
        this.lastmem = new Array(256).fill(0);
        this.lastmemloc = 0;
        this.newValue = 0;

        this.getAddr = this.getAddr.bind(this)
        this.onFocus = this.onFocus.bind(this)
        this.onBlur = this.onBlur.bind(this)
        this.onChange = this.onChange.bind(this)
        this.keyPress = this.keyPress.bind(this)
        this.formatPETSCII = this.formatPETSCII.bind(this)
        this.wheel=this.wheel.bind(this)
        this.handleSetValue = this.handleSetValue.bind(this)
    }

    shouldComponentUpdate() {
        return this.active || this.lastmemloc !== this.props.loc;
    }

    render() {
        let mem = this.processInput(this.props.data)
        if(mem === null) {
            mem = this.lastmem;
        } else {
            this.lastmem = mem
        }
        this.newValue = this.props.loc
        this.lastmemloc = this.props.loc

        return (

            <div className="compborder memory">
                <table>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td>{this.getAddr(this.props.loc)}</td>
                            <td>                
                                <HexEditor
                                    columns={0x10}
                                    data={mem}
                                    height={344}
                                    onSetValue={this.handleSetValue}
                                    formatValue={this.formatPETSCII}
                                    theme={{ hexEditor: oneDarkPro }}
                                    showRowLabels={false}
                                    showAscii={true}
                                    
                                />
                            </td>
                            <td>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x0000000)}>$0000</button><br/>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x777d000)}>IO</button><br/>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x777d400)}>SID</button><br/>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x777d600)}>6551 / 4551</button><br/>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x777d768)}>Math Unit</button><br/>
                                <button className="memorybutton" onClick={() => this.props.onLocChange(0x777dc00)}>CIA</button><br/>
                            </td>
                        </tr>
                    </tbody>
                </table>

            </div>
        

        )
    }

    handleSetValue(offset, value) {
        this.props.onMemChange(this.newValue + offset, value)
    }

    formatPETSCII(val) {

        return PETSCII.substr(val,1) || String.fromCharCode(val)
    }

    onFocus() {
        this.active = false;
    }

    onBlur(e) {
        this.props.onLocChange(this.newValue)
        this.active = true;
    }

    onChange(e, index) {
        let val = Math.max(0,  parseInt(e.target.value,16) - index * 16)
        this.newValue = val
    }

    keyPress(e){
        if(e.keyCode == 13){
           this.props.onLocChange(this.newValue)
           this.active = true
        }
    }

    wheel(e) {
        let multiplier = e.shiftKey ? 16 : 1;
        if(e.deltaY > 0) {
            let val = Math.max(0,  this.newValue + 16 * multiplier)
            this.newValue = val
            this.props.onLocChange(this.newValue)
        } else if (e.deltaY < 0) {
            let val = Math.max(0,  this.newValue - 16 * multiplier)
            this.newValue = val
            this.props.onLocChange(this.newValue)
        }
    }

    getAddr(start) {
        let addr = new Array(16).fill(0).map((a,i) => {
            let val = (start + i*16).toString(16).toUpperCase().padStart(8,0)

            return (
                <li className="rowlabel" key={val}>
                    <input className="width8 rowinput" type="text" maxLength="8" 
                        defaultValue={val} 
                        onFocus={this.onFocus} 
                        onBlur={this.onBlur}
                        onKeyDown={this.keyPress}
                        onChange={e => {
                            this.onChange(e,i)
                        }}
                        onWheel={this.wheel}
                    >
                    </input>
                </li>)
        })
        return addr
    }

    processInput(inp) {
                /*
        0M 0 :00000000:FFFF00000000000000000000007E0000 
        :00000010:00000000000000000000000043F70000 
        :00000020:F62500000000000000000001004A4822 
        :00000030:0000000020C4F60000FFFF0102000000 
        :00000040:000000002000F648F743F70000000000 
        :00000050:00000000001800000000000000000000 
        :00000060:0040F700000000000000000000000000 
        :00000070:000000000000000000000000FF050000 
        :00000080:00000320000000010000000000000000 
        :00000090:40FFC00000000001000003000080006F 
        :000000A0:E164000000D8F6010000000000000000 
        :000000B0:00E529FD0F000000006F08086F000000 
        :000000C0:0000012000000000000000005DEED72E 
        :000000D0:00000000484800000000180000000000 
        :000000E0:800F80DF1800004F9100001800184F11 
        :000000F0:11010100000000000000103200000000 .
        */

       if(!inp) return null;
       if(inp.length<40*16) return null;
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