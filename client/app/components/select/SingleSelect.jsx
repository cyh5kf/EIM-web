import React from 'react';
import _ from 'underscore';
import SelectOption from './SelectOption';

import './SingleSelect.less';

export default class SingleSelect extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show:false,direction:""};
    }
    
    componentDidMount(){
        
    }
    
    toggle(e){
        var show = this.state.show;
        if (!show){
            var target = $(e.currentTarget),orientation = "";
            var currentSelect = target.parent();
            var scrollBox = currentSelect.find(".select-scroll");
            var clientHeight = $(document.body).height();
            var top = currentSelect.offset().top;
            var positionTop = currentSelect.position().top;
            var maxHeight = parseInt(scrollBox.css("max-height").replace("px",""))
            if (((top+maxHeight)>clientHeight)||(positionTop>330)){
                orientation = "bottom";
            }
            this._handleOnShow(true);
            this.setState({show:true,direction:orientation});
        }
        else{
            this._handleOnShow(false);
            this.setState({show:false});
        }
    }
    
    close(e){
        var singleselect = $(e.target).closest('.singleselect');
        var selectBox = singleselect.find(".singleselect-box");
        if(!(singleselect.is('div')&&selectBox.hasClass("hidden"))){
            this._handleOnShow(false);
            this.setState({ show: false,direction:''});
        }
    }
    
    _handleOnShow(show){
        if(show){
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
            this.onDocClickListener = this.close.bind(this);
            document.addEventListener('click', this.onDocClickListener, false);
        }else{
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
        }
    }
    
    
    refreshOption(item,e){
        if (this.props.afterSelectedCallback){
            this.props.afterSelectedCallback(item,e);
        }
    }
    
    getSelectedOption(arr,selectval){
        var selectedOpt = arr[0];
        if (arr&&arr.length>0){
            for (var i=0;i<arr.length;i++){
                var val = arr[i];
                if (val.value===selectval){
                    selectedOpt = val;
                    break;
                }
            }
        }
        return selectedOpt;
    }

    render(){
        var self = this,optionList = [],selectval= this.props.selectval;
        var arr = this.props.fields;
        var show = this.state.show?"":"hidden";
        var selectedOption = this.getSelectedOption(arr,selectval);
        if (arr&&arr.length>0){
            optionList = _.map(arr,function(val,i){
                var key = new Date().getTime()+""+i;
                var selected = val.value===selectval;
                return (<SelectOption key={key} parent= {self} data={val} selected = {selected}/>);
            });
        }
        return (
            <div className={"singleselect"}>
                <div className="singleselect-search" data-value={selectedOption.value} onClick={this.toggle.bind(this)}>
                    <div className="icon global-dropdownicon"></div>{selectedOption.display}
                </div>
                <div className={'singleselect-box '+show+' '+this.state.direction}>
                    <div className="arrow"></div>
                    <div className="select-scroll">
                        <ul className="option-list">
                            {optionList}
                        </ul>
                    </div>
                </div>
            </div>
        );
    }
}

