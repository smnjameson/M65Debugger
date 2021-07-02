import React from "react";

export default class MathUnit extends React.Component {
    constructor(props) {
        super(props)

        this.lastmunit = {
            matha: '00000000', 
            mathadec: 0,
            mathb: '00000000', 
            mathbdec: 0,
            multout: '00000000:00000000', 
            multoutdec: 0,
            divout: '00000000:00000000', 
            divoutdec: 0
        }

        this.processInput = this.processInput.bind(this)
        this.format = this.format.bind(this)
    }

    render() {
        let munit = this.processInput(this.props.data)
        if(munit === null) {
            munit = this.lastmunit;
        } else {
            this.lastmunit = munit
        }

        return (
            <div className="compborder mathunit" style={{margin:0}}>
                <div style={{textAlign:'left', fontSize:18, fontFamily:'Arial', padding:5}}>Math Unit</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td>
                                <table style={{borderCollapse:'collapse'}}>
                                    <thead></thead>
                                    <tbody>
                                        <tr>    
                                            <td className="rowinputheading"></td>
                                            <td className="rowinputheading">MathA</td>
                                            <td className="rowinputheading">MathB</td>
                                            <td className="rowinputheading">Multiply</td>
                                            <td className="rowinputheading">Divide</td>
                                        </tr>
                                        <tr>    
                                            <td className="rowinputstats">Hex</td>
                                            <td className="rowinputstats">${munit.matha}</td>
                                            <td className="rowinputstats">${munit.mathb}</td>
                                            <td className="rowinputstats">${munit.multout}</td>
                                            <td className="rowinputstats">${munit.divout}</td>
                                        </tr>
                                        <tr>    
                                            <td className="rowinputstats">Dec</td>
                                            <td className="rowinputstats">{this.format(munit.mathadec)}</td>
                                            <td className="rowinputstats">{this.format(munit.mathbdec)}</td>
                                            <td className="rowinputstats">{this.format(munit.multoutdec)}</td>
                                            <td className="rowinputstats">{this.format(munit.divoutdec)}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </td>
  
                        </tr>
                    </tbody>
                </table>

            </div>
        
        )
    }

    format(val) {
        return new Intl.NumberFormat('en-GB').format(val)
    }
    processInput(inp) {

        /*

        */
        if(!inp) return null;
        if(inp.length<40*16) return null;
        if(inp.substr(0,8) !== 'M777D768') return null;
        let data = []
        for(var j=0; j<2; j++) {
            let index = inp.indexOf(":")
            if(index === -1) break
            index = inp.indexOf(":", index + 1)
            if(index === -1) break

            inp = inp.substr(index+1)
            for(var i=0; i<32; i+=2) {
                data.push(inp.substr(i,2))
            }
        }

        let divout = `${data[7]}${data[6]}${data[5]}${data[4]}:${data[3]}${data[2]}${data[1]}${data[0]}`;
        let divoutdec = parseInt(`${data[7]}${data[6]}${data[5]}${data[4]}`, 16) 
                        + parseInt(`${data[3]}${data[2]}${data[1]}${data[0]}`,16) / 0x100000000;
        let multout = `${data[23]}${data[22]}${data[21]}${data[20]}${data[19]}${data[18]}${data[17]}${data[16]}`;
        let multoutdec = parseInt(`${data[23]}${data[22]}${data[21]}${data[20]}${data[19]}${data[18]}${data[17]}${data[16]}`, 16); 

        let matha = `${data[11]}${data[10]}${data[9]}${data[8]}`;
        let mathadec = parseInt(`${data[11]}${data[10]}${data[9]}${data[8]}`,16);
        let mathb = `${data[15]}${data[14]}${data[13]}${data[12]}`;
        let mathbdec = parseInt(`${data[15]}${data[14]}${data[13]}${data[12]}`,16);

        return {
            matha, mathadec,
            mathb, mathbdec,
            multout, multoutdec,
            divout, divoutdec
        }
    }
}