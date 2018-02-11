import React, {Component} from 'react';
import Modal from 'react-modal';
import ImageUploader from './ImageUploader';
import Button from './utils/Button';
import {observer, inject} from 'mobx-react';
import axios from 'axios';
import uuid from 'uuid/v4';
import '../styles/newrecipeform.css';


//const TEST_IMAGE_URL = "https://images.pexels.com/photos/235294/pexels-photo-235294.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb";

@inject('store')
@observer
export default class NewRecipeForm extends Component {
    constructor() {
      super();

      this.state = {
        formFields: {
          title: '',
          ingredients: [],
          instructions: [],
          time: '',
          imageURL: 'https://images.pexels.com/photos/235294/pexels-photo-235294.jpeg?w=1260&h=750&auto=compress&cs=tinysrgb',
          userid: '',
          recipeid: uuid()
        },      
        success: false,
        imageDropped: false,
        image: null,
        firebaseUpload: null
      };
    }
    
    addError(error) {
      this.alertStore.setErrors([...this.alertStore.errors, error]);
    }
    
    componentWillMount() {
      this.modalStore = this.props.store.modalStore;
      this.recipeStore = this.props.store.recipeStore;
      this.alertStore = this.props.store.alertStore;
      Modal.setAppElement('body');
      if(this.props.store.userStore.getCurrentUser()) {
        const formFields = {...this.state.formFields};
        formFields.userid = this.props.store.userStore.getCurrentUser().userid;
        this.setState({formFields});
      }
    }
  
    closeModal() {
      this.modalStore.toggleModal("recipe-form", "hidden");
    }
    
    clearErrors() {
      this.alertStore.closeAlert();
    }
    
    setFields(property, action, index = 0, event = null) {
      this.clearErrors();
      let formFields = {...this.state.formFields};
      switch(action) {
        case "add":
          formFields[property].push('');
          break;
        case "update":
          formFields[property][index] = event.target.value;
          break;
        case "delete":
          formFields[property].splice(index, 1);
          break;
        default:
          formFields[property] = [];
          break;
      }
      this.setState({formFields});
    }
     
    async validateForm() {
       const noneEmpty = Object.entries(this.state.formFields).filter(([key,value]) => {
         if(!value.length ) {
           if(key === "imageURL") {
             return null;
           }
            this.addError(key[0].toUpperCase() + key.substr(1) + ' field can\'t be empty');
         }
         return value.length === 0;
       }).length === 0;
       
       
       if((!this.state.imageDropped && !this.state.formFields.imageURL.length) || (this.state.imageDropped && !this.state.image)) {
         this.addError("No image provided");
       }
       
       if(!noneEmpty) {
         return false;
       }
       
       if(this.state.formFields.ingredients.some(i => i.length === 0 || i === "")) {
         this.addError("One or more ingredients is blank");
       }
       
       if(this.state.formFields.instructions.some(i => i === "" || i.length === 0 )) {
         this.addError("One or more instructions is blank");
       }

        if(!this.state.imageDropped && this.state.formFields.imageURL.length) {
        try {
           const res = await axios.head("https://cors-anywhere.herokuapp.com/" + this.state.formFields.imageURL);
           if(res.status === 404 || !new RegExp("^image").test(res.headers['content-type'])) {
             this.addError("URL is invalid or not an image"); 
          } 
        } 
        catch(e) {
           this.addError("URL is invalid or not an image"); 
        }
    }
    else if(this.state.image && this.state.imageDropped) {
        if(this.state.image.size > (1024 * 1024 * 5)) {
          this.addError("Image size must be less than 5MB");
        }
    }
    return this.alertStore.noErrors;
  }
    
    setField(field, event) {
      this.clearErrors();
      const formFields = {...this.state.formFields};
      formFields[field] = event.target.value;
       this.setState({formFields});
    }
    
    getimageDropped(image) {
      this.setState({image});
    }
    
    changeImageMethod() {
      this.clearErrors();
      const change = !this.state.imageDropped;
      this.setState({imageDropped: change});
    }
    
    async getImageDownloadURL(url) {
      const formFields = {...this.state.formFields};
      formFields.imageURL = url;
      await this.setState({formFields}, () => {
        this.uploadRecipe();
      });
    }
    
