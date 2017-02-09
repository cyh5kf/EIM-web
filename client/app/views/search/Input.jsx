import React from 'react';

export default class Input extends React.Component {
    constructor(props) {
        super(props);
    }

    getText(){
        return this.props.value;
    }

    _onInputFocus(){
        this.props.onInputFocus(this);
    }

    _onInputBlur(){
        this.props.onInputBlur(this);
    }

    onFocus(){
    }

    onKeyDown(e){
        if(this.props.onKeyDown){            
            this.props.onKeyDown(e);
        }
    }    

    _onChange(e){
        e.preventDefault();
        let inputtxt = e.target.value.trim();
        this.props.onInputChanged(inputtxt);
    }

    render(){
        return (
            <input type="text"  className="multiselect-inputfield" ref="inputref" id="searchInput" value={this.props.value} placeholder={this.props.placeholder}
             onClick={this._onInputFocus.bind(this)} onFocus={this.onFocus.bind(this)}
             onKeyDown={this.onKeyDown.bind(this)}
             onBlur={this._onInputBlur.bind(this)} onChange={this._onChange.bind(this)} />
        );
    }
}
