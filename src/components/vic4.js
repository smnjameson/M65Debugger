import React from "react";

export default class Vic4 extends React.Component {
    constructor(props) {
        super(props)

        this.lastdata = new Array(256).fill(0)

        this.processInput = this.processInput.bind(this)
        this.format = this.format.bind(this)
    }

    render() {
        let vic = this.processInput(this.props.data)
        if(vic === null) {
            vic = this.lastdata;
        } else {
            this.lastdata = vic
        }   

        let spanYes = "<span style='color:green'>Yes</span>"
        let spanNo = "<span style='color:red'>No</span>"


        return (
            <div className="compborder mathunit" style={{margin:0}}>
                    
                <div style={{textAlign:'left', fontSize:18, fontFamily:'Arial', padding:5}}>VIC IV</div>
                <table>
                    <thead></thead>
                    <tbody>
                        <tr>
                            <td>
                                <table style={{borderCollapse:'collapse'}}>
                                    <thead></thead>
                                    <tbody>
                                        <tr>
                                            <td className="vicheading">Char Modes</td>
                                            <td className="vicheading">Sprite Modes</td>
                                            <td className="vicheading">Pointers</td>
                                            <td className="vicheading">Screen</td>
                                            <td className="vicheading">Borders</td>
                                            <td className="vicheading">Palettes</td>
                                        </tr>
                                        
                                        <tr>    
                                            <td className="vicstats">
                                                <tr>                                                
                                                    <td className="vic4valueOdd">FCM Low</td>
                                                    <td className="vic4valueOdd" style={{color:(vic[0x54] & 0x2 ? 'green': 'red')}}>{vic[0x54] & 0x2 ? "yes" : "no" }</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueEven">FCM Hi</td>
                                                    <td className="vic4valueEven" style={{color:(vic[0x54] & 0x4 ? 'green': 'red')}}>{vic[0x54] & 0x4 ? "yes" : "no" }</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">16bit Char</td>
                                                    <td className="vic4valueOdd" style={{color:(vic[0x54] & 0x1 ? 'green': 'red')}}>{vic[0x54] & 0x1 ? "yes" : "no" }</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">Char XScale</td>
                                                    <td className="vic4valueEven">{vic[0x5a].toString(16).padStart(2,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Char YScale</td>
                                                    <td className="vic4valueOdd">{vic[0x5b].toString(16).padStart(2,0)}</td>
                                                </tr>                                               
                                            </td>
                                            <td className="vicstats">
                                                <tr>                                                
                                                    <td className="vic4valueOdd">16bit Ptrs</td>
                                                    <td className="vic4valueOdd" style={{color:(vic[0x6e] & 0x80 ? 'green': 'red')}}>{vic[0x6e] & 0x80 ? "yes" : "no" }</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueEven">16 Colors</td>
                                                    <td className="vic4valueEven">%{vic[0x6b].toString(2).padStart(8,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">H-Tile</td>
                                                    <td className="vic4valueOdd">%{(vic[0x4d] >> 4 + (vic[0x4f] & 0xf0)).toString(2).padStart(8,0)}</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">Ext.Height</td>
                                                    <td className="vic4valueEven">{(vic[0x56]).toString(16).padStart(2,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd"> </td>
                                                    <td className="vic4valueOdd">%{vic[0x55].toString(2).padStart(8,0)}</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">Ext.Width</td>
                                                    <td className="vic4valueEven">{(vic[0x57]).toString(16).padStart(2,0)}</td>
                                                </tr>
                                            </td>                                            
                                            <td className="vicstats">
                                                <tr>
                                                    <td className="vic4valueOdd">Screen</td>
                                                    <td className="vic4valueOdd">${(vic[0x60] + (vic[0x61] << 8) + (vic[0x62] << 16) + ((vic[0x63] & 0xf) << 24) ).toString(16).padStart(7,0)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="vic4valueEven">Sprite</td>
                                                    <td className="vic4valueEven">${(vic[0x6c] + (vic[0x6d] << 8) + ((vic[0x6e] & 0x7f) << 16) ).toString(16).padStart(7,0)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="vic4valueOdd">Color</td>
                                                    <td className="vic4valueOdd">${(vic[0x64] + (vic[0x65] << 8)).toString(16).padStart(7,0)}</td>
                                                </tr>
                                                <tr>
                                                    <td className="vic4valueEven">Char</td>
                                                    <td className="vic4valueEven">${(vic[0x68] + (vic[0x69] << 8) + (vic[0x6a] << 16) ).toString(16).padStart(7,0)}</td>
                                                </tr>
                                            </td>
                                            <td className="vicstats">
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Chars/Row</td>
                                                    <td className="vic4valueOdd">${(vic[0x5e] + ((vic[0x63] & 0x30) << 4)).toString(16).padStart(4,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueEven">Bytes/Row</td>
                                                    <td className="vic4valueEven">${(vic[0x58] + (vic[0x59] << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Row Count</td>
                                                    <td className="vic4valueOdd">${(vic[0x7b]).toString(16).padStart(2,0)}</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">H640</td>
                                                    <td className="vic4valueEven" style={{color:(vic[0x31] & 0x80 ? 'green': 'red')}}>{vic[0x31] & 0x80 ? "yes" : "no" }</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">V400</td>
                                                    <td className="vic4valueOdd" style={{color:(vic[0x31] & 0x08 ? 'green': 'red')}}>{vic[0x31] & 0x08 ? "yes" : "no" }</td>
                                                </tr>                                               
                                            </td>                                            
                                            <td className="vicstats">
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Top</td>
                                                    <td className="vic4valueOdd">${(vic[0x48] + ((vic[0x49] & 0xf) << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueEven">Btm</td>
                                                    <td className="vic4valueEven">${(vic[0x4a] + ((vic[0x4b] & 0xf) << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Side</td>
                                                    <td className="vic4valueOdd">${(vic[0x5c] + ((vic[0x5d] & 0x3f) << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">TextXPos</td>
                                                    <td className="vic4valueEven">${(vic[0x4c] + ((vic[0x4d] & 0xf) << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">TextYPos</td>
                                                    <td className="vic4valueOdd">${(vic[0x4e] + ((vic[0x4f] & 0xf) << 8)).toString(16).padStart(4,0)}</td>
                                                </tr>                                               
                                            </td>
                                            <td className="vicstats">
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Banked</td>
                                                    <td className="vic4valueOdd">${((vic[0x70] & 0xc0) >> 6 ).toString(16).padStart(2,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueEven">Text</td>
                                                    <td className="vic4valueEven">${((vic[0x70] & 0x30) >> 4 ).toString(16).padStart(2,0)}</td>
                                                </tr>
                                                <tr>                                                
                                                    <td className="vic4valueOdd">Sprite</td>
                                                    <td className="vic4valueOdd">${((vic[0x70] & 0x0c) >> 2 ).toString(16).padStart(2,0)}</td>
                                                </tr>                                               
                                                <tr>                                                
                                                    <td className="vic4valueEven">Alt</td>
                                                    <td className="vic4valueEven">${((vic[0x70] & 0x03)).toString(16).padStart(2,0)}</td>
                                                </tr>                                           
                                            </td>  
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