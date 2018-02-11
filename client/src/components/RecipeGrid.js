import React, {Component} from 'react';
import '../styles/Recipe.css';
import '../styles/index.css';
import {observer, inject} from 'mobx-react';
import _ from 'lodash';
import Recipe from '../components/Recipe';
import Spinner from '../components/utils/Spinner';

import {withRouter} from 'react-router-dom';

@inject('store')
@observer
class RecipeApp extends Component {
    constructor(props) {
        super(props);
        this.recipeStore = this.props.store.recipeStore;
        this.modalStore = this.props.store.modalStore;
        let pageEnd;
        const windowWidth = this.modalStore.windowWidth;
        if(_.inRange(windowWidth, 768)) {
            pageEnd = 3;
        } else if(_.inRange(windowWidth, 769, 1100)) {
            pageEnd = 4;
        } else if(_.inRange(windowWidth, 1101, 1366)) {
            pageEnd = 6;
        } else pageEnd = 8;
        
        this.state = {
            recipes: [],
            pageStart: 0,
            pageEnd,
            pageIndex: pageEnd,
            searchMode: false,
            recipesLoading: false
        };
    }
    
    async componentWillMount() {
        if(!this.recipeStore.recipes.length) {
            await this.recipeStore.fetchAll();
        }
        await this.setState({recipes: this.recipeStore.recipes.slice(this.state.pageStart, this.state.pageEnd)});
    }
    
    componentDidMount() {
        if(this.props.location.state) {
            this.filterRecipes(this.props.location.state);
        }
        else this.props.history.push("/");
        window.addEventListener('scroll', () => {
            document.querySelector('.recipe-list') && !this.state.recipesLoading && this.paginate();
        });
    }
    
    componentWillReceiveProps(props) {
        // if(props.store.recipeStore.recipes) {
        //     this.setState({recipes: props.store.recipeStore.recipes});
        //     console.log("recipes " + props.store.recipeStore.recipes);
        // }
        if(props.location.search) {
            this.setState({searchMode: true});
            this.filterRecipes(props.location.query);
        }
        
        if(props.location.state) {
            this.setState({searchMode: true});
            this.filterRecipes(props.location.state);
            console.log("location.state " + props.location.state);
        }
        if(props.location.reset) {
            console.log('reset');
            this.setState({recipes: this.recipeStore.recipes, searchMode: false});
        }
        // else this.setState({recipes: this.recipeStore.recipes});
    }
    
    paginate() {
        const bottomOfPage = window.innerHeight + window.pageYOffset > document.querySelector('.recipe-list').scrollHeight;
        if(bottomOfPage && !this.state.searchMode && this.state.pageEnd < this.recipeStore.recipes.length) {
            this.setState({recipesLoading: true});
            setTimeout(() => {
               this.setState({pageStart: this.state.pageStart + this.state.pageIndex, pageEnd: this.state.pageEnd + this.state.pageIndex});
               const recipes = [...this.state.recipes, ...this.recipeStore.recipes.slice(this.state.pageStart, this.state.pageEnd)];
               this.setState({recipes, recipesLoading: false}); 
            }, 500);
        }
    }
    
    filterRecipes(search) {
        const searchResults = [...this.recipeStore.recipes.filter(r => r.title.trim().toLowerCase().includes(search.trim().toLowerCase()))];
        this.setState({recipes: searchResults});
    }

    render() {
        return (
           <div className="recipe-list" onScroll={this.paginate.bind(this)}>
                {
                !this.recipeStore.error ? this.state.recipes.length ? this.state.recipes.map((recipe, index) => (
                        <Recipe key={index} {...recipe}/>
                )) : this.props.location.state ? <h1>No results found.</h1> : "" : <h1>Looks like something went wrong...</h1>
                }
                { this.state.recipesLoading && <Spinner borderColor="#263238" borderColorTop="white"/> }
            </div> 
        );
    }
}

export default withRouter(RecipeApp);