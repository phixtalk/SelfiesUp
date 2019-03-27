import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  View  
} from 'react-native';
import { Container, Header, Content, Item, Input, Label, Button, Tab, Tabs, TabHeading, Icon, Text } from 'native-base';

import {Actions} from 'react-native-router-flux';
import base_url from '../../serverurl';

import Login from './Login';
import Feeds from './Feeds';
import Page from './Page';
import Profile from './Profile';
import { Root } from "native-base";

export default class Home extends Component {
	
	constructor(props){
		super(props);
		this.state = {
		  uemail: '',
		  ustatus: '',
		  unames:'',
		  userToken:'',
		  userid:'',
		  loaded: false
		}
	}
	
	someEventHnadler() {
		this._tabs.goToPage(0);
	}
  
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'usernames', 'email', 'status', 'userid']).then((data) => {
			let idtoken = data[0][1];
			let usename = data[1][1];
			let email = data[2][1];
			let cstatus = data[3][1];
			let useridd = data[4][1];
			if(idtoken !== null){
				this.setState({
					uemail: email,
					ustatus: cstatus,
					unames:usename,
					userToken: idtoken,
					userid:useridd,
					loaded: true
				});
			}else{
				Actions.Login();
			}
		});
	 }
	/*
	<View>
		<Item>
			<Icon name="people" />
			<Input placeholder="Search" />
			<Button transparent>
				<Icon name="search" />
			</Button>
		</Item>
	</View>
	*/
	render() {
		return (
			<Container>
				<Tabs initialPage={0} ref={(c) => {this._tabs = c;}}>
				  <Tab heading={ <TabHeading><Text>Feed</Text></TabHeading>}>
					<Feeds dpmode="1" /> 
				  </Tab>
				  <Tab heading={ <TabHeading><Text>Trending</Text></TabHeading>}>
					<Feeds dpmode="2" /> 
				  </Tab>
				  <Tab heading={ <TabHeading><Icon name="person" /></TabHeading>}>
					<Root>
					<Page ownerpage="true" />
					</Root>
				  </Tab>
				  <Tab heading={ <TabHeading><Icon name="create" /></TabHeading>}>
					 <Profile />
				  </Tab>
				</Tabs>
			</Container>
		);
	}
}

AppRegistry.registerComponent('Home', () => Home);
