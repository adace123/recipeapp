import Dropzone from 'react-dropzone';
import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import firebase from 'firebase';
import '../styles/newrecipeform.css';

@inject('store')
@observer
export default class ImageUploader extends Component {
    constructor() {
        super();
        this.state = {
           imageDropped: false,
           image: null,
        }
        
    }
    
    async componentWillReceiveProps(nextProps) {
        if(nextProps.firebaseUpload) {
           await this.uploadToFirebase(nextProps.firebaseUpload);
        }
    }
    
    async uploadToFirebase(type) {
        
        //change user to user id
        const storage = firebase.storage().ref().child(`images/user/${type}/${this.state.image.preview}`);
        await storage.put(this.state.image).then(async (snapshot) => {
           await this.props.successfulUpload(snapshot.downloadURL);
        });
    }
    
    handleDrop(file) {
        this.setState({image: file[0]}, () => {
            this.setState({imageDropped: true}, () => {
                this.props.onImageUploaded(this.state.image);
            });
        });
    }
    
    render() {
        if(!this.props.display) {
            this.setState({image: null});
        }
        return (
            <Dropzone
                style={this.props.display}
                className="dropzone"
                multiple={false}
                accept="image/*"
                onDrop={this.handleDrop.bind(this)}
                >
                {!this.state.imageDropped ? <p>Drop an image here or click to select a file to upload.</p> : 
                <img className="preview-image" src={this.state.image.preview} alt={this.state.image.name}/>}
            </Dropzone>   
        );
    }
}

