import _ from 'underscore';
import EventBus from '../../utils/EventBus';

export const MESSAGE_QUEUE_EVENTS = {
    ON_MESSAGE: 'onMessage',
    ON_SHOW_MESSAGE_NUM:'onDisplayMsgNum'
}

class UiMessageQueue extends EventBus {
    constructor(options) {
        super(...arguments);
        if(!options){
            //frequency 多短时间内的消息
            //delay 每条消息之前显示的间隔
            //threshold 在当前时间内，消息数量达到多少需要合并
            this.options = {delay:500, threshold:10, frequency:2000};
        }else{
           this.options = options;
        }
        this._triggered = false;
        this._messageStack = [];
        this._mergeQueue = [];
    }

    push = (message)=>{
        this._messageStack.push(message);
        if (!this._isProcessing()) {
             this._processMessageQueue();
        }
    }

    _haltProcessing = ()=>{
         this._triggered = false;
    }

    _startProcessing = ()=>{
         this._triggered = true;
    }

    _isProcessing = ()=>{
        return this._triggered;
    }

    _displayMessage = (message)=>{
        this.emit(MESSAGE_QUEUE_EVENTS.ON_MESSAGE, message);
    }

    _loop=(latestMsgTime)=>{
        //取出当前需要显示消息队列中第一条消息
         const startMessage = _.last(this._mergeQueue);
         if(startMessage){
                 //如果新来的消息和即将显示的消息队列的时间间隔已经大于时间阈值,那么需要显示消息
                if(latestMsgTime - startMessage.clienttime > this.options.frequency){

                    //如果当前的消息条数大于总数阈值，合并消息，只显示最近的3条
                    if(this._mergeQueue.length >= this.options.threshold){
                        let idx = 0;
                        //提示消息总数
                        this.emit(MESSAGE_QUEUE_EVENTS.ON_SHOW_MESSAGE_NUM, {num:
                            this._mergeQueue.length, 
                            topic:this._mergeQueue[0].topic
                        });

                        //显示最近的3条消息
                        while(idx <= 3){
                            const msg = this._mergeQueue.pop();                        
                            _.delay(()=>{
                                this._displayMessage(msg);
                            }
                            , this.options.delay);
                            idx++;
                        }
                        //清空即将显示的消息队列中的消息
                        this._mergeQueue = [];
                    }else{
                        while(this._mergeQueue.length > 0){
                            const msg = this._mergeQueue.pop();                        
                            _.delay(()=>{
                                this._displayMessage(msg);
                            }
                            , this.options.delay);
                        }
                    }
                return false;
            }
         }
        return true;
    }

    _processMessageQueue =()=>{
         this._startProcessing();
        if (this._messageStack.length > 0){
            let message = null;
            while((message = this._messageStack.shift()) != null) {
                this._mergeQueue.push(message);
                if(this._loop(message.clienttime)){
                    //每隔一段时间检查消息通知队列中，当没有消息来的时候，会存在消息进入队列，没有被消费的情况
                        _.delay(()=>{
                        this._processMessageQueue();
                    },  this.options.delay);
                }
                _.delay(()=>{
                     if(this._mergeQueue.length  === 1){
                        const msg = this._mergeQueue.pop(); 
                        this._displayMessage(msg);
                     }
                    this._processMessageQueue();
                },  this.options.delay);
            }
            if(this._mergeQueue.length === 0){
                 this._haltProcessing();
            }
        }else{
             //如果发现消息频率过快，也没有达到阈值的情况，再也没有收到新消息，这个时候，消息提醒队列在未满
             //的情况下超过了时间，也需要通知.
             if(this._loop((new Date()).getTime())){
                _.delay(()=>{
                    this._processMessageQueue();
                },  this.options.delay);
             }
             this._haltProcessing();
        }
    }
}
export default new UiMessageQueue();
