import React from 'react';
import {Link} from 'react-router';
// import classnames from '../../utils/ClassNameUtils';

export default class NavLink extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        return (
            <Link {...this.props} activeClassName="g_active" />
        );
    }
}
