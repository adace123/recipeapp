import React, {Component} from 'react';
import {observer, inject} from 'mobx-react';
import '../../styles/alert.css';

@inject('store')
@observer
export default class Alert extends Component {
    
    constructor(props) {
        super(props);
        this.alertStore = this.props.store.alertStore;
    }
    
    render() {
        const show = {display: 'flex', top: '5px', animationName: 'show'};
        const hide = {top: '-500px', display: 'none', animationName: 'hide'};
        let className;
        if(this.alertStore.successMessage.length) {
            className = "success";
        } else if(this.alertStore.loading) {
            className = "loading";
        } else className = "error";
        return(
            this.alertStore.showing ?
            <div className={`alert ${className}`} 
                 style={this.alertStore.showing ? show : hide}>
              { this.alertStore.successMessage.length > 0 && <h3>{this.alertStore.successMessage}</h3> }
              { this.alertStore.loading && <h3>Please wait...</h3> }
              { this.alertStore.errors.length > 0 && 
                    <ul>
                {  this.alertStore.errors.map((error, index) => <li key={index}>{error}</li>) }
                    </ul> }
              <i className="fa fa-times" id="closeAlert" onClick={() => this.alertStore.closeAlert("fast")}></i>
            </div> : <span></span>
        );
    }
}