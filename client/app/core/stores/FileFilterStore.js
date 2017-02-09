import {createEventBus} from '../../utils/EventBus';
import {createImmutableSchemaData} from '../../utils/schema';
import {FilterFilesSchema} from '../schemas/SearchStoreSchemas';
import immutable from 'immutable';

let isLastBatch = true;
let loadedFiles = createImmutableSchemaData(FilterFilesSchema, {
    files: []
});

var FileFilterStore = createEventBus({
    // 重置消息搜索
    resetFilter(){                        
        loadedFiles = loadedFiles.set('files',immutable.List());
        isLastBatch = true;
    },

    //添加搜索结果，多页数据存储
    addLoadedFiles(fileList, isLast){
        let fileMsgs = loadedFiles.files;
            fileMsgs = fileMsgs.concat(fileList);            
            loadedFiles = loadedFiles.set('files', fileMsgs); 

        isLastBatch = isLast;
        this.emit('filterFilesChange');
    },
    
    //获取已有的搜索结果     
    getLoadedFiles() {
        return loadedFiles;
    },

    isLastBatch(){
        return isLastBatch;
    }
    
});

export default FileFilterStore;
