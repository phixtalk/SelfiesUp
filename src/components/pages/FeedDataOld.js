import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  AsyncStorage,
  Image,
  View,
  TouchableHighlight 
} from 'react-native';
import { Container, Header, Content, Card, CardItem, ListItem, List, Thumbnail, Text, Button, Icon, Left, Body, Right } from 'native-base';

import {Actions} from 'react-native-router-flux';
import FitImage from 'react-native-fit-image';
//import TimeAgo from 'react-native-timeago';

import base_url from '../../serverurl';

import {ContentSnippet, GetImage} from '../../helpers/helpers';

export default class FeedData extends Component {
	
	constructor(props){
		super(props);
		this.state = {
		  uemail: '',
		  ustatus: '',
		  unames:'',
		  userToken:this.props.utoken,
		  userid:this.props.userid,
		  loaded: false
		}
	}	
	gotoProfile = (uid,uname,ustatus,upic) => {
		AsyncStorage.setItem('thisuserid',uid);
		AsyncStorage.setItem('thisusernames', uname);
		AsyncStorage.setItem('thisuserstatus', ustatus);
		AsyncStorage.setItem('thisuserphoto', upic);
		if(upic===null||upic==""){
			AsyncStorage.setItem('thisuserphoto', '');
		}
		Actions.Page();
	}
	gotoPicture = (uid,upic,uname,profilepic,picdescribe,picmode) => {
		AsyncStorage.setItem('pictureid',uid);
		AsyncStorage.setItem('pictureurl', upic);
		AsyncStorage.setItem('ownername', uname);
		AsyncStorage.setItem('ownerpic', profilepic);
		AsyncStorage.setItem('picdescription', picdescribe);
		AsyncStorage.setItem('picmode', picmode);
		if(profilepic===null||profilepic==""){
			AsyncStorage.setItem('ownerpic', '');
		}
		if(picmode==1){
			Actions.Picture();
		}else{//profile picture
			if(profilepic===null||profilepic==""){
			}else{
				Actions.Picture();
			}
		}
	}
	handleAction = (sid,mode,thisuser,thistoken,useraction) => {
		let data = {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				user_id: thisuser,
				user_token: thistoken,
				selfieid: sid,
				actionmode: mode,
				uaction: useraction
			}),
		}
		fetch(base_url+'api/feedaction', data)
		.then((response) => response.json())
		.then((responseJson) => {
			if(responseJson.status=="success"){
				
			}else if(responseJson.status=="invalid_token"){
				alert("You cannot update status: Invalid token.");
			}else if(responseJson.status=="failure"){
				alert("Something went wrong. Please try later.");
			}
		})
		.catch((error) => {
			alert("Something went wrong: " + error.message );
		});
	}
	
	renderItems(articleData) {
		let myuser = this.props.userid;
		let mytoken = this.props.utoken;
		return (
			<Card style={{flex: 0}} key={articleData.id}>
				<CardItem>
				  <Left>
					<TouchableHighlight onPress={() => this.gotoPicture(articleData.id,articleData.pictureurl,articleData.usernames,articleData.pictureurl,"","2")}>
						<Thumbnail source={
							articleData.pictureurl!=null?{uri: base_url+'assets/photos/'+articleData.pictureurl}:require('../../img/photos/no-image.png')
						}/>
					</TouchableHighlight>
					<Body>
					  <Text onPress={() => this.gotoProfile(articleData.userid,articleData.usernames,articleData.userstatus,articleData.pictureurl)}>{articleData.usernames}</Text>
					  <Text note>{articleData.userstatus}</Text>
					</Body>
				  </Left>
				</CardItem>
				<TouchableHighlight onPress={() => this.gotoPicture(articleData.id,articleData.selfieurl,articleData.usernames,articleData.pictureurl,articleData.description,"1")}>	
					<CardItem cardBody>
						<FitImage
						  source={{ uri: base_url+'assets/selfies/'+articleData.selfieurl }}
						  style={styles.fitImage}
						/>
					</CardItem>
				</TouchableHighlight >
				<CardItem>
				  <Body>
					<Text>{articleData.description}</Text>
				  </Body>
				</CardItem>
				<CardItem>
				  <Left>
					<Button key={"btnhype"+articleData.id} transparent onPress={() => this.handleAction(articleData.id,"1",myuser,mytoken,articleData.havehype==null?"1":"2")}>
					  <Icon name="heart" style={{ color: articleData.havehype!=null?"#ED4A6A":"#000000" }} />
					  <Text key={"txthype"+articleData.id}>{articleData.counthype} Hypes</Text>
					</Button>
				  </Left>
				  <Left>
					<Button key={"btncast"+articleData.id} transparent onPress={() => this.handleAction(articleData.id,"2",myuser,mytoken,articleData.havecast==null?"1":"2")}>
					  <Icon active name="thumbs-down" style={{ color: articleData.havecast!=null?"#007AFF":"#000000" }} />
					  <Text key={"txtcast"+articleData.id}>{articleData.countcast} Casts</Text>
					</Button>
				  </Left>
				  <Left>
					<TouchableHighlight>
						<Text key={"txtview"+articleData.id} style={{color:"#007AFF"}}>{articleData.viewcount} Views</Text>
					</TouchableHighlight>
				  </Left>
				</CardItem>
			</Card>
		)
	}
	renderListItems = () => {
		return this.props.data.map((p) => (
			this.renderItems(p)
		))
	}
	
	
	render() {
		let myuser = this.props.userid;
		let mytoken = this.props.utoken;
		
		return (
			<Content>{this.renderListItems()}</Content>
		);
	}
}
var styles = StyleSheet.create({
  fitImage: {
    borderRadius: 20,
  },
  fitImageWithSize: {
    height: 100,
    width: 30,
  },
});
AppRegistry.registerComponent('FeedData', () => FeedData);
