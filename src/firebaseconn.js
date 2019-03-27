import * as firebase from 'firebase';  // Initialize Firebase
  var fireBaseconfig = {
	apiKey: "AIzaSyDnhdJ27i6wOHX7j0MpX0fFf1zWN2jRBXM",
    authDomain: "selfieup-9bb03.firebaseapp.com",
    databaseURL: "https://selfieup-9bb03.firebaseio.com",
    storageBucket: "selfieup-9bb03.appspot.com",
    messagingSenderId: "52967757696"
	
  };
 
//const firebaseApp = firebase.initializeApp(fireBaseconfig);
var firebaseApp = firebase.initializeApp(fireBaseconfig);
module.exports=firebaseApp; //this doesnt have to be database only
