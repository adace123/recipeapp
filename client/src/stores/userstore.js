import {observable, action} from 'mobx';
import axios from 'axios';


class UserStore {
    @observable currentUser = window.localStorage.getItem("user");
    @observable token = window.localStorage.getItem("token")
    @observable isAdmin = false;
    
    @action
    async authenticateLocal(email, password, username = null) {
        if(!this.currentUser) {
            try {
                const { data } = await axios.post(`/auth/${username ? "register" : "login"}`, {email, username, password, token: this.token});
                window.localStorage.setItem("token", data.token);
                window.localStorage.setItem("user", JSON.stringify(data.user));
                this.currentUser = data.user;
                return `${username ? "Registered" : "Signed in"} successfully!`;
            } catch(e) {
                return "Auth failed";
            }
        }
        
        return "Already logged in";
    }
    
    @action
    async oauth(provider) {
        switch(provider) {
            case "facebook":
                await axios.get("/auth/facebook/callback");
                break;
            case "google":
                await axios.get('/auth/google');
                break;
            default:
                return `${provider} oauth not supported for this application.`;
        }
    }
    
    @action
    async logout() {
        await axios.post('/auth/logout', {token: this.token});
        window.localStorage.removeItem("token");
        window.localStorage.removeItem("user");
        this.currentUser = null;
        this.isAdmin = false;
    }
    
    @action
    canEditDelete(userid) {
        return this.isLoggedin() && userid === this.getCurrentUser().userid; 
    }
    
    @action 
    isLoggedin() {
        return Boolean(this.currentUser);
    }
    
    @action
    getCurrentUser() {
        if(this.currentUser)
        return JSON.parse(this.currentUser);
    }
}

export default UserStore;