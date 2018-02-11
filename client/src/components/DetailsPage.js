import React, {Component} from 'react';
import {Link} from 'react-router-dom';
import {observer, inject} from 'mobx-react';
import '../styles/details.css';
import Editor from '../components/utils/Editor';
import Button from '../components/utils/Button';
import Modal from 'react-modal';
import axios from 'axios';
import NotFound from './NotFound';

@inject('store')
@observer
export default class DetailsPage extends Component {
    
    constructor() {
        super();
        this.state = {
          details: null,
          user: {},
          editableFields: null,
          editMode: false,
          addNewIngredient: false,
          addNewInstruction: false,
          newFieldToAdd: '',
          authorizedToEdit: false
        };
    }
    
    async componentWillMount() {
        let userid;
        if(this.props.state) {
            await this.props.store.recipeStore.fetchOne(this.props.state.recipeid);
            if(this.props.store.recipeStore.error) {
                return false;
            } else {
                this.setState({details: this.props.store.recipeStore.singleRecipe});
                userid = this.props.store.recipeStore.singleRecipe.userid;
            }
        }
         
        else {
            userid = this.props.location.state.userid;
            await this.setState({details: this.props.location.state});
        }
        
        const editableFields = {...this.state.details};
        for(let [key, value] of Object.entries(editableFields)) {
            editableFields[key] = typeof value === "string" ? false : new Array(value.length).fill(false);
        }
        await this.setState({editableFields});
        
        //should be handled by user store
        axios.get("/auth/users/" + userid)
        .then(user => {
            this.setState({user : user.data, authorizedToEdit: JSON.parse(window.localStorage.getItem("user")).userid === userid});
        })
        .catch(err => console.log(err));
    }
    
    componentDidMount() {
        if(window.localStorage.getItem("user")) {
            console.log(this.state)
            // this.setState({authorizedToEdit: JSON.parse(window.localStorage.getItem("user").userid === this.state.details.userid)});
        }
    }
    
    setEditable(property, mode, index = -1) {
        const fields = {...this.state.editableFields};
        if(index > -1) {
          fields[property][index] = mode;  
        } else fields[property] = mode;
        this.setState({editableFields: fields});
    }
    
    updateRecipe(value, property, index = -1) {
        const details = {...this.state.details};
        if(index > -1) {
            details[property][index] = value;
        } 
        else details[property] = value;
        console.log(details);
        this.setState({details}, () => {
            this.props.store.recipeStore.updateRecipe(this.state.details.recipeid, property, this.state.details[property], this.props.store.userStore.token);
        });
    }
    
    deleteField(property, index) {
        const details = {...this.state.details};
        details[property].splice(index, 1);
        this.setState({details}, () => {
            this.props.store.recipeStore.updateRecipe(this.state.details.recipeid, property, this.state.details[property]);
        });
    }
    
    addField() {
        const details = {...this.state.details};
        const property = this.state.addNewIngredient ? "ingredients" : "instructions";
        details[property].push(this.state.newFieldToAdd);
        this.setState({details, newFieldToAdd: '', addNewIngredient: false, addNewInstruction: false}, () => {
            this.props.store.recipeStore.updateRecipe(this.state.details.recipeid, property, this.state.details[property]);
        });
    }
    
    async deleteRecipe() {
        if(window.confirm("Are you sure?")) {
           await this.props.store.recipeStore.deleteRecipe(this.state.details.recipeid);
           window.location.href = "/";
          
        }
    }
    
