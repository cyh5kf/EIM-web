import React from  'react';
import Overlay from 'react-bootstrap/lib/Overlay';
import Popover from 'react-bootstrap/lib/Popover';
import SearchInput from '../../components/search-input/SearchInput';
import TeamMembersStore from '../../core/stores/TeamMembersStore';

export default class UserCheckPopover extends React.Component{
                
    constructor(props){        
		super(props);
                
		this.state ={
            show:props.show,
            searchText:""
        };
	}

    static propTypes = {
        show:React.PropTypes.bool.isRequired,
        onChecked:React.PropTypes.func.isRequired,
        placement:React.PropTypes.string.isRequired,
        target: React.PropTypes.func.isRequired,
        onHidePopover:React.PropTypes.func.isRequired,
        locale:React.PropTypes.object.isRequired
    }

    componentWillUnmount(){        
        if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }        
    }  

    componentDidMount(){
        this._handleOnShow(this.state.show);
    }    

    _handleOnShow(show){
        if(show){
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
            
            this.onDocClickListener = this.close.bind(this);
            document.addEventListener('click', this.onDocClickListener, false);
        }else{
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }
        }

    }

    componentWillReceiveProps(props){        
        this._handleOnShow(props.show);

        this.setState({
            show:props.show});
    }    
    

    toggle() {
        this._handleOnShow(!this.state.show);
        this.setState({ show: !this.state.show });

    }

    close(e) {        
        if(!$(e.target).closest('.userCheckPopover').hasClass('userCheckPopover')){
            //关闭时移除监听
            if(this.onDocClickListener) {
                document.removeEventListener('click', this.onDocClickListener, false);
                this.onDocClickListener = null;
            }

            this.setState({ 
                show: false,
                searchText: ''
                 });
                 
            this.props.onHidePopover();
        }
    }

    handleSearchChange=(searchText)=>{
        this.setState({searchText});
    }

    onChecked=(uid)=>{
        this.props.onChecked(uid);
        this.props.onHidePopover();
    }
 
	render(){
        let that = this;        
        const {searchText} = this.state;
        const locale = this.props.locale;
        const searchKey = searchText.toLowerCase();
        const members = TeamMembersStore.getTeamMembers();
        const searchPassed = text => text.toLowerCase().indexOf(searchKey) !== -1;
        let itemList = [];
        members.forEach(member => {
                    if (searchPassed(member.username) || searchPassed(member.email)) {
                        itemList.push(
                            <li key={member.uid} className="member-item disp-block">
                                <div className="item-content" onClick={e=>that.onChecked(member.uid)}>
                                    <span className="member-avatar" style={member.avatar ? {background: `url(${member.avatar}) center/cover no-repeat`} : {}}></span>
                                    <span className="name">{member.username}</span>
                                </div>
                            </li>
                            );
                    }
                })

		return (
            <Overlay show={this.state.show} placement={this.props.placement}
                     onHide={() => this.setState({ show: false })}
                    target={() => this.props.target()} >
                <Popover id="userCheckPopover" className="userCheckPopover" >
                    <div className="member-filter">
                        <SearchInput value={searchText} onValueChange={this.handleSearchChange} placeholder={locale.findByName} />

                    </div>
                    <div className="menu-items-scroller">
                        <ul className="list-unstyled menu-items">
                            {itemList}
                        </ul>
                    </div>
                </Popover>
            </Overlay>
        );
    }
}

