import React from "react";

export default class Code extends React.Component {
    constructor(props) {
        super(props)

        this.active = true;
        this.lastcode=[['00000000', '03 44 5f', 'LDA $FD45']]
        this.lastcodeloc = 0;
        this.newValue = 0;
        this.nextAddr = 0;
        
        this.breakPoints = []

        this.state = {
            followPC: false
        }
        
        this.onChange = this.onChange.bind(this)
        this.onCheck = this.onCheck.bind(this)
        this.keyPress = this.keyPress.bind(this)

        this.processInput = this.processInput.bind(this)
        this.getCode = this.getCode.bind(this);
        this.wheel=this.wheel.bind(this)
        this.click=this.click.bind(this)
        this.continue=this.continue.bind(this)

    }

    

    render() {
        let code = this.processInput(this.props.data)
        if(code === null) {
            code = this.lastcode;
        } else {
            this.lastcode  = code
        }
        this.lastcodeloc = this.props.loc

    
        return (
            <div className="compborder code">
                { this.props.connectionMode === 'xemu' ? <div><br/><br/><br/><br/><br/><br/>Disassembly not yet implemented in XEMU</div> : 
                    (<div><table>
                        <thead></thead>
                        <tbody>
                            {this.getCode(code)}
                        </tbody>
                    </table>
                    
                    <table>
                        <thead></thead>
                        <tbody>
                            <tr>
                                <td> Goto </td>
                                <td> Follow </td>
                            </tr>
                            <tr>
                                <td>
                                    <input type="text" 
                                        defaultValue=''
                                        onChange={this.onChange}
                                        onKeyDown={this.keyPress}
                                    ></input>
                                </td>
                                <td>
                                    <input type="checkbox" 
                                        checked={this.state.followPC}
                                        onChange={this.onCheck}
                                    ></input>                               
                                </td>
                                <td>
                                    <button 
                                        onClick={this.continue}
                                    >
                                        Continue
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table></div>)}
            </div>
        
        )
    }

    continue(e) {
        this.props.onContinue()
    }

    onCheck(e) {
        this.setState({
            followPC: e.target.checked
        })
        this.props.followPC(e.target.checked)
     }

    onChange(e) {
        let val =  parseInt(e.target.value, 16);
        this.newValue = val
     }

    keyPress(e){
        if(e.keyCode == 13){
           this.props.onLocChange(this.newValue)
        }
    }

    click(e, addr) {
        if(this.breakPoints.indexOf(addr) > -1) {
            this.breakPoints.splice(this.breakPoints.indexOf(addr), 1)
            this.forceUpdate()
        } else {
            this.breakPoints.push(addr)
            this.props.setBreakpoint(addr)
        }
    }

    wheel(e) {
        if(e.deltaY > 0) {
            let val = e.shiftKey ? this.newValue + 64 : this.nextAddr
            this.newValue = Math.max(0,val)
            this.props.onLocChange(this.newValue, true)
        } else if (e.deltaY < 0) {
            let val =  e.shiftKey ? this.newValue - 64 : this.newValue - 12
            this.newValue = Math.max(0,val)
            this.props.onLocChange(this.newValue, true)
        }
    }

    getCode(code) {
        let outcode = []
        for(let i=0; i<code.length; i++) {
            // console.log(code[i][0])
            let isSelected = this.breakPoints.indexOf(code[i][0])  > -1 ? "breakpoint" : "";
            outcode.push(
                
                <tr className="coderow"  
                    onWheel={this.wheel}
                    onClick={e => {
                        this.click(e,code[i][0])
                    }}
                    key={`tr${i}`}
                >
                    <td width={90} className={"codeinputLA "+isSelected}>{code[i][0]}</td>
                    <td width={80} className={"codeinputLA "+isSelected}>{code[i][1]}</td> 
                    <td width={220} className={"codeinputLA "+isSelected}>{code[i][2]}</td> 
                </tr>

            )
        }
        return outcode
    }


    processInput(inp) {

        if(inp.charAt(0)!=="D") return null;
        /*
            00000000  00 35     BRK   $35
            ,00000002  00 3C     BRK   $3C
            ,00000004  56 00     LSR   $00,X
            ,00000006  00 00     BRK   $00
            ,00000008  00 00     BRK   $00
            ,0000000A  00 8D     BRK   $8D
            ,0000000C  26 3A     ROL   $3A
            ,0000000E  00 00     BRK   $00
            ,00000010  FF FF 00  BBS7  $FF,$FF13
            $FF,$FF13
            ,00000013  FF FF 24  BBS7  $FF,$FF3A
            $FF,$FF3A
            ,00000016  0F FF FF  BBR0  $FF,$0018
            $FF,$0018
            ,00000019  FF FF FF  BBS7  $FF,$001B
            $FF,$001B
            ,0000001C  00 00     BRK   $00
            ,0000001E  00 00     BRK   $00
            ,00000020  32 24     AND   ($24),Y
            ,00000022  00 00     BRK   $00
        */      
        let start = inp.indexOf("\r")
        let arr = inp.substr(start).split("\r\n,");
        let outp = []

        if(arr.length !== 17) return null

        for(var i=0; i< arr.length; i++) {
            if(arr[i].length> 10) {
                if(i===6) this.nextAddr = parseInt(arr[i].substr(0,8),16)
                outp.push([
                    arr[i].substr(0,8),
                    arr[i].substr(10,8),
                    arr[i].substr(20)

                ])
            }
        }
        return outp
    }
}