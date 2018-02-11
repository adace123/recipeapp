import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import {Link, withRouter} from 'react-router-dom';
import _ from 'lodash';
import '../styles/navbar.css';

@inject('store')
@observer
class Navbar extends Component {
    constructor(props) {
        super(props);
        this.state = {
            show: {
                display: 'block'
            },
            hide: {
                display: 'none'
            },
            showing: false,
            searchQuery: ''
        }
    }
    
    componentWillMount() {
        this.searchRecipe = _.debounce(() => {
            if(this.state.searchQuery.length) 
            this.props.history.push({
                pathname: "/search",
                search: `?query=${this.state.searchQuery}`,
                query: this.state.searchQuery
            });
            else this.props.history.push({
                pathname: "/",
                reset: true
            });
        }, 400);
    }
    
    componentDidMount() {
        window.onresize = () => {
        if(this.props.store.modalStore.windowWidth < 768)
           this.setState({showing: false});
        }
    }
    
    openRecipeFormModal() {
        this.props.store.modalStore.toggleModal("recipe-form", "showing");
    }
    
    openLoginSignupForm() {
        this.props.store.modalStore.toggleModal("login-signup", "showing");
    }
    
    toggleMenu() {
        this.setState({showing: !this.state.showing});
    }
    
    onChange(e) {
        this.setState({searchQuery: e.target.value}, () => {
            this.searchRecipe();
        });
    }
    
     render(){
      const loggedIn = this.props.store.userStore.currentUser !== null;
      return (
      <div id="navbar">
        <div className="nav-container">
              <Link id="main" to="/"><h3>RecipeDB</h3></Link>
          {
              !this.props.store.recipeStore.recipes.length && !this.props.store.recipeStore.singleRecipe && !this.props.store.recipeStore.error ? <h3>Loading...</h3> : ""
          }
          <ul>
            <li><input placeholder="Search for recipe by name" value={this.state.searchQuery} onChange={this.onChange.bind(this)}/></li>
            
            { loggedIn && <li onClick={this.openRecipeFormModal.bind(this)}><a>Add Recipe</a></li> }
            { <li onClick={() => !loggedIn ? this.openLoginSignupForm() : this.props.store.userStore.logout()}><a>{ !loggedIn ? "Sign In" : "Logout" }</a>
            { loggedIn && <small className="username"> - {this.props.store.userStore.getCurrentUser().username}</small>}
            
            </li> }
            <li id="hamburger" onClick={this.toggleMenu.bind(this)}>
                <div className="bar-container">
                    <div className="bar"></div>
                    <div className="bar"></div>
                    <div className="bar"></div>
                </div>
            </li>
          </ul>
          </div>
          <ul id="mobile-menu" style={this.state.showing ? this.state.show : this.state.hide}>
                    { loggedIn && <li onClick={this.openRecipeFormModal.bind(this)}><a>Add Recipe</a></li> }
                    <li onClick={() => !loggedIn ? this.openLoginSignupForm() : this.props.store.userStore.logout()}>{ !loggedIn ? "Sign In" : "Logout" }</li> 
                    { loggedIn && <small className="username"> - {this.props.store.userStore.getCurrentUser().username}</small>}
                    <li><input placeholder="Search for recipe by name" value={this.state.searchQuery} onChange={this.onChange.bind(this)}/></li>
         </ul>
        </div>);
      }
}

export default withRouter(Navbar);

//save for footer
//<li><a>API</a></li>