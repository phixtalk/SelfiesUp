import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  Text,
  View,
  Image,
  ActivityIndicator
} from 'react-native';
import { Container, Header, Form, Content, Item, Input, Label, Button, ListItem } from 'native-base';

import {Actions} from 'react-native-router-flux';
import AppHeader from '../appHeader';

import base_url from '../../serverurl';

export default class Login extends Component {
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
	signin() {
		if(this.state.email==="" || this.state.password===""){
			alert("Please enter your login credentials" );
		}else{
			this.setState({
			  loading: true
			});
			
			let data = {
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					email: this.state.email,
					password: this.state.password,
				}),
			}
			fetch(base_url+'api/login', data)
			.then((response) => response.json())
			.then((responseJson) => {
				this.setState({
				  email: '',
				  password: '',
				  loading: false
				});
				if(responseJson.status=="success"){
					AsyncStorage.setItem('id_token', responseJson.id_token);
					AsyncStorage.setItem('usernames', responseJson.usernames);
					AsyncStorage.setItem('email', responseJson.email);
					AsyncStorage.setItem('status', responseJson.ustatus);
					AsyncStorage.setItem('userid', responseJson.userid);
					AsyncStorage.setItem('userpicture', responseJson.pictureurl);
					Actions.Home()
				}else if(responseJson.status=="empty"){
					alert("Please enter your email and password.");
				}else if(responseJson.status=="wrong"){
					alert("Your login details are inaccurate.");
				}
			})
			.catch((error) => {
				this.setState({
				  loading: false
				});
				alert("Something went wrong: " + error.message );
			});
		}
	}
	
	render() {
		const pageloader = this.state.loading ? <ActivityIndicator size="large"/>:<Text></Text>;
		return (
		<Container>			
			<AppHeader />	
			<Content>
			<Form>
				<ListItem style={{justifyContent: 'center',alignItems: 'center',}}>
				<Image source={require ('../../img/logo.png')} style={{ width: 70,height:70 }} />
				</ListItem>
				
				<View>{pageloader}</View>
				
				<Item floatingLabel>
				  <Label>Email</Label>
				  <Input
					  onChangeText={(text) => this.setState({email: text})}
					  value={this.state.email}/>
				</Item>
				<Item floatingLabel last>
				  <Label>Password</Label>
				  <Input
					  onChangeText={(text) => this.setState({password: text})}
					  value={this.state.password}
					  secureTextEntry={true} />
				</Item>
				<Button block success style={{ marginTop: 40,marginBottom: 20 }} onPress={this.signin.bind(this)}>
					<Text style={{ color: '#FFF', fontWeight:'bold' }}>Login</Text>
				</Button>
					
					
				<Button block info onPress={() => Actions.Register()} >
					<Text style={{ color: '#FFF', fontWeight:'bold' }}>Sign Up With Email</Text>
				</Button>
			</Form>		  
			</Content>
		  </Container>
		);
	}
}

AppRegistry.registerComponent('Login', () => Login);
