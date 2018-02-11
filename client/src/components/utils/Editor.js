import React, {Component} from 'react';
import '../../styles/details.css';

export default class Editor extends Component {
    constructor(props) {
        super(props);
        this.state = {
            field: this.props.field, 
            fieldName: this.props.fieldName, 
            editText: false
        };
    }
    
    onChange(value, e) {
        this.setState({field: value});
        this.props.onEdit(this.props.fieldName, value, this.props.index);
    }
    
    displayEditor() {
        this.setState({editText: true});
        this.props.onEdit();
        // if(this.props.index)
        // this.props.onEdit(this.props.fieldName, true, this.props.index);
        // else this.props.onEdit(this.props.fieldName, true);
    }
    
    cancelEdit() {
        this.setState({editText: false});
        this.props.onCancelEdit();
    }
    
    saveEdits() {
        this.props.onSave(this.state.field, this.props.fieldName, this.props.index);
        this.cancelEdit();
    }
    
    deleteField() {
        this.props.onDelete(this.props.fieldName, this.props.index);
    }
    
    moveCaretAtEnd(e) {
      const temp_value = e.target.value;
      e.target.value = '';
      e.target.value = temp_value;
    }
    
    render() {
       return (
            <span className="editor">
            { this.state.editText && <input className="recipe-editor-input" value={this.state.field} 
            onChange={e => this.onChange(e.target.value)} autoFocus onFocus={this.moveCaretAtEnd.bind(this)}
            onKeyDown={e => e.keyCode === 13 && this.saveEdits()}
            
            /> }
            { !this.state.editText && <i className="fa fa-pencil" aria-hidden="true" onClick={this.displayEditor.bind(this)}></i> }
            { !this.state.editText && this.props.multiple && <i className="fa fa-trash" aria-hidden="true" onClick={this.deleteField.bind(this)}></i> }
            { this.state.editText && <i className="fa fa-check" aria-hidden="true" onClick={this.saveEdits.bind(this)}></i>  }
            { this.state.editText && <i className="fa fa-times" aria-hidden="true" onClick={this.cancelEdit.bind(this)}></i> }
           </span>
           );
          
    }
}