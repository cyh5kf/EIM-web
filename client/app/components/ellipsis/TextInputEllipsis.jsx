import React from 'react';

class TextInputEllipsis extends React.Component {
    constructor (props){
        super(props);
    }

    getEllpsis(){
        let len = this.props.text.length;
        let limit = this.props.limit;
        if(len <= limit){
            return this.props.text;
        }
        return this.props.text.substring(0, limit) + '...';
    }
}

export default TextInputEllipsis;



