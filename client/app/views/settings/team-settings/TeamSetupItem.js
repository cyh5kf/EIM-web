/**
 * Created by luanhaipeng on 16/8/2.
 */
import React from 'react';
import SetupItems from '../../../components/setupitem/SetupItems';
import SaveButton from '../../../components/button/LoadingButton';
import exposeLocale from '../../../components/exposeLocale';

@exposeLocale(['DIALOGS', 'dlg-accountInfo'])
export default class TeamSetupItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    onClickSaveBtn(){
        this.props.onSubmit();
    }

    render(){
        var props = this.props;
        let locale = this.state.locale;
        var btnState = this.props.btnState || 0; ////0 正常,1 loading, 2 saved
        return (
            <SetupItems {...props} >
                {props.children}
                <div></div>
                <div className="buttonBoxLine" onClick={this.onClickSaveBtn.bind(this)}>
                    <SaveButton className="green" loading={btnState}>
                        {btnState===2?locale.noticeSaved:locale.saveSetting}
                    </SaveButton>
                </div>
                <div className="clearfix"></div>
            </SetupItems>);
    }
}

TeamSetupItem.propTypes = {
    onSubmit: React.PropTypes.func,
    btnState: React.PropTypes.number
};
