import React, {PropTypes} from 'react';
import './MessagePopup.less';

export default class MessagePopup extends React.Component {

    static propTypes = {
        className: PropTypes.string,
        children: PropTypes.node
    };

    static defaultProps = {
        className: 'info'
    };

    render(){
        const {children,className} = this.props;
        return (
            <div className={`messagePopBox ${className}`}>{children}</div>
        );
    }
}

