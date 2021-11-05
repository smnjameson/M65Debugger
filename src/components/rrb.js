import React from "react";

export default class RRB extends React.Component {
    constructor(props) {
        super(props)

        this.lastdata = new Array(256).fill(0)
        this.lastdatacol = new Array(256).fill(0)
        this.lastdatavic = new Array(256).fill(0)
        
        this.processInput = this.processInput.bind(this)
        this.format = this.format.bind(this)
        this.renderRow = this.renderRow.bind(this)

        this.screenRow = 0;
    }

    shouldComponentUpdate() {
        let vic = this.processInput(this.props.vic, '777D000')
        if(vic === null) {
            vic = this.lastdatavic;
        } else {
            this.lastdatavic = vic
        }  

        
        let row = this.processInput(this.props.rowdata, this.props.screenAddr)
        let row2 = this.processInput(this.props.rowdata2, this.props.screenAddr2)
        if(row === null || row2 === null) {
            row = this.lastdata;
        } else {
            if(row) {
                this.lastdata = this.lastdata.slice(row.length, this.lastdata.length)
                this.lastdata = row.concat(this.lastData)
            }
            if(row2) {
                this.lastdata = this.lastdata.slice(0, 256)
                this.lastdata = this.lastdata.concat(row2)
            }
            // this.lastdata = row.concat(row2)
            row = this.lastdata
        } 

        let col = this.processInput(this.props.colorrowdata, this.props.colAddr)
        let col2 = this.processInput(this.props.colorrowdata2, this.props.colAddr2)
        if(col === null || col2 === null) {
            col = this.lastdatacol;
        } else {
            if(col) {
                this.lastdatacol = this.lastdatacol.slice(col.length, this.lastdatacol.length)
                this.lastdatacol = col.concat(this.lastdatacol)
            }
            if(col2) {
                this.lastdatacol = this.lastdatacol.slice(0, 256)
                this.lastdatacol = this.lastdatacol.concat(col2)
            }
            // this.lastdatacol = col.concat(col2)
            col = this.lastdatacol
        } 

        if(col.length % 256 !== 0 || row.length % 256 !== 0 || vic.length !== 256) return false
        if(col.length ===0 || row.length ===0) return false;
        return true
    }

    render() {
        let col = this.lastdatacol
        let row = this.lastdata
        
        
        return (<div className="compborder mathunit scrollable" style={{margin:0, height: 300, left:0, textAlign: 'left', padding: 5}}>
            <div style={{textAlign: 'left',fontSize:18, fontFamily:'Arial', padding:5, float:'left', marginBottom:10}}>RRB - ${this.props.screenAddr.substr(-5)}&nbsp;&nbsp;&nbsp;</div>
            <select className="rowselector" onChange={this.props.selectRowRRB}>{this.getRowSelects()}</select>&nbsp;&nbsp;&nbsp;
            {this.getKey()}
            <br/>
            <div className="RRBData">{this.renderRow(row, col)}</div>
        </div>);
    }

    getKey() {
        return (<div style={{display:'inline-block'}} >
            <div className='rrbKey' style={{backgroundColor: '#280'}}>GOTOX</div>&nbsp;&nbsp;&nbsp;
            <div className='rrbKeyText'>
                <div>T - Transparent</div>
                <div>B - Background</div>
                <div>F - Foreground</div>
                <div>A - Alt.Palette</div>
            </div>
            <div className='rrbKeyText'>
                <div>+# - Y Char fetch offset</div>
            </div>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <div className='rrbKey' style={{backgroundColor: '#228'}}>FCM</div>
            <div className='rrbKey' style={{backgroundColor: '#62a'}}>NCM</div>&nbsp;&nbsp;&nbsp;
            <div className='rrbKeyText'>
                <div>b - Blink</div>
                <div>r - Reverse</div>
                <div>B - Bold</div>
                <div>u - Underline</div>
            </div>
            <div className='rrbKeyText'>
                <div>V - V.Flip</div>
                <div>H - Flip</div>
            </div>
        </div>)
    }

