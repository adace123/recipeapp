import {observable, action} from 'mobx';

class ModalStore {
    
    @observable recipeFormShowing = false;
    @observable loginSignupFormShowing = false;
    @observable formSuccess = false;
    @observable windowWidth = window.innerWidth;

    constructor() {
        window.addEventListener('resize', () => {
            this.windowWidth = window.innerWidth; 
        });
    }
    
    @action
    closeModal(modal) {
        //this.modalIsOpen = false;
        switch(modal) {
            case "recipe-form":
                this.recipeFormShowing = false;
                break;
            default:
                this.loginSignupFormShowing = false;
                break;
        }
        // if(this.formSuccess) {
        //     return;
        // } 
        
    }
    
    @action
    toggleModal(modal, state) {
        switch(modal) {
            case "recipe-form":
                this.recipeFormShowing = state === "showing" ? true : false;
                break;
            default:
                this.loginSignupFormShowing = state === "showing" ? true : false;
                break;
        }
    }
    
    @action
    validForm() {   
        this.formSuccess = true;
    }
    
    @action
    openModal(modal) {
        // this.modalIsOpen = true;
        switch(modal) {
            case "recipe-form":
                this.recipeFormShowing = true;
                break;
            default:
                this.loginSignupFormShowing = true;
                break;
        }
    }
}



export default ModalStore;