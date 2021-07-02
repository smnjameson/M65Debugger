import React from "react";

export default class Registers extends React.Component {
    constructor(props) {
        super(props)
        this.lastreg = {
            pc: '0000',
            ar: '00',
            xr: '00',
            yr: '00',
            zr: '00',
            br: '00',
            sp: '00',
            flg:'........'
        }

        this.processInput = this.processInput.bind(this)
    }

    render() {
        let reg = this.processInput(this.props.input)
        if(reg === null) {
            reg = this.lastreg;
        } else {
            this.lastreg = reg
        }
        return (
            <div className="compborder registers">
                 <table>
                     <thead>

                     </thead>
                     <tbody>
                        <tr>
                            <td>PC</td>
                            <td>A</td>
                            <td>X</td>
                            <td>Y</td>
                            <td>Z</td>
                            <td>B</td>
                            <td>SP</td>
                            <td>FLAGS</td>
                        </tr>
                        <tr>
                            <td><input className="mono width4" maxLength="4" type="text" value={reg.pc} readOnly></input></td>
                            <td><input className="mono width2" maxLength="2" type="text" value={reg.ar} readOnly></input></td>
                            <td><input className="mono width2" maxLength="2" type="text" value={reg.xr} readOnly></input></td>
                            <td><input className="mono width2" maxLength="2" type="text" value={reg.yr} readOnly></input></td>
                            <td><input className="mono width2" maxLength="2" type="text" value={reg.zr} readOnly></input></td>
                            <td><input className="mono width2" maxLength="2" type="text" value={reg.br} readOnly></input></td>
                            <td><input className="mono width4" maxLength="4" type="text" value={reg.sp} readOnly></input></td>
                            <td><input className="mono width8" maxLength="8" type="text" value={reg.flg} readOnly></input></td>
                        </tr>
                        </tbody>
                </table>
            </div>
        
        )
    }

    processInput(inp) {
        //PC   A  X  Y  Z  B  SP   MAPH MAPL LAST-OP In P  P-FLAGS  RGP  uS IO ws h RECA8LHC 
        //E1B2 00 01 11 00 00 01F0 B300 E300 05D1    00 22 ..E...Z. ...P 46 - 00 - ..c..lhc 
        //0777E1B2 F0 FA BEQ $E1AE .
        let marker = (this.props.connectionMode === 'serial') ? 'RECA8LHC' : 'GP uS IO'

        let index = inp.indexOf( marker);
        if(index === -1) {
            return null;
        }

        let trimmed = inp.substr(index + 10)
        let pc = trimmed.substr(0,4)
        let ar = trimmed.substr(5,2)
        let xr = trimmed.substr(8,2)
        let yr = trimmed.substr(11,2)
        let zr = trimmed.substr(14,2)
        let br = trimmed.substr(17,2)
        let sp = trimmed.substr(20,4)
        let flg = trimmed.substr(53, 8)

        this.props.onPC(pc)
        
        return {
            pc,ar,xr,yr,zr,br,sp,flg
        }
    }
}