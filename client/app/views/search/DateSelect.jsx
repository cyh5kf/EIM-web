import React from  'react';
import DateTime from '../../components/date-time-picker/DateTime';

export default class DateSelect extends React.Component{
                 
    constructor(props){        
		super(props);

        this.state={
            selectState:0,
            startDate:NaN,
            endDate:NaN
        }
	}

    onDateChanged(time){
        if(this.state.selectState === 0){
            this.setState({startDate:time});            
            
            this.onSelectState(1);
        }
        else{            

            var date = new Date();
            date.setTime(time);
            date.setHours(23);
            date.setMinutes(59);
            date.setSeconds(59);
            date.setMilliseconds(59);

            let selectedTime = date.getTime();
            this.setState({endDate:selectedTime});
                        
            this.props.onDateSelectDone(this.state.startDate, selectedTime);
        }
    }

    onSelectState(state){        
        this.setState({selectState:state});
    }

    onDoRange(index){        

        var start = NaN;        

        var date = new Date();        
        date.setHours(23);
        date.setMinutes(59);
        date.setSeconds(59);
        date.setMilliseconds(59);
        var end = date.getTime();

        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        date.setMilliseconds(0);

        switch (index) {
            case 0:
                break;
            case 1:
                {
                    //最近一周
                    date.setTime(date.getTime() - 86400*6*1000);
                }
                break;
            case 2:
                {
                    //最近一月
                    date.setTime(date.getTime() - 86400*29*1000);
                }
                break;
            case 3:
                {
                    //最近一年
                    date.setFullYear(date.getFullYear() - 1);
                }
                break;        
            default:
                break;
        }

        start = date.getTime();
        this.props.onDateSelectDone(start, end);
    }
 
	render(){
        const locale = this.props.locale;
        var startActive = (this.state.selectState === 0)?" active":"";
        var endActive = (this.state.selectState === 1)?" active":"";

        var rangeIndex = 0;

        var nowTime = new Date();
        nowTime.setHours(0);
        nowTime.setMinutes(0);
        nowTime.setSeconds(0);
        nowTime.setMilliseconds(0);

        var startDate = (new Date()).toLocaleDateString();
        if (!Number.isNaN(this.state.startDate)) {
            startDate = (new Date(this.state.startDate)).toLocaleDateString();
        }

        var endDate = (new Date()).toLocaleDateString();
        if (!Number.isNaN(this.state.endDate)) {
            endDate = (new Date(this.state.endDate)).toLocaleDateString();
        }
        
		return (
            <div className="date-select">
                <div className="disp-block">
                    <span className="note-label disp-inblock">{locale.startdate}</span>
                    <span className={"date-item start-date disp-inblock"+startActive} onClick={this.onSelectState.bind(this,0)}>{startDate}</span>
                </div>
                <div className="disp-block">
                    <span className="note-label disp-inblock">{locale.enddate}</span>
                    <span className={"date-item end-date disp-inblock"+endActive} onClick={this.onSelectState.bind(this,1)}>{endDate}</span>
                </div>
                <DateTime onSelect={this.onDateChanged.bind(this)} defaultValue={nowTime.getTime()} />
                <div className="disp-block">
                    <span className="range-item disp-block" onClick={this.onDoRange.bind(this,rangeIndex++)}>{locale.today}</span>
                    <span className="range-item disp-block" onClick={this.onDoRange.bind(this,rangeIndex++)}>{locale.latestweek}</span>
                    <span className="range-item disp-block" onClick={this.onDoRange.bind(this,rangeIndex++)}>{locale.latestmonth}</span>
                    <span className="range-item disp-block" onClick={this.onDoRange.bind(this,rangeIndex++)}>{locale.latestyear}</span>
                </div>
            </div>
        );
    }
}

