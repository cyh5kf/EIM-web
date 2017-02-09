import React from 'react';
import ReactPropTypes from '../../core/ReactPropTypes';
import './panelheader.less';

export default class PanelHeader extends React.Component {
    static propTypes = {
        title: ReactPropTypes.string.isRequired,
        onClickAction: ReactPropTypes.func.isRequired,        
        withBack:ReactPropTypes.bool.isRequired
    }        

    onClick=(e)=>{
        //fcj.todo: 直接调用会触发rightpanel的close，添加延时临时解决
        const that = this;
        setTimeout(function() {
            that.props.onClickAction();
        }, 50);        
    }

    render() {            
        const {withBack, title} = this.props;    

        let header = null;
        if(withBack){
                header = (
                    <div className="heading">
                        <span className="rightbar-back-to" onClick={this.onClick}>
                            <i className="icon icon-team-navbar-action-dropdown"></i>
                            {title}
                        </span>                    
                        <span className="close_flexpane no_underline" onClick={this.onClick} >
                            <i className="ficon_delete"></i>
                        </span>
                    </div>
                );
            }
            else{
                header = (
                    <div className="heading">
                            {title}
                            <span className="close_flexpane no_underline" onClick={this.onClick} >
                                <i className="ficon_delete"></i>
                            </span>
                    </div>
                );
        }

        return header;
    }
}
