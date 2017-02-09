import React,{PropTypes} from 'react';
import exposeLocale from '../../components/exposeLocale';
import NavLink from '../../components/navlink/NavLink';
import LoadingButton,{LOADING_STATUS} from '../../components/button/LoadingButton';

@exposeLocale(['REGISTER', 'common'])
export default class SignupForm extends React.Component {
    constructor(props) {
        super(props);
        this.state={
            emailChecked: true
        };
    }

    static propTypes = {
        children: PropTypes.node,
        showCheckBox: PropTypes.bool,
        onClick: PropTypes.func,
        disabled: PropTypes.bool,
        btnLabel: PropTypes.string,
        showLoading: PropTypes.bool
    };

    static defaultProps = {
        showCheckBox: false,
        disabled: false,
        showLoading: false
    };

    toggleCheckbox(e){
        this.setState({emailChecked: !this.state.emailChecked});
    }

    render(){
        const {locale,showLoading} = this.state;
        return (
            <div className="fs_split_pane fs_split_pane_left">
                <div className="find_team_mobile show_on_mobile">
                    <span>{locale.existingLabel}</span>
                    <NavLink to="/signin" className="find_team_mobile_link" >{locale.loginAccountBtnLabel}</NavLink>
                </div>
                <div className="fs_split_flex_wrapper">
                    <div className="fs_split_body">
                        {this.props.children}
                        <LoadingButton
                            className="g_btn btn_large submit_btn"
                            loading={showLoading?LOADING_STATUS.Loading: LOADING_STATUS.NoLoading}
                            onClick={this.props.onClick}
                            disabled={this.props.disabled}
                        >
                                {this.props.btnLabel}
                                <i className="ficon_arrow_right" ></i>
                        </LoadingButton>
                        {this.props.showCheckBox&&(
                            <label className="email_checkbox">
                                <input 
                                    type="checkBox"
                                    defaultChecked={this.state.emailChecked}
                                    onChange={(e)=>this.toggleCheckbox(e)}
                                />
                                {locale.checkBoxLabel}
                            </label>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}