    render() {
      if(this.state.details && this.state.editableFields)
        return (
          <div className="details">
                { this.state.authorizedToEdit && <Modal className="add-field-form" isOpen={this.state.addNewIngredient || this.state.addNewInstruction} >
                        <h3>Add an {this.state.addNewIngredient ? "ingredient" : "instruction"}</h3>
                        <input autoFocus value={this.state.newFieldToAdd} onChange={e => this.setState({newFieldToAdd: e.target.value})} placeholder={`Enter a new ${this.state.addNewIngredient ? "ingredient" : "instruction"}`}/>
                        <div>
                            <Button text="Submit" borderColor="#263238" hoverColor="#263238" onClick={() => this.addField()}/>
                            <Button text="Cancel" borderColor="red" hoverColor="red" onClick={() => this.setState({addNewIngredient: false, addNewInstruction: false})}/>
                        </div>
                </Modal> }
                <img src={this.state.details.imageURL} alt={this.state.details.title}/>
                <h2 className="recipe-title">{!this.state.editableFields["title"] && this.state.details.title}
               { this.state.authorizedToEdit && <Editor
                    onCancelEdit={() => this.setEditable("title", false)}
                    onEdit={() => this.setEditable("title", true)}
                    field={this.state.details.title}
                    fieldName="title"
                    multiple={false}
                    onSave={this.updateRecipe.bind(this)}
                /> }
                </h2><hr />
                <h3 className="recipe-time"><i className="fa fa-clock-o" aria-hidden="true">
                </i> Time: {!this.state.editableFields["time"] && this.state.details.time}
                { this.state.authorizedToEdit && <Editor 
                    onCancelEdit={() => this.setEditable("time", false)}
                    onEdit={() => this.setEditable("time", true)}
                    field={this.state.details.time}
                    fieldName="time"
                    multiple={false}
                    onSave={this.updateRecipe.bind(this)}
                /> }
                </h3>
                {//make recipe user a link to profile
                }
                <small>Posted by: <Link className="recipe-user" to="/">{this.state.user.username}</Link></small>
                <h3>Ingredients { this.state.authorizedToEdit && <i className="fa fa-plus" onClick={() => this.setState({addNewIngredient: true, addNewInstruction: false})}></i> }</h3>
                <ul className="ingredients">
                    {  
                        this.state.details.ingredients.map((ingredient, i) => 
                             <li key={i}>
                                {!this.state.editableFields["ingredients"][i] && <span>{ingredient}</span> }
                                
                                { this.state.authorizedToEdit && <Editor onCancelEdit={() => this.setEditable("ingredients", false, i)}
                                    onEdit={() => this.setEditable("ingredients", true, i)} 
                                    field={ingredient} index={i} 
                                    fieldName="ingredients"
                                    onDelete={() => this.deleteField("ingredients", i)}
                                    multiple={true}
                                    onSave={this.updateRecipe.bind(this)}
                                /> }
                             </li> 
                        )
                       
                    }
                </ul>
                <h3>Instructions { this.state.authorizedToEdit && <i className="fa fa-plus" onClick={() => this.setState({addNewInstruction: true, addNewIngredient: false})}></i> }</h3>
                <ol className="instructions">
                    {
                        this.state.details.instructions.map((instruction, i) => 
                        <li key={i}>
                                {!this.state.editableFields["instructions"][i] && <span>{i + 1}. {instruction}</span> } 
                               { this.state.authorizedToEdit && <Editor onCancelEdit={() => this.setEditable("instructions", false, i)} 
                                    onEdit={() => this.setEditable("instructions", true, i)} 
                                    field={instruction} index={i} 
                                    fieldName="instructions"
                                    onDelete={() => this.deleteField("instructions", i)}
                                    multiple={true}
                                    onSave={this.updateRecipe.bind(this)}
                                /> }
                             </li> 
                        
                        )
                    }
                </ol>
                <div className="details-buttons">
                    <Link className="btn" id="backButton" to="/"><h3>Back</h3></Link>
                    { this.state.authorizedToEdit && <a className="btn" id="deleteButton" onClick={() => this.deleteRecipe()}><h3>Delete</h3></a> }
                    
                </div>
          </div>
        );
        else if(this.props.store.recipeStore.error)
        return (
            <NotFound />
        )
        
        else return (<div></div>)
    }
}