import toast from '../components/popups/toast';

window.addEventListener('unhandledrejection', event => {
    toast(event.reason && event.reason.message || 'error...');
});
