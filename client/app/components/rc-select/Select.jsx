import React, {PropTypes} from 'react';
import RCSelect from './lib/Select';
import Option from 'rc-select/lib/Option';
import OptGroup from 'rc-select/lib/OptGroup';
import _ from 'underscore';
import PureRenderComponent from '../PureRenderComponent';

import 'rc-select/assets/index.css';
import './Select.less';

_.assign(RCSelect.defaultProps, {
    animation: 'slide-up'
});

export {RCSelect, Option, OptGroup};

const defaultRenderer = (data, props) => props.labelAsHtml ? <span dangerouslySetInnerHTML={{__html: data[props.labelField]}}/> : data[props.labelField];
const defaultFilterOption = function (inputText, data) {
    return (data[this.props.labelField] || '').toLowerCase().indexOf(inputText.toLowerCase()) > -1;
};


// 以下组件提供除了rc-select原有方式之外的另一种设置数据的方式 -- 直接传递数据,而非Option组件列表。因而涉及到option的地方,用这个组件都将转换为optionData
// 如要直接使用 rc-select 组件, 使用 RCSelect。
// 注: rc-select基类基础上添加了新的属性, 具体见 lib/Select.js propTypes"自定义新属性"描述
export default class Select extends PureRenderComponent {
    static propTypes = {
        datasource: PropTypes.array,
        selectedDatasource: PropTypes.oneOfType([PropTypes.array, PropTypes.object]), // 多选时为数组, 单选时为单个值
        onSelectedDatasourceChange: PropTypes.func,

        valueField: PropTypes.string,
        labelField: PropTypes.string,
        labelAsHtml: PropTypes.bool,

        renderInput: PropTypes.func, // 参数(data)
        renderOption: PropTypes.func, // 参数(data)

        // 以下属性同 RCSelect, 但是将 option 参数转换为 optionData
        onOptionHighlight: PropTypes.func, // 参数(optionData)
        filterOption: PropTypes.oneOfType([PropTypes.func, PropTypes.oneOf([false])]), // 函数参数 (inputText, optionData)

        // 以下属性同 RCSelect 自定义属性
        alwaysShowPopup: PropTypes.bool,
        autoFocus: PropTypes.bool,
        // 以下属性同 RCSelect
        onSearch: PropTypes.func,
        showSearch: PropTypes.bool,
        className: PropTypes.string,
        dropdownClassName: PropTypes.string,
        multiple: PropTypes.bool,
        placeholder: PropTypes.string,
        getPopupContainer: PropTypes.func,
        dropdownMatchSelectWidth: PropTypes.bool,
        notFoundContent: PropTypes.string
    };
    static defaultProps = {
        datasource: null,
        selectedDatasource: null,

        valueField: 'id',
        labelField: 'name',
        labelAsHtml: false,

        multiple: false,
        filterOption: defaultFilterOption,

        renderInput: defaultRenderer,
        renderOption: defaultRenderer,

        alwaysShowPopup: false
    };

    getRCSelect = () => this.refs['rc-select'];

    handleChange = values => {
        const {datasource, selectedDatasource, valueField, onSelectedDatasourceChange, multiple} = this.props,
            dataMap = (datasource || []).concat(selectedDatasource || []).reduce((result, data) => {
                result[data[valueField]] = data;
                return result;
            }, {});
        if (onSelectedDatasourceChange) {
            if (multiple) {
                onSelectedDatasourceChange(values.map(val => dataMap[val.key]));
            } else {
                onSelectedDatasourceChange(dataMap[values.key]);
            }
        }
    };

    filterOption = (inputText, optionChild) => {
        const {filterOption} = this.props;
        return filterOption ? filterOption.apply(this, [inputText, optionChild.props.data]) : true;
    }
    onOptionHighlight = option => {
        const {onOptionHighlight} = this.props;
        onOptionHighlight && onOptionHighlight(option.props.data);
    }

    render() {
        const props = this.props,
            {datasource, selectedDatasource, valueField, multiple, labelField, dropdownClassName, renderInput, renderOption} = props,
            getRCVal = data => ({key: data[valueField], label: renderInput(data, props)}),
            rcselectValues = (multiple ? (selectedDatasource || []) : (selectedDatasource && [selectedDatasource] || [])).map(getRCVal);
        return (
            <RCSelect ref="rc-select" dropdownClassName={`${dropdownClassName} ${datasource == null ? 'no-datasource' : ''}`}
                      optionLabelProp={labelField} value={rcselectValues} labelInValue={true}
                      alwaysFireSearch={true}
                      filterOption={this.filterOption}
                      onOptionHighlight={this.onOptionHighlight}
                      onChange={this.handleChange} {..._.pick(props, ['className', 'multiple', 'onSearch', 'placeholder', 'getPopupContainer', 'dropdownMatchSelectWidth', 'notFoundContent', 'alwaysShowPopup', 'showSearch', 'autoFocus'])}>
                {(datasource || []).map(data => {

                    return <Option key={data[valueField]} data={data}>{renderOption(data, props)}</Option>
                })}
            </RCSelect>
        );
    }
}
