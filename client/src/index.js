import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import RecipeGrid from './components/RecipeGrid';
import DetailsPage from './components/DetailsPage';
import { Provider } from 'mobx-react';
import NewRecipeForm from './components/NewRecipeForm';
import Navbar from './components/Navbar';
import Alert from './components/utils/Alert';
import LoginSignup from './components/LoginSignup';
import RootStore from './stores/index';
import firebase from 'firebase';
import config from './config/firebase-config.json';
import registerServiceWorker from './registerServiceWorker';

firebase.initializeApp(config);

const Root = (
  <Provider store={RootStore}>
    <BrowserRouter>
    <div>
      <Alert /> 
      <Navbar/>
      <NewRecipeForm /> 
      <LoginSignup />
      <Switch>
        <Route exact path="/" component={RecipeGrid}/>
        <Route path="/search" component={RecipeGrid}/>
        <Route exact path="/details?recipe=:id" component={DetailsPage}/>
        <Route render={() =>  
            /\/details\?recipe=.+$/.test(window.location.href) ?
            <DetailsPage state={{recipeid: /\/details\?recipe=.+-(.+)$/.exec(window.location.href)[1]}}/> : 
            <RecipeGrid />
        } /> 
        
      </Switch>
      </div>
    </BrowserRouter>
  </Provider>
);

ReactDOM.render(Root, document.getElementById('root'));
registerServiceWorker();
