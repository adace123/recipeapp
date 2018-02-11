import { observable, action, computed } from 'mobx';

class AlertStore {
    @observable successMessage = '';
    @observable errors = [];
    @observable closeTimeout = null;
    @observable loading = false;
    
    @action
    closeAlert(speed = "slow") {
        clearTimeout(this.closeTimeout);
        this.closeTimeout = setTimeout(() => {
            this.successMessage = '';
            this.errors = [];
        }, speed === "slow" ? 5000 : 0);
    }
    
    @action
    setSuccessText(message) {
        this.loading = false;
        this.successMessage = message;
        this.closeAlert();
    }
    
    @action
    setErrors(errors) {
        this.loading = false;
        this.errors = errors;
        this.closeAlert();
    }
    
    @action
    setLoading(state) {
        this.loading = state;
    }
    
    @computed get noErrors() {
        return this.errors.length === 0;
    }
    
    @computed get showing() {
        return this.successMessage.length || this.errors.length || this.loading;
    }
    
}

export default AlertStore;