    // if(col[i + 0] & 0x80) params += 'V'
    // if(col[i + 0] & 0x40) params += 'H'

    // if(col[i + 1] & 0x10) params += 'b'
    // if(col[i + 1] & 0x20) params += 'r'
    // if(col[i + 1] & 0x40) params += 'B'
    // if(col[i + 1] & 0x80) params += 'u'

    getRowSelects() {
        let vic = this.lastdatavic;
        let out = []
        for(var i=0 ; i<=vic[0x7b]; i++) out.push(<option value={i}>Row {i}</option>)
        return out
    }
    renderRow(scr,col) {
        let vic = this.lastdatavic
        let rowsize = (vic[0x58] + (vic[0x59] << 8));
        
        let out = []
        
        // out.push(<div className="RRBNewline"></div>)
        out.push(<div className="RRBNewline"></div>)
        for(var i=0; i<40; i++){
            out.push(<div className="RRBHeader">{i}<br/>${i.toString(16).padStart(2,0)}</div>)
        }
        
        // out.push(<div className="RRBNewline"></div>)
        out.push(<div className="RRBLayer">Layer 0</div>)
        out.push(<div className="RRBNewline"></div>)
        
        let rowCount = 0;
        let layer = 0;
        
        for(let i=0; i<rowsize; i+=2) {
            //are we gotoX?
            if(col[i + 0] & 0x10) {
                let loc = scr[i+0] + ((scr[i+1] & 0x03) << 8);
                let params = ''
                if(col[i + 0] & 0x80) params += 'T'
                if(col[i + 0] & 0x40) params += 'B'
                if(col[i + 0] & 0x04) params += 'F'
                if(col[i + 1] & 0xa0) params += 'A'
                let offset = ((scr[i+1] & 0xe0) >> 5)
                if(offset) params += '+'+offset

                out.push(<div><div className="RRBLayer">Layer {++layer}</div><div className="GOTOX">{loc.toString(16).padStart(3,0).toUpperCase()}<br/>{params}</div></div>)
                rowCount = 0;
            } else {
                let ncm = !!(col[i+0] & 0x08)
                // ncm = true;//!!((i%4)/2)
                let chr = scr[i+0] + ((scr[i+1] & 0x03) << 8);
                let params = ''
                if(col[i + 0] & 0x80) params += 'V'
                if(col[i + 0] & 0x40) params += 'H'

                if(col[i + 1] & 0x10) params += 'b'
                if(col[i + 1] & 0x20) params += 'r'
                if(col[i + 1] & 0x40) params += 'B'
                if(col[i + 1] & 0x80) params += 'u'

                if(ncm) {
                    rowCount+=2;
                    out.push(<div className="NCM">{chr.toString(16).padStart(4,0).toUpperCase()}<br/>{params}</div>)
                    if((rowCount) % 40 === 0) {
                        out.push(<div className="RRBNewline"></div>)
                        rowCount = 0;
                    }
                } else {
                    rowCount++;
                    out.push(<div className="FCM">{chr.toString(16).padStart(4,0).toUpperCase()}<br/>{params}</div>)
                    if((rowCount) % 40 === 0) {
                        out.push(<div className="RRBNewline"></div>)
                        rowCount = 0;
                    }
                }

                
                
                // let chr = i
                
                
            }
        }
        return out
    }

    format(val) {
        return new Intl.NumberFormat('en-GB').format(val)
    }

    processInput(inp, addr) {
        if(!inp) return [];
        if(inp.length<40*16) return [];
        if(inp.substr(1,7) !== addr) return null;

        let data = []
        while(inp.length > 32) {
            let index = inp.indexOf(":")
            if(index === -1) break
            index = inp.indexOf(":", index + 1)
            if(index === -1) break

            inp = inp.substr(index+1)
            for(var i=0; i<32; i+=2) {
                let v= parseInt(inp.substr(i,2),16)

                data.push(v)
                if(isNaN(v)) return null
            }
        }
        return data
    }
}