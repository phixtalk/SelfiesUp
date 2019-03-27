import React, { Component } from 'react';
import {
  AppRegistry,
  View,
  Text,
  ActivityIndicator,
  AsyncStorage
} from 'react-native';
import { Content, Card, CardItem } from 'native-base';

import base_url from '../../serverurl';
import Uploadselfie from '../uploadSelfie';
import FeedData from './FeedData';

import {ContentSnippet, GetImage} from '../../helpers/helpers';

export default class Feed extends Component {
	
	constructor(props){
		super()
		this.state = {
		  data: [],
		  userid: '',
		  userToken: '',
		  loaded: false
		}
	}
	componentWillMount(){
		AsyncStorage.multiGet(['id_token', 'userid']).then((data) => {
			let idtoken = data[0][1];
			let useridd = data[1][1];
			this.setState({
				userid:useridd,
				userToken: idtoken
			});
			this.getData();
		});
	}
	getData() {
		let userdata = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				q_mode: this.props.dpmode,
				user_id: this.state.userid,
				user_token: this.state.userToken
			}),
		}
		fetch(base_url+'api/feeddata', userdata)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				this.setState({loaded: true});
				this.setState({data: responseJson.feed});
			}else if(responseJson.status=="invalid_token"){
				alert("You cannot view feed: Invalid token.");
			}else if(responseJson.status=="empty"){
				//display empty page
			}
		})
		.catch((error) => {
			this.setState({loaded: false});
			alert("Something went wrong: " + error.message );
		});
	}
	render() {
		return(
			<Content>{this.props.dpmode==1?<Uploadselfie albumid='1' />:<Text></Text>}{this.state.loaded?<FeedData userid={this.state.userid} utoken={this.state.userToken} data={this.state.data}/>:<ActivityIndicator size="large"/>}</Content>
		)
	}
}

AppRegistry.registerComponent('Feed', () => Feed);
