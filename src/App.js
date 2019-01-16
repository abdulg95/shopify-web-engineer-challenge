import React, { Component } from 'react';
import Header from './components/Header';//Header component
import Spinner from './components/Spinner';//loading spinner
import {Glyphicon} from 'react-bootstrap';
import Axios from "axios";
import Parser from 'html-react-parser';
import shortid from 'shortid';
import './App.css';

/*store link to API*/
const API = 'https://secure.toronto.ca/cc_sr_v1/data/swm_waste_wizard_APR?limit=1000';

class App extends Component {
  constructor(props) {
    super(props)  
    /*set initial values for state*/  
    this.state = {
      data: [],// stores unparsed json
      favourites: [],//used to store fovourite items
      isLoading: true,// used to track state of requests
      error: null,// holds axios errors
      value: '',//used for input value binding 
      items: [] //used store extracted objects from json
    }
  }

  componentDidMount(){
    //pulls from API at beginning of app lifecycle
    Axios.get(API).then(response=>{
     // eslint-disable-next-line
     response.data.map((item)=>{
        //gives every object a favourite and id property
        item.favourite = false
        item.id = shortid.generate()
      })
      //store data in state and stop loading
      this.setState({data: response.data,isLoading: false });
      console.log(this.state.data)
    }).catch(error=>{
      this.setState({error: error,isLoading: false});
      alert("There is a problem with the api request of type "+ error);
    });
    
  }

  //parses json by filtering items using keywords
  parse = (searchTerm) =>{
    let parsedData = [];    
    parsedData = this.state.data
    // eslint-disable-next-line
                .filter(object => {
                    if (object.keywords.indexOf(searchTerm) !== -1) {
                        return object;
                    }
                });
    console.log(searchTerm);
    console.log(parsedData);
    return parsedData;
  }
  
  //handles input form changes
  handleChange = (event) => {
    this.setState({value: event.target.value});
  }

  //handles what happens when favourite button is clicked
  handleFavourite = (id) =>{
    let faveLocation = this.state.data.findIndex(item=> item.id === id);
    let tempData = [];
    let tempFaves = [];
    tempData = [...this.state.data];
    tempFaves = [...this.state.favourites];

    if (this.state.data[faveLocation].favourite){             
        tempData[faveLocation].favourite = false;
        let tempIndex = this.state.favourites.findIndex(item=> item.id === id);
        if (faveLocation !== -1) {
          tempFaves.splice(tempIndex,1);
        }
        
    }else{
        //add to favourites pane      
       tempData[faveLocation].favourite = true;
       tempFaves.push(tempData[faveLocation]);        
    }
    this.setState({data:tempData,favourites:tempFaves});   
  } 

  //handles what happens when input is submitted
  handleSubmit = (event) => {
    event.preventDefault()
    if (this.state.value === "") {
      this.setState({items:[]});      
    } else {
        this.setState({items: this.parse(this.state.value) }) ;
    }
  }

  //formats items to be displayed properly
  formatItems = () =>{
    let items = "";
    if (this.state.items.length === 0) {
        items = (
            <div></div>
        );
    } else {
        items = this.state.items
                .map((item, index) => {  
                //set class of button to change color based on favourite property
                 let btnClass = item.favourite ? "faveButtonGreen" : "faveButton";      
                 let  parsedHtml = Parser(item.body);
                 let rawHtml = <div dangerouslySetInnerHTML={{__html:parsedHtml.toString()}}></div>
                //display item and description 
                return (
                    <div className="item" key={index}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="title">                                                           
                                 <button 
                                    className={btnClass} 
                                    //pass annonymous function to on click so it is not executed immediately
                                    onClick = {() =>this.handleFavourite(item.id)}>
                                    <Glyphicon glyph="star" />
                                 </button>                                                        
                                    <h3>{item.title}</h3>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="description">                         
                                    {rawHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
    }
    return items;

  }

  formatFavourites = () =>{
    let items = "";
    if (this.state.favourites.length === 0) {
        items = (
            <div></div>
        );
    } else {
        items = this.state.favourites
                .map((item, index) => {  
                 let btnClass = item.favourite ? "faveButtonGreen" : "faveButton";      
                 let  parsedHtml = Parser(item.body);
                 let rawHtml = <div dangerouslySetInnerHTML={{__html:parsedHtml.toString()}}></div>
                 
                 return (
                    <div className="item" key={index}>
                        <div className="row">
                            <div className="col-md-6">
                                <div className="title">                                                           
                                 <button 
                                    className={btnClass} 
                                    onClick = {() =>this.handleFavourite(item.id)}>
                                    <Glyphicon glyph="star" />
                                 </button>                                                        
                                    <h3>{item.title}</h3>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="description">                         
                                    {rawHtml}
                                </div>
                            </div>
                        </div>
                    </div>
                );
            });
    }
    return items;

  }


  render() {
    //display loading spinner while calling API
    if (this.state.isLoading) {
      return (<Spinner/>)
    }
    return (
      <div className = "container-default" >
        {/*header component*/}
          <Header />
        <div className = "container-fluid">
            
          {/*form for user input*/}
          <form onSubmit={this.handleSubmit}>          
                <input type="text"
                value={this.state.value}
                style = {{ paddingTop: '5px',paddingBottom: '5px',fontSize: '1.5em', margin: '10px'}}
                onChange={this.handleChange} />
              <button type="submit" style = {{backgroundColor: '#239460', marginRight: '10px', marginTop: '20px', borderRadius:'5px', border:'none'}}>
              <Glyphicon glyph="search icon-flipped" />
              </button>
            </form>

            {/* titles and descriptions*/}
            <div className="row">
              <div className="col-md-12">
                  {this.formatItems()}
              </div>  
            </div>

            {/* favourites pane only displayed when at least favourite is available*/}
            {this.state.favourites.length > 0 ? <div
                    className="favouritesColor"
                    style={{
                    background: "#f7fefa",
                    paddingBottom:"15px"
                }}>
                    <div className="row">
                        <div className="title col-md-12">
                            <h1
                                style={{
                                color: "#23995c",
                                marginLeft: "25px",
                                paddingTop:"20px",
                                fontWeight:"bold"
                                
                            }}>Favourites</h1>
                        </div>
                    </div>
                    <div className="favourites">
                    {/* Favourite titles and descriptions */}
                        {this.formatFavourites()}
                    </div>
                </div>: <div></div>}
            
           
        </div>

      </div>
    );
  }
}

export default App;
