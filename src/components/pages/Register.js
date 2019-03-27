import React, {Component} from 'react';
import {
  AppRegistry,
  AsyncStorage,
  View,
  Text,
  ToolbarAndroid,
  ActivityIndicator
} from 'react-native';
import { Container, Content, Form, Item, Input, Label, Button } from 'native-base';
import {Actions} from 'react-native-router-flux';

import base_url from '../../serverurl';


import Login from './Login';
import AppHeader from '../appHeader';

//import { Header,Title, List, Form, Item, Label, ListItem, InputGroup, Input, Icon, Text, Picker, Button } from 'native-base';



export default class Register extends Component {
	
	constructor(props) {
		super(props);
		this.state = {
		  // used to display a progress indicator if waiting for a network response.
		  loading: false,
		  // entered credentials
		  email: '',
		  password: '',
		  usernames:''
		}
	 }
	  
	 // A method to passs the username and password to firebase and make a new user account
	signup() {
		if(this.state.email==="" || this.state.password===""){
			alert("Please signup with your email and password" );
		}else{
			this.setState({
			  // When waiting for the firebase server show the loading indicator.
			  loading: true
			});
			let data = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					usernames: this.state.usernames,
					email: this.state.email,
					password: this.state.password,
				}),
			}
			fetch(base_url+'api/register', data)
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
					loading: false
				  });
			  
				if(responseJson.status=="success"){
					//AsyncStorage.setItem('id_token', responseJson.id_token);
					AsyncStorage.multiSet([
						["id_token", responseJson.id_token],
						["usernames", responseJson.usernames],
						["email", responseJson.email],
						["userid", responseJson.userid],
						["userpicture", responseJson.pictureurl],
						["status", responseJson.ustatus]
					]);
					//AsyncStorage.setItem('status', responseJson.ustatus);
					this.setState({
					  email: '',
					  password: '',
					  usernames:'',
					  loading: false
					});
					Actions.Home()
				}else if(responseJson.status=="empty"){
					alert("Please enter all required fields.");
				}else if(responseJson.status=="failure"){
					alert("Something went wrong. Please try later.");
				}else if(responseJson.status=="exist"){
					alert("This email address has already been used.");
				}
			})
			.catch((error) => {
				// Leave the fields filled when an error occurs and hide the progress indicator.
			  this.setState({
				loading: false
			  });
			  alert("Something went wrong: " + error.message );
			});
		}
	}
  
	render() {
		// The content of the screen should be inputs for a username, password and submit button.
		// If we are loading then we display an ActivityIndicator.
	
		const content = this.state.loading ? <ActivityIndicator size="large"/> :
		
				<Form>
					<Item floatingLabel>
					  <Label>Usernames:</Label>
					  <Input
						  onChangeText={(text) => this.setState({usernames: text})}
						  value={this.state.usernames}/>
					</Item>
					<Item floatingLabel>
					  <Label>Email:</Label>
					  <Input
						  onChangeText={(text) => this.setState({email: text})}
						  value={this.state.email}/>
					</Item>
					<Item floatingLabel>
					  <Label>Password:</Label>
					  <Input
						  onChangeText={(text) => this.setState({password: text})}
						  value={this.state.password}
						  secureTextEntry={true} />
					</Item>
					<Button block success style={{ marginTop: 40,marginBottom: 20 }} onPress={this.signup.bind(this)}>
						<Text style={{ color: '#FFF', fontWeight:'bold' }}>Signup</Text>
					</Button>
				</Form>
			
		
		return (
			<Container>			
				<AppHeader />	
				<Content>
					{content}
				</Content>
			</Container>
		);
	}
}

AppRegistry.registerComponent('Register', () => Register);
