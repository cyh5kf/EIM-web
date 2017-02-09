import _ from 'underscore';

function FileManager(){
    this.files = [];
    this.commands = {};
    this.status = 0; //status = 0 inited, 1:pending todo
    //promise for aync ?
}

FileManager.prototype.registerCommand = function(command, value){
    if(_.isObject(command)){
        this.commands = _.extend(this.commands, command);
    }else{
        this.commands[command] = value;
    }
}

FileManager.prototype.requestComand = function(command, args){
    this.commands[command](args);
}

FileManager.prototype.onAddFile = function(fileItem){
    this.files.push(fileItem);
}


FileManager.prototype.onRemoveFile = function(fileItem){
    this.files = _.without( this.files, fileItem);
}

FileManager.prototype.sort = function(){
    this.files = _.sortBy( this.files, 'modifytime');
}

var gFileManager = new FileManager();

module.exports = gFileManager;
