//import logo from './logo.svg';
import React,{ Component } from 'react';
import Particles from 'react-particles-js';
//import Clarifai from 'clarifai';
import SignIn from './components/signIn/signIn';
import FaceRecognition from './components/faceRecognition/faceRecognition'
import Navigation from './components/navigation/navigation';
import Register from './components/register/register';
import Logo from './components/logo/logo';
import ImageLinkForm from './components/imageLinkForm/imageLinkForm';
import Rank from './components/rank/rank';
import './App.css';

  // Instantiate a new Clarifai app by passing in your API key.
  // const app = new Clarifai.App({
  //  apiKey: 'c5b1472c37714a84861d590aa32eb6c1'
  // });

const particlesOptions = {
  particles: {
    number: {
      value:100,
      density:{
        enable:true,
        value_area:800
      }
  }
}
}

const initialState= {
  
    input:'',
    imageUrl:'',
    box:{},
    route:'signin',
    isSignedIn:false,
    user:{
      id:'',
      name:'',
      email:'',
      entries:0,
      joined:''
    }
}
class App extends Component {
  constructor() {
    super();
    this.state = initialState
  }
  
    loadUser = (data) =>{
      this.setState({user: {
        id:data.id,
        name:data.name,
        email:data.email,
        entries:data.entries,
        joined:data.joined
      }})
    }
    calculateFaceLocation = (data) => {
      console.log("got calc face location param as", data);
      const clarifaiFace = data.outputs[0].data.regions[0].region_info.bounding_box;
     
      const image=document.getElementById('inputimage');
      const width=Number(image.width);
      const height=Number(image.height);
      console.log(width,height);
      return{
        leftCol: clarifaiFace.left_col * width,
        topRow: clarifaiFace.top_row * height,
        rightCol: width - (clarifaiFace.right_col * width),
        bottomRow: height - (clarifaiFace.bottom_row  *height)
      }
    }

    displayFaceBox = (box) => {
      console.log("creating box around face",box);
      this.setState({box:box});
    }
  onInputChange = (event) => {
    this.setState({input:event.target.value});
    console.log(event.target.value);
  }
//   onButtonSubmit = () => {
//     console.log('click');
//     this.setState({imagURL:this.state.input});
//     // app.models
//     // .predict(Clarifai.FACE_DETECT_MODEL, 
//     //   this.state.input) /*MOVED TO BACKEND */
//      fetch('http://localhost:3000/imageurl', {
//        method:'post',
//        headers: {'Content-Type': 'application/json'},
//        body:JSON.stringify({
//          input:  this.state.input
//        })
//      })
//     .then(response => response.json())
//     .then(response => {
//     if(response){
//       fetch('http://localhost:3000/image',{
//         method:'put',
//       headers:{'Content-Type':'application/json'},
//       body:JSON.stringify({
//         id:this.state.user.id
//       })
//     })
//     .then(response => response.json())
//     .then(count => {
//       this.setState(Object.assign(this.state.user,{ entries:count }))
//     })
//     .catch(console.log)
//   }
//     this.displayFaceBox(this.calculateFaceLocation(response))
//   .catch(err => console.log(err));
 
//   })
// }

onButtonSubmit = () => {
  console.log("entering onsubmit button");
  this.setState({imageUrl: this.state.input});
    fetch('http://localhost:3000/imageurl', {
      method: 'post',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        input: this.state.input
      })
    })
    .then(response => response.json())
    .then(response => {
      console.log(" response from imgurl route is",response);
      if (response) {
        fetch('http://localhost:3000/image', {
          method: 'put',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            id: this.state.user.id
          })
        })
          .then(response => response.json())
          .then(count => {
            console.log(" response from img db route is",response);
            this.setState(Object.assign(this.state.user, { entries: count}))
          })
          .catch(console.log)

      }
      console.log("calling dsiplayfacebox, calc face location with param",response);
      this.displayFaceBox(this.calculateFaceLocation(response))
    })
    .catch(err => console.log(err));
}

  onRouteChange = (route) => {
    if(route === 'signout') {
      this.setState(initialState);
    }
    else if(route === 'home'){
      this.setState({isSignedIn:true});
    }
    this.setState({route: route});
  }
  render(){
    const{ isSignedIn,imageUrl,route,box }=this.state;
    return (
      <div className="App">
        <Particles  className='particles' params={particlesOptions}/>
        <Navigation isSignedIn={isSignedIn} onRouteChange ={this.onRouteChange}/>

        {  route === 'home'
          ? <div>
          <Logo />
           <Rank 
             name={this.state.user.name}
             entries={this.state.user.entries}
           />
           <ImageLinkForm 
           onInputChange={this.onInputChange} 
           onButtonSubmit={this.onButtonSubmit} 
           />
           <FaceRecognition box={box} imageUrl={imageUrl}/> 
           </div>
          :(
            route === 'signin'
            ? <SignIn 
              loadUser={ this.loadUser}
              onRouteChange={this.onRouteChange}/>
            : <Register 
                loadUser={this.loadUser}
                onRouteChange={this.onRouteChange}/>
          )
        }
      </div>
    );
  }
} 


export default App;
