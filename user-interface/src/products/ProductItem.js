import React from 'react';
import ReactDOM from 'react-dom';
import { getProducts } from '../util/APIFunctions';
import { notification, message } from 'antd';

class ProductItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {quantity: 1}
    }
    
    handleInputChange = event => 
        this.setState({[event.target.name]: event.target.value})
    
    addToCart = () => {
        let cart = localStorage.getItem('cart') 
                 ? JSON.parse(localStorage.getItem('cart')) : {};
        let id = this.props.product.productId.toString();
        cart[id] = (cart[id] ? cart[id]: 0);
        //console.log(cart[id]);
        let qty = cart[id] + parseInt(this.state.quantity);
        /*if (this.props.product.available_quantity < qty) {
            cart[id] = this.props.product.available_quantity;
        }
        else {
            cart[id] = qty
        }*/

        //Prevent negative numbers from adding to cart
        if (parseInt(this.state.quantity) >= 0) {

            cart[id] = qty
            localStorage.setItem('cart', JSON.stringify(cart));
            //alert("You have added " + qty + " of product " + this.props.product.product.toString() + " to your cart.");
            notification.success({
                message: 'LCHS Band Fundraising',
                description: "Your cart contains " + qty + " of product " + this.props.product.product.toString()
            });
         //console.log(cart);
        }

        else {
            notification.error({
                message: 'Error inputting product',
                description: 'Please only enter positive numbers.'
            });
        }
    }
    
    removeFromCart = (product) => {
        if (localStorage.getItem('cart') !== null) {
            let cart = JSON.parse(localStorage.getItem('cart'));
            let id = this.props.product.productId.toString();
            if (cart[id] !== undefined) {
                delete cart[id];
                notification.success({
                    message: 'LCHS Band Fundraising',
                    description: "Item " + this.props.product.product.toString() + " has been completely removed from your cart."
                });
                if (Object.keys(cart).length > 0) {
                    localStorage.setItem('cart', JSON.stringify(cart));
                }
                else 
                    localStorage.removeItem('cart');
            }
            else {
                message.error('This product is not in the cart!! Nothing to Remove!!', 5);
            }
        }
        else {
            message.error('Your cart is empty!! Nothing to Remove!!', 5);
        }
        
    }
    
    render() {
        const { product } = this.props;
        return (
            <div className="card" style={{ marginBottom: "10px"}}>
                <div className="card-body">
                    
                    <h4 className="card-title">{product.product}</h4>
                    <img src={`data:image/jpg;base64, ${product.image}`}/>
                    <h5 className="card-text"><small>price: </small>${product.price}</h5>
                    <h6 className="card-text">{product.description}</h6>
                    <div>
                        <button className="btn btn-sm btn-warning float-right" 
                            onClick={this.removeFromCart}>Remove product</button>
                        <button className="btn btn-sm btn-warning float-right"
                            onClick={this.addToCart}>Add product</button>
                        
                        <input type="number" value={this.state.quantity} min="1" name="quantity" 
                            onChange={this.handleInputChange} className="float-right" 
                            style={{ width: "60px", marginRight: "10px", borderRadius: "3px"}}/>
                    </div>
                </div>
            </div>
        )
    }
}


export default ProductItem;
