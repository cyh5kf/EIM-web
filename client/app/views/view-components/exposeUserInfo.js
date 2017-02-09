import LoginStore, {EVENTS} from '../../core/stores/LoginStore';

export default BaseComponent => {
    return class ExportUserInfo extends BaseComponent {
        static displayName = BaseComponent.displayName || BaseComponent.name;

        _updateUserInfo = () => {
            // 登录信息变更时, 如果是退出, 则会导致在调用函数前组件被unmount, 因而做特殊检查
            if (this._isMounted) {
                this.setState({
                    userInfo: LoginStore.getImmutableUserInfo()
                });
            }
        }

        componentWillMount() {
            if (super.componentWillMount) {
                super.componentWillMount(...arguments);
            }
            this._isMounted = true;
            this._updateUserInfo();
            LoginStore.addEventListener(EVENTS.CHANGE, this._updateUserInfo);
        }

        componentWillUnmount() {
            if (super.componentWillUnmount) {
                super.componentWillUnmount(...arguments);
            }
            this._isMounted = false;
            LoginStore.removeEventListener(EVENTS.CHANGE, this._updateUserInfo);
        }

    }
}
