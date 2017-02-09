import React from  'react';
import ShareFileListView from './ShareFileListView';
import ShareFileDetail from './ShareFileDetail';
import PureRenderComponent from '../../components/PureRenderComponent';
import {FileMsgListSchema} from '../../core/schemas/SearchStoreSchemas';
import ReactPropTypes from '../../core/ReactPropTypes';
import ChannelsStore from '../../core/stores/ChannelsStore';
import QueryShareFilesCommand from '../../core/commands/channel/QueryShareFilesCommand';
import PanelHeader from '../right-panel/PanelHeader';
import exposeChannelData from '../view-components/exposeChannelData';

@exposeChannelData({channelFiles: true})
export default class SessionFilesComposer extends PureRenderComponent {
    static propTypes = {
        sessionid:ReactPropTypes.string.isRequired,
        onHidePanel: ReactPropTypes.func.isRequired,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired
    }

    render() {
        const {channelFiles} = this.state;        
        return <SessionFilesView sessionid={this.props.sessionid} dataSource={channelFiles} onHidePanel={this.props.onHidePanel}
                locale={this.props.locale} />;
    }
}

class SessionFilesView extends React.Component{

    static propTypes = {
        sessionid:ReactPropTypes.string.isRequired,
        dataSource: ReactPropTypes.ofSchema(FileMsgListSchema).isRequired,
        onHidePanel: ReactPropTypes.func.isRequired,
        locale: ReactPropTypes.ofLocale(['DASHBOARD', 'sessiondetail']).isRequired
    }

    constructor(props){
        super(props);

        this.state = {
            subPageType:0,            
            displayFile:null           
        }
    }    

    onShowFileDetail=({fileInfo, isEdited})=>{
        this.setState({
            subPageType:1,            
            displayFile:fileInfo
        });
    }


    onLoadMore=()=>{         
        let files = this.props.dataSource;
        if(files && files.size > 0){
            const last = files.last();
            if(last){
                let channel = ChannelsStore.getChannel(this.props.sessionid);
                QueryShareFilesCommand({channel, 'endtime':last.msgTime, 'lastResourceId':last.resourceid});
            }
        }
    }

    onShowMainPage=()=>{
        this.setState({subPageType:0});        
    }    

    render(){
        const locale = this.props.locale;        
        
        const subPageType = this.state.subPageType;        

        let panelTitle = null;
        
        const channel = ChannelsStore.getChannel(this.props.sessionid);

        let filesView = (
                 <ShareFileListView dataSource={this.props.dataSource} fullLoaded={channel?channel.fileFullLoaded:true} onShowFileDetail={this.onShowFileDetail} onLoadMore={this.onLoadMore} locale={locale}/>
            );
            
        if(subPageType === 0){
            panelTitle = (
                <PanelHeader title={locale.sessionfiles} onClickAction={this.props.onHidePanel} withBack={false} />  
            );
        }
        else{
            panelTitle = (
                <PanelHeader title={locale.sessionfiles} onClickAction={this.onShowMainPage} withBack={true} />                      
            );
        }        

        let mainContent = (
            <div className={"session-detail-content scroll-y-content"+(subPageType===0?"":" hidden")}>
                {filesView}
            </div>
        );

        let subContent = null;
        if(subPageType === 1){
           subContent = (
                <div className={"scroll-y-content"+(subPageType===0?" hidden":"")}>
                    <ShareFileDetail displayFile={this.state.displayFile} isNameEdit={false}/>
                </div>
            );
        }         

        return (
            <div className="max-panel-view inner-content session-files">
                {panelTitle}
                <div className="panel-entity">
                    {mainContent}
                    {subContent}
                </div>
            </div>
        );
    }
}

