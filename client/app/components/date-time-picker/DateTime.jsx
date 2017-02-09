import React, {PropTypes} from 'react';
import Calendar from 'rc-calendar';
import _ from 'underscore';

import PureRenderComponent from '../PureRenderComponent';
import {getGregorianCalendar} from './gregorianCalendar';
import exposeLocale from '../exposeLocale';

import 'rc-calendar/assets/index.css';
import 'rc-time-picker/assets/index.css';

// 与 DateTimePicker 不同之处在于: 直接显示日期选择器, 而不是显示在弹出框内
@exposeLocale([], {antdCalendarLocale: true})
export default class DateTime extends PureRenderComponent {
    static propTypes = {
        value: PropTypes.number,
        defaultValue: PropTypes.number,
        onSelect: PropTypes.func, // 参数: onSelect(value: number|null), 仅在选择时间时触发
        onChange: PropTypes.func, // 参数: onChange(value: number|null), 在选择时间、切换年月时均会触发
        showDateInput: PropTypes.bool
    };
    static defaultProps = {
        onChange: _.noop,
        onSelect: _.noop,
        showDateInput: false
    };

    handleChange = gregorianCalendar => this.props.onChange(gregorianCalendar ? gregorianCalendar.time : null);
    handleSelect = gregorianCalendar => this.props.onSelect(gregorianCalendar ? gregorianCalendar.time : null);

    render() {
        const {value, defaultValue, showDateInput} = this.props,
            {antdCalendarLocale} = this.state,
            valueProps = value != null ? {value: getGregorianCalendar(value)} : {defaultValue: getGregorianCalendar(defaultValue)};
        return <Calendar className="date-time" {...valueProps}
                         locale={antdCalendarLocale}
                         onChange={this.handleChange}
                         onSelect={this.handleSelect}
                         showOk={false}
                         showDateInput={showDateInput}/>;
    }
}
