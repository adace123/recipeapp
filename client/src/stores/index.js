import AlertStore from './alertstore';
import ModalStore from './modalstore';
import RecipeStore from './recipestore';
import UserStore from './userstore';

class RootStore {
    constructor() {
        this.modalStore = new ModalStore();
        this.recipeStore = new RecipeStore();
        this.userStore = new UserStore();
        this.alertStore = new AlertStore();
    }
}

export default new RootStore();