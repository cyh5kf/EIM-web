import React from 'react';
import _ from 'underscore';
import TextInput from './TextInput';
import ValidationUtils from '../../utils/ValidationUtils';
import PureRenderComponent from '../PureRenderComponent';
import ReactPropTypes from '../../core/ReactPropTypes';

export default class ValidatorInput extends PureRenderComponent{
    constructor(props) {
        super(props);
        this.state={
            value: props.initValue
        };

        this.timeout = null;
    }

    static propTypes = {
        initValue: ReactPropTypes.string, // 初始值
        datatype: ReactPropTypes.string, // 数据类型
        message: ReactPropTypes.string, // 提示信息
        onToggleButtonState: ReactPropTypes.func,  // 切换button状态
        name: ReactPropTypes.string,  // input的name属性
        onToggleValidaterStates: ReactPropTypes.func, // 切换验证状态
        tips: ReactPropTypes.string, // 验证后的报错提示
        valid: ReactPropTypes.bool

    };

    static defaultProps = {
        initValue: ''
    };

    componentWillUnmount(){
        clearTimeout(this.timeout);
        this.timeout = null;
    }
    componentDidMount(){
        this.createValidatorAction(this.state.value, this.props, true);
    }

    _onChange(e){
        e.preventDefault();
        var currentValue = e.target.value.trim();
        
        this.createValidatorAction(currentValue, this.props , false);
        this.setState({value: currentValue});
    }

    createValidatorAction(data, prop, initialize){
        let validResult = ValidationUtils.validateInput({
            "value": data,
            "datatype": prop.datatype,
            "name": prop.name,
            "message": prop.message || ''
        },gLocaleSettings.VALIDATOR_MESSAGES);
        if (prop.onToggleButtonState) {
            prop.onToggleButtonState(validResult.buttonState);
        }
        
        if(this.timeout) clearTimeout(this.timeout);
        if (!initialize) {
            if (validResult.validatorResult[prop.name + 'valid'] || !data) {
                prop.onToggleValidaterStates(validResult.validatorResult);
            }else{
                this.timeout = setTimeout(()=>{
                    prop.onToggleValidaterStates(validResult.validatorResult);
                }, 2000);
            }
        }
        
    }

    render(){
        const {
            tips,
            message,
            valid,
            ...props
        }=this.props;

        
        return(
            <TextInput
                onChange={e=>this._onChange(e)}
                value={this.state.value}
                message={tips || message}
                isError={!!this.state.value && !valid && !!tips}
                visibleHeader={!!this.state.value}
                {..._.omit(props, 'onToggleValidaterStates', 'onToggleButtonState', 'initValue','visibleHeader')}
            />
        );
    }
}


