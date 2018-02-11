import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {withRouter} from 'react-router-dom';
import Modal from 'react-modal';
import '../styles/login-signup.css';

@inject('store')
@observer
class LoginSignup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formFields: {
                email: '',
                password: '',
                username: ''
            },
            hidePassword: true,
            typing: false,
            errors: [],
            mode: 'login',
            submitted: false
        }
        
        this.formFields = this.state.formFields;
    }
    
    validations() {
        return {
            username: this.state.formFields.username.length >= 6,
            email: /^.+@.+\..{2,}$/.test(this.state.formFields.email),
            password: (this.state.formFields.password.length >= 8 && /(?=.*[0-9])/.test(this.state.formFields.password))
        }
    }
    
    setField(field, value) {
        const formFields = {...this.state.formFields};
        formFields[field] = value;
        this.setState({formFields, typing: value.length ? true : false});
    }
    
    setMode(mode) {
        const formFields = {...this.state.formFields};
        for(let field in formFields) {
            formFields[field] = '';
        }
        this.setState({mode, formFields});
    }
    
    async handleSubmit() {
        const validations = this.validations();
        const errors = [];
        for(let [key, value] of Object.entries(validations)) {
            if(key === "username" && this.state.mode !== "register") {
                continue;
            }
            else if(!value) {
                errors.push(`Invalid ${key}`);
            }
        }
        
        if(errors.length) {
           return this.props.store.alertStore.setErrors(errors);
        }
        
        await this.props.store.userStore.authenticateLocal(this.state.formFields.email, this.state.formFields.password, this.state.mode === "register" ? this.state.formFields.username : null);
        const user = this.props.store.userStore.currentUser;
        if(user) {
                this.props.store.alertStore.setSuccessText(`Welcome, ${user.username}! You've successfully ${this.state.mode === "register" ? "registered" : "logged in"}!`);
                this.props.store.modalStore.toggleModal("login-signup", "hidden");
        } 
        else this.props.store.alertStore.setErrors([this.state.mode === "login" ? "Email or password is incorrect. Please try again." : "Error. Username or email is unavailable."]);
    }
    
    render() {
        const validations = this.validations();
        
        return (
                <Modal className="login-signup" isOpen={this.props.store.modalStore.loginSignupFormShowing}>
                    <header className="tabs">
                        <div onClick={() => this.setMode("login")} className={`auth-mode-change ${this.state.mode === 'login' && 'active'}`}>LOGIN</div>
                        <div onClick={() => this.setMode("register")} className={`auth-mode-change ${this.state.mode === 'register' && 'active'}`}>SIGN UP</div>
                    </header>
                    <section className="spacer">
                        <span>Enter your {this.state.mode === "register" && "username, "} email and password <strong>to {this.state.mode}</strong>.</span>
                    </section>
                    <form>
                    {
                        this.state.mode === "register" && 
                        <section className="spacer auth-form-field">
                            <div className="validator-label">
                                <p>USERNAME*</p>
                                {this.state.formFields.username.length > 0 && <p className="validator" style={{color: validations.username ? 'green' : 'red'}}>
                                {validations.username ? <i className="fa fa-check" styles="color: green" aria-hidden="true"></i> : "Min 6 characters"}</p>}
                            </div>
                            <input value={this.state.formFields.username} onChange={e => this.setField("username", e.target.value)} placeholder="Username" className="auth-form-input"/>
                        </section>
                    }
                        <section className="spacer auth-form-field">
                            <div className="validator-label">
                                <p>EMAIL*</p>
                                {this.state.formFields.email.length > 0 && <p className="validator" style={{color: validations.email ? 'green' : 'red'}}>
                                {validations.email ? <i className="fa fa-check" styles="color: green" aria-hidden="true"></i> : "Invalid email"}</p>}
                            </div>
                            
                            <input value={this.state.formFields.email} onChange={e => this.setField("email", e.target.value)} placeholder="Email" className="auth-form-input"/>
                        </section>
                        <section id="password" className="spacer">
                            <div className="password-field">
                                <div className="validator-label">
                                <p>PASSWORD*</p>
                                {this.state.formFields.password.length > 0 && <p className="validator" style={{color: validations.password ? 'green' : 'red'}}>
                                {validations.password ? <i className="fa fa-check" styles="color: green" aria-hidden="true"></i> : "Min 8 letters and 1 number"}</p>}
                            </div>
                                <input value={this.state.formFields.password} onChange={e => this.setField("password", e.target.value)} type={this.state.hidePassword ? 'password': 'text'} placeholder="Password" className="auth-form-input"/>
                            </div>
                            <div className="hide-password" onClick={() => this.setState({hidePassword: !this.state.hidePassword})}>
                                {this.state.hidePassword ? "SHOW" : "HIDE"}
                            </div>
                        </section>
                        <section className="spacer" id="auth-buttons">
                            <div className="auth-button" id="auth-cancel" onClick={() => this.props.store.modalStore.toggleModal("login-signup", "hidden")}>Cancel</div>
                            <div className="auth-button" id="auth-login" onClick={() => this.handleSubmit()}>{this.state.mode === "login" ? "Log In" : "Register"}</div>
                        </section>
                        {
                        // to be implemented: oauth
                        // <section className="spacer" id="facebook">
                        //         <div className="social-icon">
                        //             <i className="fa fa-facebook" aria-hidden="true"></i>
                        //         </div>
                        //         <span onClick={() => { this.props.history.push("/auth/facebook"); this.props.store.userStore.oauth("facebook");}}>Sign in with <strong className="social-text">Facebook</strong></span>
                        // </section>
                        }
                        {
                        // <section className="spacer" id="google">
                        //         <div className="social-icon">
                        //             <i className="fa fa-google" aria-hidden="true"></i>
                        //         </div>
                        //         <span onClick={() => this.props.store.userStore.oauth("google")}>Sign in with <strong className="social-text">Google</strong></span>
                        // </section>
                        }
                    </form>
                </Modal>
        );
    }
}

export default withRouter(LoginSignup);