import React from 'react';
import _ from 'underscore';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import AlertMessage from './AlertMessage';
import classnames from '../../utils/ClassNameUtils';
import './Alert.less';


class Alert extends React.Component {

    static defaultProps = {
        offset: 14,
        position: 'bottom left',
        theme: 'dark',
        time: 5000,
        transition: 'scale',
        show: false
    }

    static propTypes = {
        offset: React.PropTypes.number,
        className: React.PropTypes.string,
        placement: React.PropTypes.oneOf([
            'bottom left', 
            'bottom right', 
            'top right',
            'top left'
        ]),
        position: React.PropTypes.shape({
            top:React.PropTypes.number,
            left:React.PropTypes.number,
            bottom:React.PropTypes.number,
            right:React.PropTypes.number
        }),
        theme: React.PropTypes.oneOf(['dark', 'light']),
        time: React.PropTypes.number,
        transition: React.PropTypes.oneOf(['scale', 'fade'])
    }

    constructor(props){
        super(props);
        this.state = {
            alert:null,
            show:props.show
        };
        this.style = this._setStyle();
    }

    /**
     * Show the alert in the page with success type
     * @param  {string} message 
     * @param  {Object} options 
     * @return {void}         
     */
    success=(message, options = {})=>{
        options.type = 'success';
        this.show(message, options);
    }
    /**
     * Show the alert in the page with error type
     * @param  {string} message 
     * @param  {Object} options 
     * @return {void}
     */
    error=(message, options = {})=>{
        options.type = 'error';
        this.show(message, options);
    }
    /**
     * Show the alert in the page with info type 
     * @param  {string} message
     * @param  {Object} options
     * @return {void}
     */
    info=(message, options = {})=>{
        options.type = 'info';
        this.show(message, options);
    }
    /**
     * Show the alert in the page
     * @param  {string} message
     * @param  {Object} options
     * @return {void}
     */
    show=(message, options = {})=>{
        let alert = {};
        alert.message = message;
        alert = _.assign(alert, options);
        if(!alert.hasOwnProperty('time')){
            alert.time = this.props.time;
        }
        this.setState({alert: alert, show:true});
    }


    /**
     * Remove an AlertMessage from the container
     * @param  {AlertMessage} alert
     * @return {void}
     */
    _removeAlert=(alert)=>{
        this.setState({alert:null, show:false});
    }

    /**
     * Set the alert position on the page
     */
    _setStyle(){
        let position = {};
        switch(this.props.placement){
            case 'top left':
            position = {
                top: this.props.position.top,
                right: 'auto',
                bottom: 'auto',
                left: this.props.position.left
            }
            break;
            case 'top right':
            position = {
                top: this.props.position.top,
                right: this.props.position.right,
                bottom: 'auto',
                left: 'auto'
            }
            break;
            case 'bottom left':
            position = {
                top: 'auto',
                right: 'auto',
                bottom: this.props.position.bottom,
                left: this.props.position.left
            }
            break;
            default:
            position = {
                top: 'auto',
                right: this.props.position.right,
                bottom: this.props.position.bottom,
                left: 'auto'
            }
            break;
        }

        return {
            margin: this.props.offset + 'px',
            top: position.top,
            right: position.right,
            bottom: position.bottom,
            left: position.left
        };
    }

    render(){
        const hidden = this.state.show ? '':'hidden';
        return(
            <div style={this.style} className={classnames('react-alert', this.props.className, hidden)}>
            <ReactCSSTransitionGroup 
                transitionName={this.props.transition} 
                transitionEnterTimeout={250} 
                transitionLeaveTimeout={250}>
              {this.state.show && <AlertMessage {...this.state.alert} onRemove={this._removeAlert}/>}
            </ReactCSSTransitionGroup>
            </div>
        );
    }
}

export default Alert;
