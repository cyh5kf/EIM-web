import React from 'react';
import ReactDOM from 'react-dom';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import PureRenderComponent from '../PureRenderComponent';

import './autocomplete.less';

export default class  AutoComplete extends PureRenderComponent{
    constructor(props){
        super(props);
        this.state = {show:props.show, datasource:props.datasource};
    }

    open =(datasource)=>{
         this.setState({datasource:datasource, show:true});
         this.forceUpdate();
         document.addEventListener('keydown', this._onKeydown);
    }

    _onKeydown=(e)=>{
        if(e.keyCode === 40 || (!e.shiftKey && e.keyCode === 9)){
              e.preventDefault();
            this.refs.menulist.selectNext();
            this._pulldownscroll();
        }else if(e.keyCode === 38 || (e.shiftKey && e.keyCode === 9)){
             e.preventDefault();
             this.refs.menulist.selectPrev();
             this._pullupscroll();
        }else if(e.keyCode === 13){
             e.preventDefault();
             this.refs.menulist.select();
             this.close();
        }else if(e.keyCode === 27){
             e.preventDefault();
             this.refs.menulist.select();
             this.close();
        }
    }

    _getAtualTop=(element)=>{
        let actualTop = element.offsetTop;
        let current = null;
        while (current !== null){
            actualTop += current.offsetTop;
            current = current.offsetParent;
        }
        return actualTop;
    }

    _pulldownscroll=()=>{
        const select = this.refs.menulist.getSelect()[0];
        const listRef = ReactDOM.findDOMNode(this.refs.list);
        const totalRows = Math.round(listRef.scrollHeight/select.clientHeight);
        const viewportRows = Math.round(listRef.clientHeight/select.clientHeight); 
        const offsetRows =  Math.round((listRef.scrollHeight - listRef.scrollTop)/select.clientHeight);
        const rowNum =  Number(select.getAttribute('data-index'));
        const bottomrow = (rowNum - (totalRows - offsetRows - 1));
        if( bottomrow >= viewportRows){
             $(listRef).animate({scrollTop:listRef.scrollTop + select.clientHeight}, 20, 'swing');
        }else{
            if(rowNum === 0){
                $(listRef).animate({scrollTop:0}, 20, 'swing');
            }
        }   
    }

    _pullupscroll=()=>{
        const select = this.refs.menulist.getSelect()[0];
        const listRef = ReactDOM.findDOMNode(this.refs.list);
        const totalRows = Math.round(listRef.scrollHeight/select.clientHeight);
        const offsetRows =  Math.round((listRef.scrollHeight - listRef.scrollTop)/select.clientHeight);
        const rowNum =  Number(select.getAttribute('data-index'));
        if(rowNum  === totalRows){
                $(listRef).animate({scrollTop:listRef.scrollHeight}, 20, 'swing');
        }else{
            if(totalRows-offsetRows >= rowNum - 1){
                $(listRef).animate({scrollTop:listRef.scrollTop - select.clientHeight}, 20, 'swing');
            }
        }
    };

    close=()=>{
        this.setState({datasource: null, show: false});
        document.removeEventListener('keydown', this._onKeydown);
        var afterHide = this.props.afterHide;
        if (afterHide) {
            afterHide();
        }
    };

    static propTypes = {
        show: React.PropTypes.bool,
        hiddenHeader:  React.PropTypes.bool,
        datasource: React.PropTypes.array,
        headerNode: React.PropTypes.node,
        renderOption: React.PropTypes.func,
        onArrowUp: React.PropTypes.func,
        onArrowDown: React.PropTypes.func
    };

    static defaultProps = {
        show: false,
        hiddenHeader: false,
        datasource: null
    };

    render(){
        let menulist = null;
        if(this.state.datasource && this.state.datasource.length > 0){
            menulist = this.props.renderOption(this.state.datasource);
        }
        return (<div>
                {this.state.show && <Overlay show={this.state.show} rootClose
                 onHide={this.close} placement='top'
                        target={() => ReactDOM.findDOMNode(this.refs.target)} >
                        <Popover id={this.props.id} title={this.props.title} className="autocomplete">
                            <div className="wrapper">
                                {!this.props.hiddenHeader && this.props.headerNode}
                                <div className="list" ref="list">
                                   {menulist}
                                </div>
                            </div>
                        </Popover>
                    </Overlay>
                }
                <span ref="target">
                  {this.props.children}
                </span>
            </div>
        );
    }
}
