import React from 'react';
import classnames from '../../utils/ClassNameUtils';

class AlertMessage extends React.Component {
    static defaultProps = {
        icon: '',
        message: '',
        tip: '',
        type: 'info'
    }
    
    static propTypes = {
        type: React.PropTypes.oneOf(['info', 'success', 'error']),
        onRemove: React.PropTypes.func
    }

    constructor(props){
        super(props);
    }
    /**
     * Handle the close button click
     * @return {void} 
     */
    _handleCloseClick(){
        this._removeSelf();
    }
    /**
     * Include the given icon or use the default one
     * @return {React.Component}
     */
    _showIcon(){
        let icon = '';
        if(this.props.icon){
            icon = this.props.icon;
        }
        else{
            icon = <div className={this.props.type + '-icon'} />;
        }

        return icon;
    }
    /**
     * Remove the alert after the given time
     * @return {void} 
     */
    _countdown(){
        setTimeout(() => {
            this._removeSelf();
        }, this.props.time);
    }
    /**
     * Emit a event to AlertContainer remove this alert from page
     * @return {void}
     */
    _removeSelf(){
        this.props.onRemove(this);
    }

    componentDidMount(){
        if(this.props.time > 0){
            this._countdown();
        }
    }

    render(){
        return (
            <div className={classnames('alert-body', this.props.type)}>
                <div className="icon">
                    {this._showIcon.bind(this)()}
                </div>
                <div className="message-container">
                    <div className="message">
                        {this.props.message}
                    </div>
                    <div className="tip">
                        {this.props.tip}
                    </div>
                </div>
                <div onClick={this._handleCloseClick.bind(this)} className="close">
                    <div className="closeIconClass" />
                </div>
            </div>
        );
    }
} 

export default AlertMessage