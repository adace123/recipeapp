import React, {Component} from 'react';
import '../styles/notfound.css'; 


export default class NotFound extends Component {
    
    constructor() {
        super();
        this.state = {
            countdown: 5
        }
        
        let interval = setInterval(() => {
            if(this.state.countdown === 1) {
                window.location = "/";
                clearInterval(interval);
            }
            this.setState({countdown: this.state.countdown - 1});
        }, 1000);
    }
    
    render() {
        return (
          <div className="not-found">
            <h1>Whoops. Page not found.</h1>
            <p>Redirecting in {this.state.countdown}</p>
          </div>
        );
    }
}