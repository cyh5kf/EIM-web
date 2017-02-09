import React, {PropTypes} from 'react';
import Calendar from 'rc-calendar';
import Picker from 'rc-calendar/lib/Picker';
import TimePicker from 'rc-time-picker';
import moment from 'moment';

import PureRenderComponent from '../PureRenderComponent';
import {getGregorianCalendar} from './gregorianCalendar';
import exposeLocale from '../exposeLocale';

import 'rc-calendar/assets/index.css';
import 'rc-time-picker/assets/index.css';

@exposeLocale([], {antdCalendarLocale: true})
export default class DateTimePicker extends PureRenderComponent {
    static propTypes = {
        value: PropTypes.number,
        onChange: PropTypes.func.isRequired, // 参数: onChange(value: number|null)
        renderTime: PropTypes.func
    };
    static defaultProps = {
        renderTime(time) {
            return <input className="date-time-picker-input" value={time == null ? '' : moment(time).format('YYYY-MM-DD HH:mm')} placeholder="请选择时间" readOnly/>;
        }
    };

    handleChange = calendarValue => this.props.onChange(calendarValue ? calendarValue.time : null);
    renderPickerContent = ({value: calendarValue}) => this.props.renderTime(calendarValue ? calendarValue.time : null);

    render() {
        const calendarValue = getGregorianCalendar(this.props.value);
        const {antdCalendarLocale} = this.state;
        const calendar = <Calendar locale={antdCalendarLocale} className="date-time" defaultValue={calendarValue} timePicker={<TimePicker/>}/>;
        return (
            <Picker calendar={calendar}
                    animation="slide-up"
                    value={calendarValue}
                    onChange={this.handleChange}
            >
                {this.renderPickerContent}
            </Picker>
        );
    }
}
