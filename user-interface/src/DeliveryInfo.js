/*---------------------------------------------------------------------------------------------------------------------\
 * Date Created: October 10, 2019
 * Description: The DeliveryInfo class comonent allows admins to create orders for customers who pay in cash
 * This page includes a form where the admin can enter the customer's name, phone number, address, and how 
 * much a user paid. The admin is also given a list of all the products they are ordering for the user.
 * The main handlers/functions in this component are:
 *      - handleInputChange
 *      - handleSubmit
 *      - handleIsFormInvalid
 *---------------------------------------------------------------------------------------------------------------------*/
import React from 'react';
import ReactDOM from 'react-dom';
import './DeliveryInfo.css';
import { createOrder, createProductsOrdered, getProduct } from './util/APIFunctions';
import {Form, Input, Button, Table, notification } from 'antd';
import {
    NAME_MIN_LENGTH,
    NAME_MAX_LENGTH, 
} from './constants';


const FormItem = Form.Item;

class DeliveryInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = { 
            name:    { value: '' },
            phone:   { value: '' },
            address: { value: '' },
            city: 	{ value: '' },
            st:	 	{ value: '' },
            zipCode: { value: '' },
            paid:    { value: 0  },
            totalCost: 0,
            products: [],
            order_id: 0
        };//end state

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.isFormInvalid = this.isFormInvalid.bind(this);
    }//end constructor
  
  /***********************************************************************************
   * State Handlers: These handlers set the states based on the given events. These
   * will corrspond to the user entries in the delivery form.
   ************************************************************************************/
    handleInputChange(event, validationFun) {
        const target = event.target;
        const inputName = target.name;
        const inputValue = target.value;

        this.setState ({
            [inputName] : {
                value: inputValue,
                ...validationFun(inputValue)
            }
        });//end setState
    }//end handleInputChange
   
    /*---------------------------------------------------------------------------------------------------------------------
     * Function: componentDidMount is executed as soon as the component is mounted; when the application or the page itself
     * is accessed. This function takes care of retrieving all the products that were chosen by the admin. It calls localStorage
     * to get the list of products ordered as well as the quantities ordered. Then for each product chosen it calls the API
     * function getProduct to get the name of the product it takes all of this information and stores it to be displyed in the
     * table.
     * Parameters: None
     * Preconditions:
     *      - A list of products needs to be stored in local Storage with a key of cart.
     * Postconditions: 
     *      - All the information about the products that will be ordered will be stored in the products state
     *      - The total cost of the order will be stored in the totalCost state
     *---------------------------------------------------------------------------------------------------------------------*/  
    async componentDidMount() {
        let cart = JSON.parse(localStorage.getItem('cart'));
        if (localStorage.getItem('cart') !== null) { 
            let cartSize = Object.keys(cart).length;
            let keys = Object.keys(cart);
            var tot = 0;
            const productNames = [];
            const productPrices = [];
            const productQuantities = [];
            const items = [];
            
            for (var i = 0; i < cartSize; i++) {
                let productID = keys[i];
                let quantity = cart[keys[i]];
                await getProduct(productID)
                    .then (response => {
                        this.setState({
                            productName: response.product,
                            productPrice: response.price
                        });//end setState
                    })//end then
                    .catch(error => {
                        notification.error({
                            message: 'LCHS Band Fundraising',
                            description:error.message || 'Sorry! Something went wrong!'
                        });//end notification
                    })//end catch
                const price = this.state.productPrice
                productNames.push(this.state.productName);
                
                if (price != undefined) { 
                    productPrices.push("$" + price.toString());
                }//end if
                
                productQuantities.push(quantity);
                tot += (this.state.productPrice * quantity);
            }//end for
            
            for (var i = 0; i < productNames.length; i++) {
                const item = { product: productNames[i], price: productPrices[i], quantity: productQuantities[i] }
                items.push(item);
            }//end for
            this.setState({ products: items })
            this.setState({ totalCost: tot });
        }//end if
    }//end componentDidMount

  /*******************************************************************************************
   * Handler: handleSubmit() - This handler takes care of posting the order delivery
   * information to the API, which will in turn isert the relevan information to the 
   * database. 
   * Parameters: default submit event
   * Preconditions: All fields in the delivery forma must be filled out
   * Postcondition: An order will be created and all relevant order information will be inserted
   * into the database.
   ********************************************************************************************/
    async handleSubmit(event) {
        event.preventDefault();
        let user_id = -2;
        const name  = this.state.name.value;
        const phone = this.state.phone.value;
        const address = this.state.address.value;
        const city = this.state.city.value;
        const st = this.state.st.value;
        const zipCode = this.state.zipCode.value;
        const paid  = this.state.paid.value.split('.');
        var addr_info = address.concat(' ', city, ' ', st, ' ', zipCode);
        var order_created = true;
        var products_added = true;
      
        const orderInfo = {
            address: addr_info,
            payment: 'cash',
            phone: phone,
            delivered: false,
            camp: 19,
            userId: user_id,
            name: name,
            paid: paid[0],
            totalCost: this.state.totalCost
        };//end orderInfo
        localStorage.setItem('cashOrderInfo', JSON.stringify(orderInfo));
        /* Call the createOrder function to create order in database */
        createOrder(orderInfo)
            .then((order_id) => this.setState({ order_id }))
            .catch(error => {
                order_created = false;
            });//end catch
        
            
        /* Implementing insertion of multiple products tied to one order number */
        setTimeout(function() {
            const orderID = this.state.order_id;
        
            let cart = JSON.parse(localStorage.getItem('cart'));
            let cartSize = Object.keys(cart).length;
            let keys = Object.keys(cart); 
            
            for (var i = 0; i < cartSize; i++) {
                let productID = keys[i];
                let quantity = cart[keys[i]];
                const productsOrdered = {
                    orderId: parseInt(orderID, 10),
                    productId: productID,
                    quantity: quantity
                };//end productsOrdered
                if (order_created === true) {    
                    createProductsOrdered(productsOrdered)
                        .catch(error => {
                            products_added = false;
                            notification.error({
                                message: 'LCHS Band Fundraising',
                                description:error.message || 'Sorry! Something went wrong!'
                            });//end notification
                        });//end catch
                }//end if
                else {
                    notification.error({
                        message: 'LCHS Band Fundraising',
                        description:'Sorry! Something went wrong! Please try creating your order again.'
                    });//end notification
                    products_added = false;
                    this.props.history.push("/failure-page");
                }//end else
                if (products_added === false) {
                    this.props.history.push("/failure-page");
                    break;
                    /* remove order and redirect to other page to attempt order again */
                }//end if
            }//end for

            if (products_added === true) {
                notification.success({
                    message: 'LCHS Band Fundraising',
                    description: "Your order has been placed!"
                });//end notification
                localStorage.removeItem('cart')
                localStorage.setItem('orderNumber', orderID);
                localStorage.removeItem('cart')
                this.props.history.push("/order-confirmation");
            }//end if
            
        }.bind(this), 500)//end Timeout
        
    }//end handleSubmit

    /*---------------------------------------------------------------------------------------------------------------------
     * Function: isFormInvalid checks whether or not the inputted values are valid or not
     * Parameters: None
     * Preconditions:
     *      - None
     * Postconditions: 
     *      - Returns true or false based on the validity of the input 
     *---------------------------------------------------------------------------------------------------------------------*/  
    isFormInvalid() {
        return !(this.state.name.validateStatus === 'success' &&
            this.state.address.validateStatus === 'success' &&
            this.state.city.validateStatus === 'success' &&
            this.state.st.validateStatus === 'success' &&
            this.state.zipCode.validateStatus === 'success'
        );//end return
    }//end isFormInvalid
   

    /*---------------------------------------------------------------------------------------------------------------------
    * Function: render takes care of rendering all component elements to the screen. Here we define the main table's
    * columns. Then the return includes all JSX/HTML components and their formatting. In this portion we define the 
    * table and form that will be used in the page. 
    *---------------------------------------------------------------------------------------------------------------------*/ 
    render() {
        const columns = [
        {
            title: 'Product',
            dataIndex: 'product',
            key: 'product',
        },
        {
            title: 'Price',
            dataIndex: 'price',
            key: 'price',
        },
        {
            title: 'Quantity',
            dataIndex: 'quantity',
            key: 'quantity',
        },    
    ];//end column
    return (
        <div className="delivery-info-container">
            <h2 className="page-title"> Order Summary </h2>
            <div className="order-summary">
                <Table 
                    dataSource={this.state.products} 
                    columns={columns} 
                    pagination={false}
                    footer={ () => 'Your total is: $' + this.state.totalCost }
                />
            </div>
            <h2 className="page-title"> Delivery Information Form </h2>
            <h5 align="center"> In order to get your items to you, we require some information </h5>
                <div className="delivery-form-content">
                    <Form align="center" onSubmit={this.handleSubmit} className="delivery-form"> 
                        <FormItem
                            label="Full Name"
                            validateStatus={this.state.name.validateStatus}
                            help={this.state.name.errorMsg}>
                            <Input
                                size="large"
                                name="name"
                                autoComplete="off"
                                placeholder="Customer's full name"
                                value={this.state.name.value}
                                onChange={(event) => this.handleInputChange(event, this.validateName)}/>
                        </FormItem>
                        <FormItem
                            label="Phone"
                            validateStatus={this.state.phone.validateStatus}
                            help={this.state.phone.errorMsg}>
                            <Input
                                name="phone"
                                placeholder="##########"
                                maxLength="10"
                                value={ this.state.phone.value }
                                onChange={(event) => this.handleInputChange(event, this.validatePhone) }/>
                        </FormItem>
                        <FormItem
                            label="Address"
                            validateStatus={this.state.address.validateStatus}
                            help={this.state.address.errorMsg}>
                            <Input
                                size="large"
                                name="address"
                                autoComplete="off"
                                placeholder="1234 Street Name"
                                maxLength="20"
                                value={this.state.address.value}
                                onChange={(event) => this.handleInputChange(event, this.validateAddress)}/>
                        </FormItem>
                        <FormItem
                            label="City"
                            validateStatus={this.state.city.validateStatus}
                            help={this.state.city.errorMsg}>
                            <Input
                                size="large"
                                name="city"
                                autoComplete="off"
                                placeholder="Your city"
                                maxLength="20"
                                value={this.state.city.value}
                                onChange={(event) => this.handleInputChange(event, this.validateCity)}/>
                        </FormItem>
                        <FormItem
                            label="State"
                            validateStatus={this.state.st.validateStatus}
                            help={this.state.st.errorMsg}>
                            <Input
                                size="large"
                                name="st"
                                autoComplete="off"
                                placeholder="Your state"
                                maxLength="15"
                                value={this.state.st.value}
                                onChange={(event) => this.handleInputChange(event, this.validateSt)}/>
                        </FormItem>
                        <FormItem
                            label="Zip Code"
                            validateStatus={this.state.zipCode.validateStatus}
                            help={this.state.zipCode.errorMsg}>
                            <Input
                                size="large"
                                name="zipCode"
                                autoComplete="off"
                                placeholder="Zip code"
                                maxLength="5"
                                value={this.state.zipCode.value}
                                onChange={(event) => this.handleInputChange(event, this.validateZipcode)}/>
                        </FormItem>
                        <FormItem
                            label="Paid Amount"
                            validateStatus={this.state.paid.validateStatus}
                            help={this.state.paid.errorMsg}>
                            <Input
                                size="large"
                                name="paid"
                                type="Integer"
                                autoComplete="off"
                                placeholder="0.00"
                                maxLength="8"
                                value={this.state.paid.value}
                                onChange={(event) => this.handleInputChange(event, this.validatePaid)}/>
                        </FormItem>
                        <FormItem>
                            <Button
                            htmlType="submit"
                            size="large"
                            className="delivery-form-button"
                            disabled={this.isFormInvalid()}>Continue</Button>
                        </FormItem>
                    </Form>
                </div>
            </div>
        );//end return
    }//end render

