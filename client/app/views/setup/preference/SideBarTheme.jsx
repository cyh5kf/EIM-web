import React from 'react';

export default class SideBarTheme extends React.Component{

    constructor(props){
        super(props);
        this.state = {show:true,markmsgreadtype:this.props.markmsgreadtype};
    }

    open(){
        this.setState({show:true});
    }

    close(){
        this.setState({show:false});
    }

    componentWillReceiveProps(nextProps){
        this.setState({markmsgreadtype:nextProps.markmsgreadtype});
    }

    changeReadStatus(val){
        this.props.parent.updateUserSetting({markmsgreadtype:val});
    }

    render(){
        var showClass = this.state.show?'':'hidden';
        return (<div className={"displayBox sideBarTheme "+showClass}>
                    
                </div>);
    }
}

