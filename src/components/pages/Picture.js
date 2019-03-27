/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  Image,
  AsyncStorage,
  ActivityIndicator,
  InteractionManager
} from 'react-native';
import { Container, Content, List, ListItem, Thumbnail, Left, Body, Right } from 'native-base';
import FitImage from 'react-native-fit-image';

import base_url from '../../serverurl';

export default class Picture extends Component {
	constructor(props){
		super(props);
		this.state = {
			userToken:'',
			userid:'',
			pictureid:'',
			pictureurl:'',
			picdescription:'',
			ownername: '',
			ownerpic: '',
			directory: '',
			loaded: false
		}
	}
	
	componentWillMount(){
		
		AsyncStorage.multiGet(['id_token', 'userid', 'pictureid', 'pictureurl', 'ownername','ownerpic','picdescription', 'picmode']).then((data) => {
			let idtoken = data[0][1];
			let userid = data[1][1];
			let pictureid = data[2][1];
			let pictureurl = data[3][1];
			let ownername = data[4][1];
			let ownerpic = data[5][1];
			let picdescription = data[6][1];
			let picmode = data[7][1];
			
			if(picmode==1){//dont increment view count for profile picture
				this.setState({directory:'selfies'});
			}else{
				this.setState({directory:'photos'});
			}
			this.setState({
				userToken:idtoken,
				userid:userid,
				pictureid:pictureid,
				pictureurl:pictureurl,
				ownername: ownername,
				ownerpic: ownerpic,
				picdescription:picdescription,
				//loaded: true
			});//   
			if(picmode==1){//dont increment view count for profile picture
				this.increaseViewsCounter();
			}
		});
		
			
		//delay showing some data, until all interactions have rendered
		InteractionManager.runAfterInteractions(() => {
			this.setState({
				loaded: true
			});// 
		});
	}
	
	increaseViewsCounter() {
		let userdata = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: this.state.userid,
				user_token: this.state.userToken,
				postid: this.state.pictureid
			}),
		}
		fetch(base_url+'api/photoview', userdata)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				//alert("success");
			}else if(responseJson.status=="invalid_token"){
				//alert("You cannot view feed: Invalid token.");
			}else if(responseJson.status=="failure"){
				//alert("Could not update view count.");
			}
		})
		.catch((error) => {
			//alert("Something went wrong: " + error.message );
		});
	}
	/*
			<Image
				  style={{flex:1, height: 200, width: 300}}
				  source={{ uri: base_url+'assets/'+this.state.directory+'/'+this.state.pictureurl }}
				  resizeMode="contain"
				/>
			
	*/
	render() {
		
		let loadPicture = this.state.loaded?
			<FitImage
				  source={{ uri: base_url+'assets/'+this.state.directory+'/'+this.state.pictureurl }}
				  style={{borderRadius: 20}}
				/>
			:
			<ActivityIndicator size="large"/>
			
		return (
			<Container style={{backgroundColor: '#000000'}}>
				<Content>
					<View>
						<List style={styles.listholder}>
							<ListItem avatar>
								<Left>
									<Thumbnail source={
										this.state.ownerpic===null||this.state.ownerpic==""?
										require('../../img/photos/no-image.png')
										:
										{uri: base_url+'assets/photos/'+this.state.ownerpic}
										} />
								</Left>
								<Body>
									<Text style={styles.welcome}>
										{this.state.ownername}
									</Text>
									<Text style={{color: '#FFFFFF'}} note>{this.state.picdescription}</Text>
								</Body>
								<Right>
									<Text note>3:43 pm</Text>
								</Right>
							</ListItem>
						</List>
						{loadPicture}
					</View>
				</Content>
			</Container>
		);
	}
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  welcome: {
    fontSize: 20,
	color: '#FFFFFF',
  },
  listholder: {
    marginTop:70,
	marginBottom: 50,
  },
});
AppRegistry.registerComponent('Picture', () => Picture);