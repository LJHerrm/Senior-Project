/*---------------------------------------------------------------------------------------------------------------------\
 * Date Created: November 21, 2019
 * Description: The CustomerAccountPage class component is used to direct customers to pages that allow them
 * to change their info or see their orders
 * The main handlers/function s in this component are:
 *      - handleNameChange
 *      - handleEmailChange
 *      - handleClick
 *      - render
 *---------------------------------------------------------------------------------------------------------------------*/
import React from 'react';
import ReactDOM from 'react-dom';
import logo from './customer_logo.jpg';
import { Form, Button, Col } from 'antd' 
const FormItem= Form.Item;

class CustomerAccountPage extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            name: '',
            email: '',
            id:'',
            page: ''
        };//end state

        this.handleNameChange = this.handleNameChange.bind(this);
        this.handleEmailChange = this.handleEmailChange.bind(this);
        this.handleClick = this.handleClick.bind(this);
    }//end constructor
  
    /***********************************************************************************
   * State Handlers: These handlers set the states based on the given events. These
   * will corrspond to the user entries in the delivery form.
   ************************************************************************************/
    handleNameChange(event) {
        this.setState({name: event.target.value});
    }//end handleNameChange
  
    handleEmailChange(event) {
        this.setState({email: event.target.value});
    }//end handleEmailChange
   
   /*****************************************************************************************
    * Handler: handleClick - This handler will route the application to other existing pages.
    * This handler will be called on the button's click. 
    * Parameters: This handler takes one parameter representing the URL extension where the
    * page that will be accesses will be located.
    * Preconditions: None
    * Postconditions: The user will be rerouted to the correct page
    **************************************************************************************/
    handleClick = param => e => {
        e.preventDefault();
        this.props.history.push(param);
    };//end handleClick

    /*---------------------------------------------------------------------------------------------------------------------
    * Function: render takes care of rendering all component elements to the screen. 
    * Then the return includes all JSX/HTML components and their formatting. 
    * In this portion we define the form that will be used in the page. 
    *---------------------------------------------------------------------------------------------------------------------*/ 
    render() {
        let name = '';
        if (this.props.currentUser) {
            let currentUser = this.props.currentUser;
            name = currentUser.name;
        }//end if
        return (  
            <Form className="customerPage" onSubmit={this.handleSubmit}> 
            {/* WELCOME TITLE */}
                <h1 class="title" align="center"> CUSTOMER ACCOUNT </h1> 
                <div>
                    {/* LOGO */}
                    <img src={logo} class="center" alt="logo" 
                    height={150}
                    width={150}/><br/>
                    <br/><br/>
                </div>
                <h2 align="center">Welcome {name}</h2>
                <div align="center" className="customer-container2">
                <Col>
                    <FormItem>
                        <Button
                            style={{ borderColor:"#597ef7"}}
                            htmlType="submit"
                            size="large"
                            className="edit"
                            onClick={this.handleClick("/edit-info")}>Edit My Info</Button>
                    </FormItem>
                </Col>
                <Col> 
                    <FormItem>
                    <Button
                        style={{ borderColor:"#597ef7"}}
                        htmlType="submit"
                        size="large"
                        className="edit"
                        onClick={this.handleClick("/all-orders")}>See All Orders</Button>
                    </FormItem>
                </Col>
                </div>
            </Form>
        );//end return
    }//end render
}//end CustomerAccountPage

ReactDOM.render(
    <CustomerAccountPage/>,
    document.getElementById('root')
);

export default CustomerAccountPage; 

