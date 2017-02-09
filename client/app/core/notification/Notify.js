import Push from 'push.js'; 

export default {
    post:function(title, body, icon, callback) {
        Push.create(title, {
            body: body,
            icon: {
                x16: icon,
                x32: icon
            },
            timeout: 2000,
            onClick:function(event){
                callback();
                this.close();
            }
        });
    }
}
