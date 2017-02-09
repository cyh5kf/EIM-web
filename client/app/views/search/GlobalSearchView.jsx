import React from  'react';
import SearchResultComposer from './SearchResultComposer';

export default class GlobalSearchView extends React.Component{
       
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
            <div className={"max-panel-view global-search-view height-full"+show}>                  
                 <SearchResultComposer locale={locale.searchresult} onSwitchPanelByIndex={this.onSwitchPanelByIndex} onHidePanel={this.props.onHidePanel} />                
            </div>
        );
    }
}

