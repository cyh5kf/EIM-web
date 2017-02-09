import React from 'react';

export default class RadioGroup extends React.Component {
    constructor(props) {
        super(props);
    }

    renderRadioList(value,items){
        var that = this;
        var arr = [];
        for(var i = 0 ;i<items.length;i++){
            var item = items[i];
            var isChecked = (item.value===value);
            var key = item.key || (item.value+"" + i);
            arr.push(
                <li key={key} onClick={that.onClickItem.bind(that,item)} className={(isChecked?"eim-radio-item selected":"eim-radio-item")}>
                    <span className="eim-radio"></span>
                    <div>{item.display}</div>
                </li>
            );
        }
        return arr;
    }

    onClickItem(item,e){
        var onClick = this.props.onClick;
        if(onClick){
            onClick(item,e);
        }
    }

    render(){

        var value = this.props.value;
        var items = this.props.items|| [];//{key:1,display:""}

        return (
            <div>
                <ul className="eim-radio-group optionList">
                    {this.renderRadioList(value,items)}
                </ul>
                <div style={{clear:'both'}}></div>
            </div>
        );
    }
}



RadioGroup.propTypes = {
    onClick: React.PropTypes.func,
    value: React.PropTypes.any,
    items: React.PropTypes.array
};
