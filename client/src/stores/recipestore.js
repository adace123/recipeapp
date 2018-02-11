import { observable, action, toJS } from 'mobx';
import axios from 'axios';
import _ from 'lodash';

class RecipeStore {
    @observable recipes = [];
    @observable ratings = [];
    @observable singleRecipe = null;
    @observable error = false;
    
    @action
    async fetchAll() {
        this.error = false;
      try {
         const { data } = await axios.get('/api/recipes/all');
         this.recipes = data.recipes;
         this.ratings = data.ratings;
      } catch(e) {
          this.error = true;
      }
    }
    
    @action
    async fetchOne(id) {
        this.error = false;
        try {
            const { data } = await axios.get('/api/recipes/' + id);
            this.singleRecipe = data;
            if(!this.singleRecipe) {
                this.error = true;
            }
        } catch(e) {
            this.error = true;
        }
        
    }
    
    @action
    async addRecipe(recipe) {
        this.error = false;
        try {
            await axios.post('/api/recipes/new', {recipe, token: window.localStorage.getItem("token")});
            this.recipes.push(recipe);
        } catch(e) {
            this.error = true;
            console.log(e);
        }
    }
    
    @action
    getAverageRatingAndRatingCount(recipeid) {
        const matchingRatings = this.ratings.filter(rating => rating.recipeid === recipeid);
        if(matchingRatings) {
            const average = _.sumBy(matchingRatings, rating => rating.rating) / matchingRatings.length;
            return {average, count: matchingRatings.length};
        } else return {average: 0, count: 0};
        
    }
    
    @action 
    recipeHasRatings(recipeid) {
        const hasRatings = this.ratings.find(rating => rating.recipeid === recipeid);
        return hasRatings && hasRatings.length;
    }
    
    @action
    getUserRatingForRecipe(recipe, user) {
        const userRating = this.ratings.filter(rating => rating.recipeid === recipe && rating.userid === user)[0];
        return userRating && userRating.rating ? userRating.rating : 0;
    }
    
    @action
    async updateOrCreateRating(rating, recipeid, userid) {
        if(!this.ratings.length) {
            this.ratings.push({recipeid, userid, rating});
            await axios.post('/api/recipes/ratings', {rating, recipeid, userid, token: window.localStorage.getItem("token")});
            return this.getAverageRatingAndRatingCount(recipeid);
        }
        const userHasAlreadyRatedRecipe = this.ratings.find(rating => rating.recipeid === recipeid && rating.userid === userid);
        const recipeHasRating = this.ratings.find(rating => rating.recipeid === recipeid && rating.userid !== userid);
        if(!userHasAlreadyRatedRecipe) {
            if(recipeHasRating) {
                recipeHasRating.rating = rating;
            } 
            this.ratings = [...this.ratings, recipeHasRating ? recipeHasRating : {recipeid, userid, rating}];
            await axios.post('/api/recipes/ratings', {rating, recipeid, userid, token: window.localStorage.getItem("token")});
        } else {
            userHasAlreadyRatedRecipe.rating = rating;
            this.ratings.splice(this.ratings.indexOf(userHasAlreadyRatedRecipe, 1));
            this.ratings = [...this.ratings, userHasAlreadyRatedRecipe];
            await axios.put('/api/recipes/ratings', {rating, recipeid, userid, token: window.localStorage.getItem("token")});
        }
        return this.getAverageRatingAndRatingCount(recipeid);
    }
    
    @action
    async updateRecipe(id, field, value, token) {
        const { data } = await axios.put(`/api/recipes/${id}`, {recipeid: id, field, value: toJS(value), token});
        this.recipes = this.recipes.map(recipe => {
            if(recipe.recipeid === data.recipeid) {
                recipe = data;
            }
            return recipe;
        });
    }
    
    @action
    async deleteRecipe(recipe) {
        await axios.delete(`/api/recipes/${recipe}`, { data: { token: window.localStorage.getItem("token") } });
        await this.fetchAll();
    }
}

export default RecipeStore;