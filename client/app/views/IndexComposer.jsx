import React, {PropTypes} from 'react';

import "./IndexComposer.less";

export default class IndexComposer extends React.Component{
    static propTypes = {
        children: PropTypes.node
    };

    constructor(props){
        super(props);
    }
    
    render(){
        return (<div className="index_wrap eim_global">{this.props.children}</div>);
    }
}