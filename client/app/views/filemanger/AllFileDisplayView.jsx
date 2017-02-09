import React from  'react';
import FileFilterComposer from './FileFilterComposer';

export default class AllFileDisplayView extends React.Component{

    static propTypes = {                
        show:React.PropTypes.bool.isRequired,
        onSwitchPanelByIndex:React.PropTypes.func.isRequired,
        onHidePanel:React.PropTypes.func.isRequired,
        locale:React.PropTypes.object
    };
       
    constructor(props){        
		super(props);
                
		this.state ={show:props.show};
	}
    
    componentWillReceiveProps(props){
        this.setState({show: props.show});
    }

    onSwitchPanelByIndex=(index)=>{
        this.props.onSwitchPanelByIndex(index);
    }
 
	render(){                  
        const locale = this.props.locale;
        let show = (this.state.show ? "" :" hidden");
		return (
            <div className={"max-panel-view file-display-view height-full"+show}>                  
                 <FileFilterComposer locale={locale.allfiles} onSwitchPanelByIndex={this.onSwitchPanelByIndex} onHidePanel={this.props.onHidePanel} />                
            </div>
        );
    }
}

