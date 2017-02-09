import Pool from './PoolMixin';
var NS = 'messagePool$$';
module.exports = {
    lastSyncTime:function(){
        return Pool.get(NS  +'.lastSyncTime');
    },

    clear: function(){
        Pool.remove(NS  +'.lastSyncTime');
    },

    saveSyncTime:function(synctime){
        const lastSyncTime = Number(Pool.get(NS  +'.lastSyncTime') || '0');
        if (Number(synctime) > lastSyncTime) {
            Pool.set(NS + '.lastSyncTime', synctime);
        }
    }
}
