import React from 'react';
import ReactDOM from 'react-dom';
import Input from './Input';
import _ from 'underscore';

class SelectItem extends React.Component {
    constructor(props) {
        super(props);
    }

    _removeSelf(e){
        e.preventDefault();
        this.props.parent.removeItem(this.props.data);
    }

    render(){
        const locale = this.props.locale;

        if(Number(this.props.data.key) === 2){
            var date = new Date();
            if(!Number.isNaN(this.props.data.start)
            && !Number.isNaN(this.props.data.end)){

                date.setTime(this.props.data.start);
                let start = date.toLocaleDateString();

                date.setTime(this.props.data.end);
                let end = date.toLocaleDateString();

                return (
                <li key={this.props.data.key} className="multiselect-container-item" aria-key={this.props.data.key}>
                    <span className="multiselect-container-text" title={start+"-"+end}>{start+"-"+end}</span>
                    <span className="multiselect-container-close" onClick={this._removeSelf.bind(this)} >x</span>
                </li>
                );
            }
            else if(Number.isNaN(this.props.data.start)){
                date.setTime(this.props.data.end);
                let end = date.toLocaleDateString();
                
                return (
                <li key={this.props.data.key} className="multiselect-container-item" aria-key={this.props.data.key}>
                    <span className="multiselect-container-text" title={locale.beforedate + end}>{locale.beforedate + end}</span>
                    <span className="multiselect-container-close" onClick={this._removeSelf.bind(this)} >x</span>
                </li>
                );
            }
            else if(Number.isNaN(this.props.data.end)){
                date.setTime(this.props.data.start);
                let start = date.toLocaleDateString();

                return (
                <li key={this.props.data.key} className="multiselect-container-item" aria-key={this.props.data.key}>
                    <span className="multiselect-container-text" title={locale.afterdate+start}>{locale.afterdate+start}</span>
                    <span className="multiselect-container-close" onClick={this._removeSelf.bind(this)} >x</span>
                </li>
                );
            }
            
        }
        else{
            return (
            <li key={this.props.data.key} className="multiselect-container-item" aria-key={this.props.data.key}>
                <span className="multiselect-container-text" title={this.props.data.name}>{this.props.data.name}</span>
                <span className="multiselect-container-close" onClick={this._removeSelf.bind(this)} >x</span>
            </li>
            );
        }
        
    }
}

export default class InputContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state={dataSource:props.dataSource};
    }

    removeItem(data){
        if(this.props.onRemoveOption){
            this.props.onRemoveOption(data);
        }
    }

    onInputFocus(){
        if(this.props.onInputFocus){
            this.props.onInputFocus();
        }
    }

    onInputBlur(){
        if(this.props.onInputBlur){
            this.props.onInputBlur();
        }
    }

    onKeyDown(e){
        if(this.props.onKeyDown){            
            this.props.onKeyDown(e);
        }
    }

    componentWillUnmount(){

    }

    componentWillReceiveProps(props){
        this.setState({dataSource: props.dataSource});
    }

    onInputChanged(inputtext){
        if(this.props.onInputChanged){
            this.props.onInputChanged(inputtext);
        }
    }

    shouldDisplay(){        
        return this.state.dataSource && _.size(this.state.dataSource) > 0;
    }


    _focusOnSelectInput(){
        ReactDOM.findDOMNode(this.refs.pureinput).focus();
        this.onInputFocus();
    }

    render(){
        let content = [];
        let self = this;

        if(this.shouldDisplay()){
            content = _.map(this.state.dataSource, function(item){
                return <SelectItem key={item.key} data={item} parent={self} locale={self.props.locale} />
            });
        }        

        let input = <Input onInputChanged={this.onInputChanged.bind(this)} onInputBlur={this.onInputBlur.bind(this)}
            placeholder={this.props.placeholder}
            onKeyDown={this.onKeyDown.bind(this)}
            value={this.props.inputtext} onInputFocus={this.onInputFocus.bind(this)}
            ref="pureinput" type="text"/>

        return (
            <div className="multiselect-container" id="multiselect-container" onClick={this._focusOnSelectInput.bind(this)}>
                <ul className="multiselect-list-selecteditems">
                    {content}

                    <li className="multiselect-container-search">
                        {input}
                    </li>
                </ul>
            </div>
        );
    }
}
