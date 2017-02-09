var Promise = require('es6-promise').Promise;

function AnimationPromise(component){
	return new Promise(function(resolve) {
		component._doAnimate();
		resolve(component);
	});
}

module.exports = {
	//组件是否可用
	_enabled: false,
	//组件是否可以被resize
	_resizeable: false,
	//组件需要执行的动画
	_animators: false,
	
	//组件是否被锁定,动画执行过程,将被锁定
	_locked: false,
	
	//组件动画结束后的回调
	_animateCallback: null,
	
	componentWillMount: function () {
       
    },
    
    isLocked: function(){
		return this._locked;
	},
    
    componentDidMount: function () {
		if(this._animators && !this._locked){
			if(!this._animateCallback){
				this._doAnimate();
			}else{
				var animationPromise = new AnimationPromise(this);
				animationPromise.then(this._animateCallback);
			}
		}
    },
    
    _doAnimate: function(){
		this._locked = true;
		for(var i=0, len=this._animators.length; i< len; i++){
			this._animators[i].render();
		}
		this._locked = false;
	},
	
    onAnimate: function(callback){
		this._animateCallback = callback;
	},
	
	isEnabled: function(){
		return this._enabled;
	},
	
	isResizeable: function(){
		return this._resizeable;
	}
}
