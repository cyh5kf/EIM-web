import React from 'react';
import classnames from '../../utils/ClassNameUtils';
import exposeLocale from '../../components/exposeLocale';
import NavLink from '../../components/navlink/NavLink';
import ReactPropTypes from '../../core/ReactPropTypes';

import "./IndexLayoutComponent.less";

export const IndexMenu = {
    PRODUCT: 1,
    PRICING: 2,
    DOWNLOAD: 3,
    SIGNIN: 4,
    SIGNUP: 5
}

@exposeLocale(['INDEX'])
export default class IndexLayoutComponent extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            mobileNav: false
        };
    }

    static propTypes = {
        navClass: ReactPropTypes.string,
        indexBackground: ReactPropTypes.string,
        children: ReactPropTypes.node,
        indexMenu: ReactPropTypes.ofEnum(IndexMenu)
    };

    render(){
        const {locale,mobileNav} = this.state, {indexMenu, navClass, indexBackground,children}=this.props;
        
        return (
            <div className={classnames("index_layout_component", navClass, mobileNav? 'show_mobile_nav': '')}>
                <nav className="top">
                    <NavLink to="/" className="logo" >
                        <i className="ficon_logo"></i>
                    </NavLink>
                    <a href="javascript:;" onClick={e=>this.setState({mobileNav: !mobileNav})} className="toggle_mobile_menu">
                        <span className="icon_bar top_bar"></span>
                        <span className="icon_bar middle_bar"></span>
                        <span className="icon_bar bottom_bar"></span>
                    </a>
                    <ul>
                        <li className={indexMenu === IndexMenu.PRODUCT? 'index_menu_active': ''}>
                            <a href="javascript:;">
                                {locale.product}
                            </a>
                        </li>
                        <li className={indexMenu === IndexMenu.PRICING? 'index_menu_active': ''}>
                            <a href="javascript:;">
                                {locale.price}
                            </a>
                        </li>
                        <li className={indexMenu === IndexMenu.DOWNLOAD? 'index_menu_active': ''}>
                            <a href="javascript:;">
                                {locale.download}
                            </a>
                        </li>
                        <li className={indexMenu === IndexMenu.SIGNIN? 'index_menu_active': ''}>
                            <NavLink to="/signin">{locale.loginlink}</NavLink>
                        </li>
                        <li className={indexMenu === IndexMenu.SIGNUP? 'index_menu_active': ''}>
                            <NavLink className="btn_sticky" to="/create/email">{locale.enterpriselink}</NavLink>
                        </li>
                    </ul>
                </nav>

                <div className={classnames('signup_c no_padding', indexBackground)}>
                    {children}
                </div>
            </div>
        );
    }
}


