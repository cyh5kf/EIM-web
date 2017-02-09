import React from 'react';
import NavLink from '../../components/navlink/NavLink';
import classnames from '../../utils/ClassNameUtils';
import exposeLocale from '../../components/exposeLocale';

@exposeLocale(['REGISTER', 'common'])
export default class SignupGraphicsPanel extends React.Component {
    constructor(props) {
        super(props);
    }

    render(){
        const {locale} = this.state;
        return (
            <div className="fs_split_pane fs_split_pane_right">
                <div className="fs_split_flex_wrapper">
                    <div className="fs_split_header">
                        <span>{locale.existingLabel}</span>
                        <NavLink to="/signin" className="find_team_link" >{locale.loginAccountBtnLabel}</NavLink>
                    </div>
                    <div className="fs_split_body">
                        <div className={classnames("signup_graphics fs_split_graphics", this.props.GraphicsClassName)} ></div>
                    </div>
                </div>
            </div>
        );
    }
}