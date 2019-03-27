/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  ActivityIndicator,
  AsyncStorage,
  StyleSheet,
  Navigator,
  Text,
  View,
  ToolbarAndroid
} from 'react-native';
import { Container, Header, Content, Form, Item, Input, Label, Button } from 'native-base';

import AppHeader from './src/components/appHeader';
import Login from './src/components/pages/Login';
import Register from './src/components/pages/Register';
import Home from './src/components/pages/Home';
import Page from './src/components/pages/Page';
import Photos from './src/components/pages/Photos';
import Picture from './src/components/pages/Picture';

import {Router, Scene} from 'react-native-router-flux';

export default class SelfiesUp extends Component {
	
	constructor() {
		super();
		this.state = { hasToken: false, isLoaded: false };
	}
	//call the life cycle method
	componentDidMount() {
		//hasToken status is now known, whether it is set or not, hence set isLoaded to true
		
		/*AsyncStorage.getItem('id_token').then((token) => {
		  this.setState({ hasToken: token !== null, isLoaded: true })
		});*/
		
		AsyncStorage.multiGet(['id_token', 'usernames', 'email', 'status']).then((data) => {
			let token = data[0][1];
			this.setState({ hasToken: token !== null, isLoaded: true })
		});
		
	}

	render() {
		//return a loaded by default, until we've finished checking the hasToken status
		if (!this.state.isLoaded) {
		  return (
			<ActivityIndicator size="large"/>
		  )
		} else {
		  return(
			<Router navigationBarStyle={styles.navBar} titleStyle={styles.navBarTitle} barButtonTextStyle={styles.barButtonTextStyle} barButtonIconStyle={styles.barButtonIconStyle}>
			  <Scene key='root'>
				<Scene
				  component={Login}
				  initial={!this.state.hasToken}
				  key='Login'
				  hideNavBar={true}
				  title='Login'
				/>
				<Scene
				  component={Home}
				  initial={this.state.hasToken}
				  key='Home'
				  hideNavBar={true}
				  title='Home Page'
				/>
				<Scene
				  component={Register}
				  key='Register'
				  hideNavBar={false}
				  title='Registration Page'
				/>
				<Scene
				  component={Page}
				  key='Page'
				  hideNavBar={false}
				  title='Albums'
				/>
				<Scene
				  component={Photos}
				  key='Photos'
				  hideNavBar={false}
				  title='Gallery'
				/>
				<Scene
				  component={Picture}
				  key='Picture'
				  hideNavBar={false}
				  title='Picture'
				/>
				</Scene>
			</Router>
		  )
		}
	}
}

const styles = StyleSheet.create({
  
	navBar: {
		backgroundColor:'#3f51b5',
	},
	navBarTitle:{
		color:'#FFFFFF'
	},
	barButtonTextStyle:{
		color:'#FFFFFF'
	},
	barButtonIconStyle:{
		tintColor:'rgb(255,255,255)'
	},
});

AppRegistry.registerComponent('SelfiesUp', () => SelfiesUp);
