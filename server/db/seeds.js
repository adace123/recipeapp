import casual from 'casual';
import cheerio from 'cheerio';
import axios from 'axios';
import uuid from 'uuid/v4';
import shortid from 'shortid';
import bcrypt from 'bcrypt';
import Recipe from './models/Recipe';
import User from './models/User';
import Rating from './models/Rating';

const recipes = [];
const users = [];
const ratings = [];

function seedRecipes() {
    axios.get('https://pinchofyum.com/recipes').then(res => {
        return res.data;
    }).then(html => {
        const $ = cheerio.load(html);
        const promises = [];
            $('article img').each((i, elem) => {
                const img = $(elem).attr('src')
                const userid = uuid(), recipeid = shortid.generate(), ratingid = shortid.generate();
                
                const link = $(elem).parent().find('a').attr('href');
                const user = {
                    userid,
                    email: casual.email,
                    username: casual.username,
                    password:  bcrypt.hashSync(casual.password, 10)
                }
                users.push(user);
                
                const recipe = {
                    recipeid,
                    title: '',
                    imageURL: '',
                    ingredients: [],
                    instructions: [],
                    time: '',
                    userid
                };
                
                const rating = {
                    ratingid,
                    rating: Math.floor(Math.random() * 5) + 1,
                    recipeid,
                    userid
                }
                ratings.push(rating);

                if(recipes.length <= 10) {
                   recipe.imageURL = img;
                   
                   promises.push(Promise.resolve(axios.get(link).then(data => data.data).then(page => {
                           const c = cheerio.load(page);
                           recipe.title = c('.tasty-recipes-entry-header h2').text();
                           recipe.time = c('.tasty-recipes-prep-time').text();
                           
                          c('.tasty-recipes-ingredients ul li').each((i, elem) => {
                              const ingredient = $(elem).before().text() + " " + $(elem).find('strong').text();
                              recipe.ingredients.push(ingredient);
                          });
                          c('.tasty-recipes-instructions ol li').each((i, elem) => {
                              const instruction = (i + 1) + ". " + $(elem).before().text(); 
                              recipe.instructions.push(instruction);
                          });
    
                          recipes.push(recipe);
                          return Promise.resolve(recipe);
                    }))); 
                }
            });
            
            Promise.all(promises).then((values) => {
                users.forEach(user => {
                    User.findCreateFind({where: user}); 
                });
                
                recipes.forEach(recipe => {
                    Recipe.findCreateFind({where: recipe});
                });
                
                ratings.forEach(rating => {
                    Rating.findCreateFind({where: rating});
                })
                // create admin user for testing
                User.findCreateFind({
                where: {
                    userid: uuid(),
                    email: process.env.ADMIN_EMAIL,
                    username: process.env.ADMIN_USERNAME,
                    password: bcrypt.hashSync(process.env.ADMIN_PASSWORD, 10)
                }
    }).then(done => console.log("done seeding"))
            }).catch(err => console.log("Could not seed recipes. " + err));
            
    });
    
}
export default seedRecipes;
