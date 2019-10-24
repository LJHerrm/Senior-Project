import React from 'react';
import ReactDOM from 'react-dom';


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
        let id = this.props.product.product_id.toString();
        cart[id] = (cart[id] ? cart[id]: 0);
        let qty = cart[id] + parseInt(this.state.quantity);
        /*if (this.props.product.available_quantity < qty) {
            cart[id] = this.props.product.available_quantity;
        }
        else {
            cart[id] = qty
        }*/
        cart[id] = qty
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    //Fix checkbox so on deselect it removes item from cart
    render() {
        const { product } = this.props;
        return (
            <div className="card" style={{ marginBottom: "10px"}}>
                <div className="card-body">
                    <h4 className="card-title">{product.product}</h4>
                    <img src={`data:image/jpg;base64, ${product.image}`}/>
                    <h5 className="card-text"><small>price: </small>${product.price}</h5>
                    <div>
                        <input type="checkbox" onChange={this.addToCart} name="product"     
                            className="float-right"/> 
                        {/*<button className="btn btn-sm float-right" 
                            onClick={this.addToCart}>Add to cart</button>*/}
                        <input type="number" value={this.state.quantity} name="quantity" 
                            onChange={this.handleInputChange} className="float-right" 
                            style={{ width: "60px", marginRight: "10px", borderRadius: "3px"}}/>
                    </div>
                </div>
            </div>
        )
    }
}


export default ProductItem;