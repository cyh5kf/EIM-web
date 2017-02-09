function FileItem(fileid, gid){
    this.gid = gid;
    this.fileid = fileid;
    this.status = 0;
    this._meta = null;
}

FileItem.prototype.setMeta = function(meta){
    this._meta = meta;
}

FileItem.prototype.getMeta = function(){
    return this._meta;
}

module.exports = FileItem;
