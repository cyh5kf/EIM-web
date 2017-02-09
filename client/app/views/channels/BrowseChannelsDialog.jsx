import exposeLocale from '../../components/exposeLocale';
import StringUtils from '../../utils/StringUtils';
import SearchStore from '../../core/stores/SearchStore';
import ChannelsStore from '../../core/stores/ChannelsStore';
import Select from '../../components/rc-select/Select';
import Dialog from '../../components/dialog/Dialog';
import FullScreenDialog from '../../components/dialog/FullScreenDialog';
import PureRenderComponent from '../../components/PureRenderComponent';
import NewGroupChatDialog from './newchat/NewGroupChatDialog';
import React from 'react';
import _ from 'underscore';
import exposeUserInfo from '../view-components/exposeUserInfo';
import SwitchChannelCmd from '../../core/commands/channel/SwitchChannelCmd';
import TimeZoneUtils from '../../utils/TimeZoneUtils';
import ReactPropTypes from '../../core/ReactPropTypes';
import {SearchUserListSchema} from '../../core/schemas/SearchStoreSchemas';
import {searchUserCmd} from '../../core/commands/searchUserCommands';
import EnumSearchUserType from '../../core/enums/EnumSearchUserType';
import EnumSearchChannelSortType from '../../core/enums/EnumSearchChannelSortType';

import './create-channel.less';

const SEARCH_SLICE = 'browse-channels';

export default class BrowseChannelsDialogComposer extends PureRenderComponent {
    static propTypes = {
        onClose: ReactPropTypes.func
    }
    _updateSearchedResults = () => this.setState({
        searchedChannels: SearchStore.getSearchUserList(SEARCH_SLICE)
    })
    componentWillMount() {
        this._updateSearchedResults();
        SearchStore.addSearchUserListener(this._updateSearchedResults, SEARCH_SLICE);
    }
    componentWillUnmount() {
        SearchStore.removeSearchUserListener(this._updateSearchedResults, SEARCH_SLICE);
    }
    render() {
        return <BrowseChannelsDialog {..._.pick(this.props, ['onClose'])} {..._.pick(this.state, ['searchedChannels'])}/>
    }
}

@exposeLocale(['CHANNEL_BROWSE'])
@exposeUserInfo
class BrowseChannelsDialog extends FullScreenDialog {
    static propTypes = {
        ...FullScreenDialog.propTypes,
        searchedChannels: ReactPropTypes.ofSchema(SearchUserListSchema)
    }
    static defaultProps = {
        ...FullScreenDialog.defaultProps,
        name: 'dlg-browseChannel'
    };

    constructor(props) {
        super(props);
        this.state = {show:true,
            channelKeywords:'',
            sortType: EnumSearchChannelSortType.ChannelName,
            sortedPropsList:EnumSearchChannelSortType.dataList()
        };
    }

    onCreateChannelClick = e => {
        this.close();
        Dialog.openDialog(NewGroupChatDialog, {
            onBack: () => Dialog.openDialog(BrowseChannelsDialogComposer),
            hiddenFooter: true
        })
    }

    sortPropsCallback = (obj) => {
        this.setState({sortType:obj.id});
        searchUserCmd({
            slice: SEARCH_SLICE,
            userTypes: [EnumSearchUserType.Channel],
            keyword: this.state.channelKeywords,
            channelSortType: obj.id
        });
    }

    doSearch(filterStateChanges = {}) {
        const condition = _.assign(
            _.pick(this.state, ['channelKeywords', 'sortType']),
            filterStateChanges
        );
        this.setState(filterStateChanges);
        searchUserCmd({
            slice: SEARCH_SLICE,
            userTypes: [EnumSearchUserType.Channel],
            keyword: condition.channelKeywords,
            channelSortType: condition.sortType
        });
    }

    attendToThisChannel = (channel)=>{
        SwitchChannelCmd({sessionid: channel.id, sessiontype: channel.userType, openIfNotExist: true});
        this.close();
    }

    searchWordsChanged = (e) => {
        const value = e.target.value;
        this.doSearch({channelKeywords:value});
    }

    channelTemplate = (channel) => {
        let createdInfo = '';
        let locale = this.state.locale;
        let userInfo = this.state.userInfo;
        if (channel.creatorname && channel.gmtcreate){
            let gmtcreate = TimeZoneUtils.formatToTimeLine(channel.gmtcreate);
            createdInfo = StringUtils.format(locale.createdLabel,channel.creatorname, gmtcreate);
        }
        const hasJoined = channel && channel.members.every(member => member.uid !== userInfo.uid);
        return (<li key={channel.id}>
                    <div>
                        <span className="channelLine"><span className="simpol">{locale.channelSimpol}</span><span className="channelName" dangerouslySetInnerHTML={{__html: channel.name}}/></span>
                        <span className="joindedLabel">{hasJoined?'':locale.joinedLabel}</span>
                        <span className="userIcon"><span className="ficon_button ficon_user"></span><span className="text">{channel.members.size}</span></span>
                    </div>
                    {createdInfo&&<div className="createdInfo" dangerouslySetInnerHTML={{__html: createdInfo}}></div>}
                    {channel.desc&&<div className="channelDesc">{channel.desc}</div>}
                    <div className="attend_icon" onClick={e=>this.attendToThisChannel(channel)}>
                        <i className="ficon_enter"></i>
                        <div className="preview">{locale.previewLabel}</div>
                    </div>
                </li>);
    }

    onShow() {
        this.doSearch();
    }

    renderContent() {
        let {searchedChannels} = this.props,
            locale = this.state.locale,
            recentSessionList = null;
        let total = ChannelsStore.getChannelCount();
        let title = StringUtils.format(locale.title,total);
        const {sortedPropsList, sortType} = this.state;
        if(searchedChannels){
            recentSessionList = searchedChannels.map(this.channelTemplate);
        }
        return (<div className="browseChannel">
                    <div className="dlg-title">{title}<button className="createChannel floatRight" onClick={this.onCreateChannelClick}>{locale.createChannelLabel}</button></div>
                    <div className="operateChannels">
                        <div className="searchChannels floatLeft">
                            <div className="icon icon-createchannel-listview-search searchIcon floatLeft"></div>
                            <input type="text" className="searchBox floatLeft" value={this.state.channelKeywords} placeholder={locale.searchChannelLabel} onChange={this.searchWordsChanged}/>
                        </div>
                        <div className="sortedProps floatLeft">
                            <label>{locale.sortedLabel}</label>
                            <div className="selectProps">
                                <Select showSearch={false} selectedDatasource={sortedPropsList.find(item => item.id === sortType)} datasource={sortedPropsList} onSelectedDatasourceChange={this.sortPropsCallback}/>
                            </div>
                        </div>
                        <div className="clearFloat"></div>
                    </div>
                    <div className="yourChannelsLabel">{locale.yourChannelsLabel}</div>
                    {recentSessionList&&recentSessionList.size>0&&
                    <div className="channelsBox">
                        <ul className="channelLists">
                            {recentSessionList}
                        </ul>
                    </div>}
                </div>);
    }

}