/***********************************************************************************
   * VALIDATION FUCNTIONS: These functions check whether or not an inputted value is 
   * valid or not. They also print a message to inform the user what part if any
   * of the inputted values is incorrect 
**************************************************************************************/
    validateName = (name) => {
        if(name.length < NAME_MIN_LENGTH){
            return{
                validateStatus: 'error',
                errorMsg: 'Name is too short (Minimum 4 characters needed.)'
            }//end return
        } //end if
        else if(name.length > NAME_MAX_LENGTH){
            return{
                validationStatus: 'error',
                errorMsg: 'Name is too long (Maximum 40 characters allowed.)'
            }//end return
        } //end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }

    validatePhone = (phone) => {
        if(phone.length > 10) {
            return{
                validateStatus: 'error',
                errorMsg: 'Invalid phone number. Please enter the phone number in the shown format.'
            }//end return
        } //end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }//end validatePhone

    validateAddress = ( address ) => {
        if( address.length < 3){
            return{
                validateStatus: 'error',
                errorMsg: 'Not a valid address'
            }//end return
        }//end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }//end validateAddress

    validateCity = ( city ) => {
        if( city.length < 3){
            return{
                validateStatus: 'error',
                errorMsg: 'Not a valid city'
            }//end return
        } //end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }//end validateCity

    validateSt = ( st ) => {
        if( st.length < 2){
            return{
                validateStatus: 'error',
                errorMsg: 'Not a valid state'
            }//end return
        }//end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }//end validateSt

   validateZipcode = ( zipCode ) => {
        if( zipCode.length < 5){
            return{
                validateStatus: 'error',
                errorMsg: 'Not a valid zip code'
            }//end return
        }//end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end else
    }//end validateZipcode

    validatePaid = ( paid ) => {
        if( paid.length === 0 || paid.length > 8){
            return{
                validateStatus: 'error',
                errorMsg: 'Not a valid amount'
            }//end return
        }//end if
        else {
            return{
                validateStatus: 'success',
                errorMsg: null,
            };//end return
        }//end els
    }//end validatePaid
 		
}//end of class

ReactDOM.render(
    <DeliveryInfo />,
    document.getElementById('root')
);
export default DeliveryInfo;
