import React from 'react';
import ReactDOM from 'react-dom';

import PureRenderComponent from '../../../components/PureRenderComponent';
import {ContactGroupSchema} from '../../../core/schemas/ContactGroupsSchemas';
import {TeamMemberSchema} from '../../../core/schemas/TeamMembersSchema';
import ReactPropTypes from '../../../core/ReactPropTypes';
import classnames from '../../../utils/ClassNameUtils';
import defAvatarImg from '../../../../static/images/default_user_avatar.png';

import './mentionlist.less';

class MentionListItem extends PureRenderComponent {

    static propTypes = {
        mention: ReactPropTypes.oneOfType([
            ReactPropTypes.ofSchema(ContactGroupSchema),
            ReactPropTypes.node,
            ReactPropTypes.object,
            ReactPropTypes.ofSchema(TeamMemberSchema)
        ]).isRequired,
        className:ReactPropTypes.string,
        onItemHighlight:ReactPropTypes.func,
        index:ReactPropTypes.number
    };

    render() {
        let style ={
                "backgroundImage":'url('+ (this.props.mention.avatar || defAvatarImg) +')',
                "backgroundColor": "rgb(246, 246, 246)"
        };
    
        if(this.props.mention.guuid){
            return <li data-index={this.props.index} key={this.props.mention.guuid}
                 className={this.props.className}
                 data-name={this.props.mention.name}
                 data-mid={this.props.mention.guuid}
                onMouseOver={this.props.onItemHighlight}>
                        <span className="broadcast">@{this.props.mention.name}</span>
                        <span className="broadcast_info">{this.props.mention.desc}</span>
                </li>;
        }else{
            return <li data-index={this.props.index}
             key={this.props.mention.uid}
             className={this.props.className}
             data-name={this.props.mention.username} 
             data-mid={this.props.mention.uid}
             onMouseOver={this.props.onItemHighlight}
            >
                <span  className="member_image"
                data-member-id={this.props.mention.uid }
                style={style} aria-hidden="true"></span>
                <span className="username">{this.props.mention.username}</span>
                <span className="realname">{this.props.mention.firstname}{this.props.mention.lastname}</span>
            </li>;
        }
    }
}

export default class MentionList extends PureRenderComponent {
    static propTypes = {
        mentions:ReactPropTypes.array,
        onItemHighlight:ReactPropTypes.func,
        onItemSelect:ReactPropTypes.func,
        className: ReactPropTypes.string,
        itemClassName:ReactPropTypes.string
    };

    select=()=>{
        let active = $(ReactDOM.findDOMNode(this.refs.root)).find('li.'+this.props.itemClassName+'-active');
        if(active.attr('data-name')){
            this.props.onItemSelect(active.attr('data-mid'), active.attr('data-name'));
        }
    }

    selectNext=()=>{
        let  active = $(ReactDOM.findDOMNode(this.refs.root)).find('.'+ this.props.itemClassName+'-active');
        let toActive = active.next();
        if(!toActive.hasClass(this.props.itemClassName)){
            toActive = toActive.next();
        }
        if(!toActive.hasClass(this.props.itemClassName)){
            toActive = $(ReactDOM.findDOMNode(this.refs.root)).find('li:first-child');
        }
        this._activeItem(active, toActive);
    }

    getSelect=()=>{
         return $(ReactDOM.findDOMNode(this.refs.root)).find('li.'+this.props.itemClassName+'-active');
    }

    _activeItem=(active, toActive)=>{
         active.removeClass(this.props.itemClassName+'-active');
         if(toActive){
            toActive.addClass(this.props.itemClassName+'-active');
        }
        this.props.onItemHighlight(toActive.attr('data-mid'), toActive.attr('data-name'));
    }

    selectPrev=()=>{
        let active = $(ReactDOM.findDOMNode(this.refs.root)).find('.'+ this.props.itemClassName +'-active');
        let toActive = active.prev();
        if(!toActive.hasClass(this.props.itemClassName)){
            toActive = toActive.prev();
        }
        if(!toActive.hasClass(this.props.itemClassName)){
             toActive = $(ReactDOM.findDOMNode(this.refs.root)).find('li:last-child');
        }
        this._activeItem(active, toActive);
    }

    onItemHighlight=(e)=>{
        let li = $(e.target).closest('li');
        $(ReactDOM.findDOMNode(this.refs.root)).find('li').removeClass(this.props.itemClassName+'-active');
        li.addClass(this.props.itemClassName+'-active');
        if(li.attr('data-name')){
            this.props.onItemHighlight(li.attr('data-mid'), li.attr('data-name'));
        }
    }

    onItemSelect=(e)=>{
        let li = $(e.target).closest('li');
        this.props.onItemSelect(li.attr('data-mid'), li.attr('data-name'));
    }

    static defaultProps = {
        className: 'mentionlist',
        itemClassName:'listitem'
    }

    render() {
        let mentionItems = null;
        let idx = 0;
        mentionItems = this.props.mentions.map(mention => {

            //another way to check item type?
            if(mention.type){
                idx++;
                return mention;
            }
            let item = <MentionListItem index={idx}
            className={classnames(this.props.itemClassName, idx===0?this.props.itemClassName + '-active':'')} 
            key={mention.uid || mention.guuid} onItemHighlight={this.onItemHighlight} mention={mention}/>
            idx++;
            return item;
        });
      
        return (
            <ul ref="root" className={this.props.className} 
             onClick={this.onItemSelect}>
                 {mentionItems}
          </ul>
        );
    }
}
