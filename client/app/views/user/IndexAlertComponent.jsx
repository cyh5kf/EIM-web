import React from 'react';
import PureRenderComponent from '../../components/PureRenderComponent';
import ReactPropTypes from '../../core/ReactPropTypes';
import AlertType from '../../core/enums/EnumAlertType';

export default class IndexAlertComponent extends PureRenderComponent {
    constructor(props) {
        super(props);
    }

    static propTypes = {
        alertType: ReactPropTypes.ofEnum(AlertType),
        msg: ReactPropTypes.string
    };

    render(){
        const {alertType, msg} = this.props;
        switch (alertType){
            case AlertType.AlertWarning:
                return (
                    <p className="alert alert_warning">
                        <i className="ficon_warning"></i>
                        {msg}
                    </p>
                );
            case AlertType.AlertError:
                return (
                    <p className="alert alert_error">
                        <i className="ficon_warning"></i>
                        {msg}
                    </p>
                );
            case AlertType.NoneAlert:
                return null;
        }
    }
}