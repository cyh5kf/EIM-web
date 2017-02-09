import React from 'react';

export default class SingleSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }
    
    componentDidMount(){
        
    }
    
    _onClick(e){
        this.props.parent.refreshOption(this.props.data,e);
    }


    render(){
        var _data = this.props.data,_selected = this.props.selected;
        var selectedClass = _selected?"selected":"";
        return (
            <li className={selectedClass} onClick={this._onClick.bind(this)}><div>{_data.display}</div></li>
        );
    }
}