    async uploadRecipe() {
      const formFields = {...this.state.formFields};
      console.log(formFields);
      await this.recipeStore.addRecipe(formFields).then(res => {
        formFields.ingredients = [];
        formFields.instructions = [];
        this.setState({formFields});
      });
    }
 
    async submitRecipe() {
      this.clearErrors();
      this.alertStore.setLoading(true);
      const valid = await this.validateForm();
      
      if(valid) {
        this.modalStore.validForm();
        if(this.state.image) {
         await this.setState({firebaseUpload: "recipes"});
        }
        else await this.uploadRecipe();
        this.alertStore.setSuccessText("Recipe has been successfully added!");
        this.closeModal();
      }
      
      this.clearErrors();
      }
    
    render() {
      const local = {"display": this.state.imageDropped ? "block": "none"};
      const remote = {"display": this.state.imageDropped ? "none": "block"};
      return  (
        
          <div className="modal-container">
            <Modal isOpen={this.modalStore.recipeFormShowing} 
            className="modal">
              <div className="modal-header">
              <h3>Add a recipe</h3>
              <i className="fa fa-times fa-2x" onClick={this.closeModal.bind(this)}></i>
              </div>
              <form className="recipe-form">
                <div className="form-group">
                  <h3>Name</h3>
                  <input id="name" placeholder="Enter recipe name" value={this.state.title} onChange={this.setField.bind(this,'title')} />
                </div>
                <div className="form-group">
                  <h3>Ingredients</h3>
                  <i className="fa fa-plus fa-2x" onClick={this.setFields.bind(this,"ingredients", "add")}></i> 
                  <i className="fa fa-2x fa-trash" onClick={this.setFields.bind(this,"ingredients","clear")}></i>
                  <div className="ingredient-inputs">
                  {
                    this.state.formFields.ingredients.map((ingredient, index) => 
                   (<div className="form-group" key={index}>
                      <input value={ingredient} placeholder="Enter ingredient" key={index} onChange={this.setFields.bind(this,"ingredients","update",index)}/>
                      <i className="fa fa-minus-square" onClick={this.setFields.bind(this,"ingredients","delete",index)}></i>
                    </div>)
                    )
                  }
                  </div>
                </div>
                <div className="form-group">
                  <h3>Instructions</h3>
                  <i className="fa fa-plus fa-2x" onClick={this.setFields.bind(this,"instructions", "add")}></i> 
                  <i className="fa fa-2x fa-trash" onClick={this.setFields.bind(this,"instructions","clear")}></i>
                  <div className="ingredient-inputs">
                  {
                    this.state.formFields.instructions.map((instruction, index) => 
                   (<div className="form-group" key={index}>
                      <input value={instruction} placeholder="Enter instruction" key={index} onChange={this.setFields.bind(this,"instructions","update",index)}/>
                      <i className="fa fa-minus-square" onClick={this.setFields.bind(this,"instructions","delete",index)}></i>
                    </div>)
                    )
                  }
                  </div>
                </div>
                <div className="form-group">
                  <h3>Time</h3>
                  <input value={this.state.time} placeholder="Estimated cooking time" onChange={this.setField.bind(this,'time')}/>
                </div>
                <div className="form-group">
                  <h3>Image</h3>
                  <small className="image-method-selector" onClick={this.changeImageMethod.bind(this)}>(Click to upload image {!this.state.imageDropped ? "from computer": "from URL"})</small>
                  <input style={remote} value={this.state.imageURL} placeholder="Enter image URL" onChange={this.setField.bind(this,'imageURL')}/>
                  <ImageUploader 
                  display={local} 
                  onImageUploaded={this.getimageDropped.bind(this)} 
                  firebaseUpload={this.state.firebaseUpload}
                  successfulUpload={this.getImageDownloadURL.bind(this)}
                  />
                </div>
                <div id="buttons" className="form-group">
                  <Button text="Submit" borderColor="white" hoverColor="white" onClick={this.submitRecipe.bind(this)}/>
                  <Button text="Cancel" borderColor="red" hoverColor="red" onClick={this.closeModal.bind(this)}/>
                </div>
              </form>
            </Modal>
          </div>
        );
      }
}