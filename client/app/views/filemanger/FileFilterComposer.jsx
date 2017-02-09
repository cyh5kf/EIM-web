import React from  'react';
import immutable from 'immutable';

import PureRenderComponent from '../../components/PureRenderComponent';
import FileFilterView from './FileFilterView';
import FileFilterStore from '../../core/stores/FileFilterStore';
import gGlobalEventBus from '../../core/dispatcher/GlobalEventBus';
import ShareFileDetail from './ShareFileDetail';
import PanelHeader from '../right-panel/PanelHeader';
import exposePendingCmds from '../view-components/exposePendingCmds';
import {GetFilterFilesCmd} from '../../core/commands/fileFilterCommands';

//let currentFilesIndex = 0;

let filterKeyInfo = null;

@exposePendingCmds([GetFilterFilesCmd])
export default class FileFilterComposer extends PureRenderComponent {
    static propTypes = {                
        onHidePanel:React.PropTypes.func.isRequired,
        locale:React.PropTypes.object
    };

    requestMore=()=>{
        if(filterKeyInfo){
            filterKeyInfo.endTime = (new Date()).getTime();

            //这里应当重新取数据，不能用state的数据，因为上次过滤之后直接关闭页面，重新打开state的数据没有清空            
            const searchMsgs = FileFilterStore.getLoadedFiles();        
            const files = searchMsgs.get('files');       
            if(files && files.size > 0){
                const latest = files.last();
                filterKeyInfo.endTime = latest.msgTime;
                filterKeyInfo.lastResourceId = latest.resourceid;
            }            
            GetFilterFilesCmd(filterKeyInfo);
        }        
    }


    updateMessages = () => {

        const searchMsgs = FileFilterStore.getLoadedFiles();        
        let filemsgs = searchMsgs.get('files');        

        this.setState({                                    
            fileMessages: filemsgs,
            filesResultCount:(isNaN(searchMsgs.get('filesCount'))?0:searchMsgs.get('filesCount')),
            isLastBatch: FileFilterStore.isLastBatch()
        });     
    };

    onDoFileFilter=(uid)=>{

        this.setState({checkedUid:uid, fileMessages:immutable.List()});        
        
        let keyInfo = {
            uploaduid:uid,
            startTime: NaN,
            endTime: (new Date()).getTime(),
            limit: 20,
            lastResourceId:NaN
        };
        FileFilterStore.resetFilter();

        filterKeyInfo = keyInfo;
        this.requestMore();
    }

    componentWillMount() {
        this.setState({            
            fileMessages: immutable.List(),
            filesResultCount:0,   
            isLastBatch: true,         
            checkedUid:"",
            isSubPage:false,
            displayFile:null
        });
        FileFilterStore.addEventListener('filterFilesChange', this.updateMessages);        
        gGlobalEventBus.addEventListener('onDoFileFilter', this.onDoFileFilter);

        gGlobalEventBus.addEventListener('onSessionFileDetail', this.onShowFileDetail);
    }

    componentWillUnmount() {
        FileFilterStore.removeEventListener('filterFilesChange', this.updateMessages);        
        gGlobalEventBus.removeEventListener('onDoFileFilter', this.onDoFileFilter);
        gGlobalEventBus.removeEventListener('onSessionFileDetail', this.onShowFileDetail);
    }
   
    onLoadMore=()=>{                        
        this.requestMore();        
    }

    onShowFileDetail=({fileInfo, isEdited})=>{
        this.setState({
            isSubPage:true, 
            isNameEdit:isEdited,           
            displayFile:fileInfo
        });
    }

    onEditDone=(newName)=>{
        let displayFile = this.state.displayFile;
        if(displayFile){
            displayFile.name = newName;
            this.setState({
                isNameEdit:false,
                displayFile:displayFile        
            });
        }
    }

    onShowFilterPage=()=>{                
        this.setState({
            isSubPage:false,
            isNameEdit:false
        });        
    }
    
	render(){
        const locale = this.props.locale;
        const {fileMessages, filesResultCount, isSubPage,pendingCmds} = this.state;                
        
        let header = null;
        if(isSubPage){
            header = (
                <PanelHeader title={locale.files} onClickAction={this.onShowFilterPage} withBack={true} />                
            );
        }
        else{
            header = (
                <PanelHeader title={locale.allFilesTitle} onClickAction={this.props.onHidePanel} withBack={false} />                     
            );
        }

		return (
            <div className="inner-content search-result-composer disp-block">            
                {header}                  
                <div className={"panel-entity"+(isSubPage?" hidden":"")}>             
                    <FileFilterView fileMessages={fileMessages}
                     filesResultCount={filesResultCount} 
                     locale={locale} onLoadMore={this.onLoadMore} 
                     onShowFileDetail={this.onShowFileDetail} checkedUid={this.state.checkedUid} 
                     isLastBatch={this.state.isLastBatch} isPending={pendingCmds.isPending(GetFilterFilesCmd)}/>
                </div>
                {isSubPage && <div className="panel-entity">             
                    <div className="scroll-y-content">
                    <ShareFileDetail displayFile={this.state.displayFile} isNameEdit={this.state.isNameEdit} onEditDone={this.onEditDone} />
                    </div>
                </div>
                }
                
            </div>
        );  
    }
}

